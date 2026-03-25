/**
 * compile-calendar.js
 * Pulls events from Google Calendar + Notion and outputs a merged .ics file.
 *
 * Setup:
 *   1. cp .env.example .env  (fill in your credentials)
 *   2. npm install
 *   3. node setup-google-auth.js  (one-time OAuth flow)
 *   4. npm run compile
 */

require('dotenv').config();
const { google } = require('googleapis');
const { Client: NotionClient } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Config ──────────────────────────────────────────────────────────────────

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALENDAR_IDS = 'primary',
  NOTION_TOKEN,
  NOTION_DATABASE_IDS = '',
  DAYS_PAST = '30',
  DAYS_FUTURE = '90',
  OUTPUT_FILE = '../compiled-calendar.ics',
} = process.env;

const TOKEN_PATH = path.join(__dirname, 'token.json');
const OUTPUT_PATH = path.resolve(__dirname, OUTPUT_FILE);

const now = new Date();
const timeMin = new Date(now);
timeMin.setDate(timeMin.getDate() - parseInt(DAYS_PAST));
const timeMax = new Date(now);
timeMax.setDate(timeMax.getDate() + parseInt(DAYS_FUTURE));

// ── Helpers ──────────────────────────────────────────────────────────────────

function uid(source, id) {
  return crypto.createHash('md5').update(`${source}-${id}`).digest('hex') + '@compiled-calendar';
}

/** Format a JS Date to ICS UTC timestamp: 20240315T120000Z */
function toICSDate(date, allDay = false) {
  if (allDay) {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Escape special characters for ICS text fields */
function icsEscape(str = '') {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** Fold long ICS lines at 75 chars */
function foldLine(line) {
  const chunks = [];
  while (line.length > 75) {
    chunks.push(line.slice(0, 75));
    line = ' ' + line.slice(75);
  }
  chunks.push(line);
  return chunks.join('\r\n');
}

function buildICSEvent(event) {
  const lines = ['BEGIN:VEVENT'];

  lines.push(`UID:${event.uid}`);
  lines.push(`DTSTAMP:${toICSDate(new Date())}`);
  lines.push(`SUMMARY:${icsEscape(event.title)}`);

  if (event.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${toICSDate(event.start, true)}`);
    const endDate = new Date(event.end || event.start);
    endDate.setDate(endDate.getDate() + 1);
    lines.push(`DTEND;VALUE=DATE:${toICSDate(endDate, true)}`);
  } else {
    lines.push(`DTSTART:${toICSDate(event.start)}`);
    lines.push(`DTEND:${toICSDate(event.end || new Date(event.start.getTime() + 3600000))}`);
  }

  if (event.description) lines.push(`DESCRIPTION:${icsEscape(event.description)}`);
  if (event.location) lines.push(`LOCATION:${icsEscape(event.location)}`);
  if (event.url) lines.push(`URL:${event.url}`);
  lines.push(`CATEGORIES:${icsEscape(event.source)}`);
  lines.push('END:VEVENT');

  return lines.map(foldLine).join('\r\n');
}

function buildICS(events) {
  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Peak Aquatic Sports//Calendar Compiler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Compiled Schedule`,
    `X-WR-TIMEZONE:UTC`,
  ].join('\r\n');

  const footer = 'END:VCALENDAR';
  const body = events.map(buildICSEvent).join('\r\n');

  return `${header}\r\n${body}\r\n${footer}`;
}

// ── Google Calendar ───────────────────────────────────────────────────────────

async function getGoogleAuth() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env');
  }

  const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
  );

  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error(`No token.json found. Run: node setup-google-auth.js`);
  }

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(token);

  // Auto-refresh token if expired
  oAuth2Client.on('tokens', (tokens) => {
    const updated = { ...token, ...tokens };
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(updated, null, 2));
  });

  return oAuth2Client;
}

async function fetchGoogleEvents() {
  console.log('Fetching Google Calendar events...');
  const auth = await getGoogleAuth();
  const calendar = google.calendar({ version: 'v3', auth });
  const calendarIds = GOOGLE_CALENDAR_IDS.split(',').map((s) => s.trim());
  const allEvents = [];

  for (const calId of calendarIds) {
    let pageToken;
    do {
      const res = await calendar.events.list({
        calendarId: calId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250,
        pageToken,
      });

      const items = res.data.items || [];
      for (const item of items) {
        const isAllDay = Boolean(item.start?.date);
        const start = new Date(item.start?.dateTime || item.start?.date);
        const end = new Date(item.end?.dateTime || item.end?.date);

        allEvents.push({
          uid: uid('google', item.id),
          source: 'Google Calendar',
          title: item.summary || '(No title)',
          start,
          end,
          allDay: isAllDay,
          description: item.description || '',
          location: item.location || '',
          url: item.htmlLink || '',
        });
      }

      pageToken = res.data.nextPageToken;
    } while (pageToken);

    console.log(`  ✓ ${calId}: fetched events`);
  }

  return allEvents;
}

// ── Notion Calendar ───────────────────────────────────────────────────────────

/**
 * Tries to extract date/title from common Notion calendar database property names.
 * Adjust the property names below to match your Notion database columns.
 */
function parseNotionEvent(page, dbId) {
  const props = page.properties;

  // Title — try common names
  const titleProp =
    props['Name'] || props['Title'] || props['Event'] || props['Task'] ||
    Object.values(props).find((p) => p.type === 'title');
  const title = titleProp?.title?.map((t) => t.plain_text).join('') || '(No title)';

  // Date — try common names
  const dateProp =
    props['Date'] || props['When'] || props['Start'] || props['Scheduled'] ||
    props['Due'] || props['Due Date'] || props['Event Date'] ||
    Object.values(props).find((p) => p.type === 'date');

  if (!dateProp?.date?.start) return null;

  const startStr = dateProp.date.start;
  const endStr = dateProp.date.end;
  const isAllDay = !startStr.includes('T');

  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : new Date(start);
  if (!endStr && !isAllDay) end.setHours(end.getHours() + 1);

  // Description
  const descProp =
    props['Description'] || props['Notes'] || props['Details'] ||
    Object.values(props).find((p) => p.type === 'rich_text');
  const description = descProp?.rich_text?.map((t) => t.plain_text).join('') || '';

  // Location
  const locProp = props['Location'] || props['Where'];
  const location = locProp?.rich_text?.map((t) => t.plain_text).join('') || '';

  return {
    uid: uid('notion', page.id),
    source: 'Notion',
    title,
    start,
    end,
    allDay: isAllDay,
    description,
    location,
    url: page.url || '',
  };
}

async function fetchNotionEvents() {
  if (!NOTION_TOKEN) {
    console.warn('NOTION_TOKEN not set — skipping Notion.');
    return [];
  }

  const dbIds = NOTION_DATABASE_IDS.split(',').map((s) => s.trim()).filter(Boolean);
  if (!dbIds.length) {
    console.warn('NOTION_DATABASE_IDS not set — skipping Notion.');
    return [];
  }

  console.log('Fetching Notion calendar events...');
  const notion = new NotionClient({ auth: NOTION_TOKEN });
  const allEvents = [];

  for (const dbId of dbIds) {
    let cursor;
    do {
      const res = await notion.databases.query({
        database_id: dbId,
        filter: {
          and: [
            {
              or: [
                { property: 'Date', date: { on_or_after: timeMin.toISOString() } },
                { property: 'When', date: { on_or_after: timeMin.toISOString() } },
                { property: 'Start', date: { on_or_after: timeMin.toISOString() } },
                { property: 'Scheduled', date: { on_or_after: timeMin.toISOString() } },
                { property: 'Due', date: { on_or_after: timeMin.toISOString() } },
                { property: 'Due Date', date: { on_or_after: timeMin.toISOString() } },
                { property: 'Event Date', date: { on_or_after: timeMin.toISOString() } },
              ],
            },
          ],
        },
        start_cursor: cursor,
        page_size: 100,
      });

      for (const page of res.results) {
        const event = parseNotionEvent(page, dbId);
        if (event && event.start <= timeMax) {
          allEvents.push(event);
        }
      }

      cursor = res.next_cursor;
    } while (cursor);

    console.log(`  ✓ ${dbId}: fetched events`);
  }

  return allEvents;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nCalendar Compiler`);
  console.log(`Range: ${timeMin.toDateString()} → ${timeMax.toDateString()}\n`);

  let googleEvents = [];
  let notionEvents = [];

  try {
    googleEvents = await fetchGoogleEvents();
  } catch (err) {
    console.warn(`Google Calendar skipped: ${err.message}`);
  }

  try {
    notionEvents = await fetchNotionEvents();
  } catch (err) {
    console.warn(`Notion skipped: ${err.message}`);
  }

  const allEvents = [...googleEvents, ...notionEvents].sort((a, b) => a.start - b.start);

  if (!allEvents.length) {
    console.error('\nNo events found. Check your credentials and date range.');
    process.exit(1);
  }

  const ics = buildICS(allEvents);
  fs.writeFileSync(OUTPUT_PATH, ics, 'utf8');

  console.log(`\nSummary:`);
  console.log(`  Google Calendar: ${googleEvents.length} events`);
  console.log(`  Notion:          ${notionEvents.length} events`);
  console.log(`  Total:           ${allEvents.length} events`);
  console.log(`\nOutput: ${OUTPUT_PATH}`);
  console.log('\nImport the .ics file into Apple Calendar, Google Calendar, Outlook, etc.');
}

main().catch((err) => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
