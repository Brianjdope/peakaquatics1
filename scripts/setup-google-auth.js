/**
 * One-time Google OAuth setup. Run: node setup-google-auth.js
 * This saves a token.json file used by compile-calendar.js.
 */
require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const http = require('http');
const path = require('path');

const TOKEN_PATH = path.join(__dirname, 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

async function main() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error('ERROR: Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in scripts/.env');
    process.exit(1);
  }

  // Google blocked the out-of-band (copy/paste code) flow in 2023, so receive
  // the code on a loopback redirect instead. Requires a "Desktop app" OAuth client.
  const server = http.createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const redirectUri = `http://127.0.0.1:${server.address().port}`;

  const oAuth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });

  console.log('\nOpen this URL in your browser and authorize access:\n');
  console.log(authUrl);
  console.log('\nWaiting for the redirect...');

  server.on('request', async (req, res) => {
    const url = new URL(req.url, redirectUri);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    if (!code && !error) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(code ? 'Authorized. You can close this tab.' : `Authorization failed: ${error}`);
    server.close();

    if (!code) {
      console.error('Authorization failed:', error);
      process.exit(1);
    }
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
      console.log(`\nToken saved to ${TOKEN_PATH}`);
      console.log('You can now run: npm run compile');
    } catch (err) {
      console.error('Error retrieving token:', err.message);
      process.exit(1);
    }
  });
}

main();
