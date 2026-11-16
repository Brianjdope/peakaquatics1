// Regression tests for scripts/google-apps-script.js.
// The script runs in a Node vm with in-memory fakes for every Google service
// it touches (Sheets, Gmail, Drive, Script Properties, UrlFetch), so no live
// Google service is ever called.
const test = require('node:test')
const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const SCRIPT = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'google-apps-script.js'), 'utf8')
const ADMIN_SECRET = 'test-admin-secret-0123456789abcdef'
const IG_TOKEN = 'EAAG-test-long-lived-token'
const DRIVE_FOLDER_ID = '1c1qGAl8bpEuTMhZQZfi1o4czcB-d4b2H'

function makeSheet() {
  const rows = [['Day/Time', 'Session', 'Members', 'Skill Level', 'Status', 'Booking ID', 'Email', 'Phone']]
  const ensure = (r) => { while (rows.length < r) rows.push(Array(8).fill('')) }
  const range = (r, c) => ({
    setValue(v) { ensure(r); rows[r - 1][c - 1] = v; return this },
    setValues(vs) { vs.forEach((row, i) => { ensure(r + i); row.forEach((v, j) => { rows[r - 1 + i][c - 1 + j] = v }) }); return this },
    getValue() { return rows[r - 1][c - 1] },
    setBackground() { return this },
    setFontColor() { return this },
    setFontWeight() { return this },
  })
  return {
    rows,
    getName: () => 'Sheet1',
    getDataRange: () => ({ getValues: () => rows.map((r) => r.slice()) }),
    appendRow(r) { rows.push(r.concat(Array(8 - r.length).fill(''))) },
    getLastRow: () => rows.length,
    getRange: (r, c) => range(r, c),
  }
}

function makeDrive() {
  const files = new Map()
  const folder = {
    getId: () => DRIVE_FOLDER_ID,
    createFile(blob) {
      const id = 'file-' + (files.size + 1)
      const file = {
        blob,
        sharing: [],
        getId: () => id,
        getUrl: () => 'https://drive.google.com/file/d/' + id + '/view',
        setSharing(access, permission) { this.sharing.push([access, permission]); return this },
        getParents() { let done = false; return { hasNext: () => !done, next: () => { done = true; return folder } } },
      }
      files.set(id, file)
      return file
    },
  }
  return {
    files,
    DriveApp: {
      getFolderById: (id) => { assert.equal(id, DRIVE_FOLDER_ID); return folder },
      getFileById: (id) => { if (!files.has(id)) throw new Error('No file ' + id); return files.get(id) },
      Access: { ANYONE_WITH_LINK: 'ANYONE_WITH_LINK', PRIVATE: 'PRIVATE' },
      Permission: { VIEW: 'VIEW', NONE: 'NONE' },
    },
  }
}

function load({ adminSecret = ADMIN_SECRET } = {}) {
  const sheet = makeSheet()
  const drive = makeDrive()
  const mails = []
  const fetches = []
  const props = { IG_ACCESS_TOKEN: IG_TOKEN }
  if (adminSecret !== null) props.ADMIN_SECRET = adminSecret
  const ctx = {
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => sheet }) },
    GmailApp: { sendEmail: (to, subject, body, opts) => mails.push({ to, subject, body, html: opts && opts.htmlBody }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = v } }) },
    ContentService: { createTextOutput: (s) => ({ setMimeType: () => JSON.parse(s) }), MimeType: { JSON: 'json' } },
    Utilities: {
      getUuid: () => crypto.randomUUID(),
      base64Decode: (s) => Array.from(Buffer.from(s, 'base64')),
      newBlob: (bytes, type, name) => ({ bytes, type, name }),
      sleep() {},
    },
    UrlFetchApp: {
      fetch(url, opts) {
        fetches.push({ url, opts })
        const body = url.includes('/media_publish') ? { id: 'ig-post-1' } : url.includes('/media') ? { id: 'ig-container-1' } : {}
        return {
          getResponseCode: () => 200,
          getContentText: () => JSON.stringify(body),
          getHeaders: () => ({ Location: 'https://upload.example/session-1' }),
        }
      },
    },
    ScriptApp: { getOAuthToken: () => 'oauth-token' },
    DriveApp: drive.DriveApp,
    Logger: { log() {} },
  }
  vm.createContext(ctx)
  vm.runInContext(SCRIPT, ctx)
  const post = (data) => ctx.doPost({ postData: { contents: JSON.stringify(data) } })
  const get = (parameter) => ctx.doGet({ parameter })
  const book = (overrides = {}) => post({
    action: 'book', name: 'Parent One', email: 'one@family.com', phone: '201-555-0101',
    session: 'Video Review', date: 'November 2, 2026', time: '1:30 PM', ...overrides,
  })
  return { ctx, sheet, drive, mails, fetches, props, post, get, book }
}

const b64 = (bytes) => Buffer.alloc(bytes, 1).toString('base64')

test('getInstagramConfig is gone and never returns the token', () => {
  const { post } = load()
  for (const adminSecret of [undefined, ADMIN_SECRET]) {
    const res = post({ action: 'getInstagramConfig', adminSecret })
    assert.equal(res.success, false)
    assert.ok(!JSON.stringify(res).includes(IG_TOKEN))
  }
})

test('admin actions are refused without the right secret', () => {
  const { post, props, drive, fetches } = load()
  for (const adminSecret of [undefined, '', 'wrong', ADMIN_SECRET + 'x', ADMIN_SECRET.slice(0, -1)]) {
    assert.equal(post({ action: 'verifyAdmin', adminSecret }).success, false)
    assert.equal(post({ action: 'setInstagramToken', adminSecret, longLivedToken: 'attacker' }).success, false)
    assert.equal(post({ action: 'postToInstagram', adminSecret, imageUrl: 'https://x/y.jpg', caption: 'hi' }).success, false)
    assert.equal(post({ action: 'uploadImage', adminSecret, fileName: 'a.jpg', contentType: 'image/jpeg', imageBase64: b64(10) }).success, false)
  }
  assert.equal(props.IG_ACCESS_TOKEN, IG_TOKEN)
  assert.equal(drive.files.size, 0)
  assert.equal(fetches.length, 0)
})

test('admin actions are refused when ADMIN_SECRET is unset or too short', () => {
  for (const adminSecret of [null, '', 'short-secret']) {
    const { post } = load({ adminSecret })
    const res = post({ action: 'verifyAdmin', adminSecret: adminSecret || '' })
    assert.equal(res.success, false)
    assert.match(res.error, /not configured/)
  }
})

test('admin secret unlocks verify, token save and server-side posting', () => {
  const { post, props, fetches } = load()
  assert.deepEqual(post({ action: 'verifyAdmin', adminSecret: ADMIN_SECRET }), { success: true })
  assert.equal(post({ action: 'setInstagramToken', adminSecret: ADMIN_SECRET, longLivedToken: 'new-token' }).success, true)
  assert.equal(props.IG_ACCESS_TOKEN, 'new-token')

  const res = post({ action: 'postToInstagram', adminSecret: ADMIN_SECRET, imageUrl: 'https://site/x.jpg', caption: 'Caption' })
  assert.equal(res.success, true)
  assert.ok(!JSON.stringify(res).includes('new-token'))
  assert.equal(fetches.length, 2)
  assert.equal(JSON.parse(fetches[0].opts.payload).image_url, 'https://site/x.jpg')
  assert.equal(JSON.parse(fetches[0].opts.payload).access_token, 'new-token')
})

test('uploaded images stay private except while being posted', () => {
  const { post, drive, fetches } = load()
  const up = post({ action: 'uploadImage', adminSecret: ADMIN_SECRET, fileName: 'a.jpg', contentType: 'image/jpeg', imageBase64: b64(1000) })
  assert.equal(up.success, true)
  assert.ok(up.imageFileId)
  assert.equal(up.imageUrl, undefined)
  const file = drive.files.get(up.imageFileId)
  assert.deepEqual(file.sharing, [])

  const res = post({ action: 'postToInstagram', adminSecret: ADMIN_SECRET, imageFileId: up.imageFileId, caption: 'Caption' })
  assert.equal(res.success, true)
  assert.equal(JSON.parse(fetches[0].opts.payload).image_url, 'https://lh3.googleusercontent.com/d/' + up.imageFileId)
  assert.deepEqual(file.sharing, [['ANYONE_WITH_LINK', 'VIEW'], ['PRIVATE', 'NONE']])

  assert.equal(post({ action: 'postToInstagram', adminSecret: ADMIN_SECRET, imageFileId: 'nope', caption: 'x' }).success, false)
})

test('image upload enforces type and size limits', () => {
  const { post, drive } = load()
  const base = { action: 'uploadImage', adminSecret: ADMIN_SECRET, fileName: 'a' }
  assert.equal(post({ ...base, contentType: 'text/html', imageBase64: b64(10) }).success, false)
  assert.equal(post({ ...base, contentType: '', imageBase64: b64(10) }).success, false)
  assert.equal(post({ ...base, contentType: 'image/png', imageBase64: b64(8 * 1024 * 1024 + 1) }).success, false)
  assert.equal(drive.files.size, 0)
  assert.equal(post({ ...base, contentType: 'image/png', imageBase64: b64(8 * 1024 * 1024) }).success, true)
})

test('lookup needs the exact booking ID and email and never lists by email alone', () => {
  const { book, get } = load()
  const a = book().bookingId
  const b = book({ name: 'Parent Two', email: 'two@family.com', time: '9:00 AM' }).bookingId
  assert.match(a, /^PAS-[0-9A-Z]{5}-[0-9A-F]{8}$/)

  assert.equal(get({ action: 'lookup', email: '@' }).success, false)
  assert.equal(get({ action: 'lookup', email: 'one@family.com' }).success, false)
  assert.deepEqual(get({ action: 'lookup', email: '@', bookingId: a }).bookings, [])
  assert.deepEqual(get({ action: 'lookup', email: 'one@family.co', bookingId: a }).bookings, [])
  assert.deepEqual(get({ action: 'lookup', email: 'one@family.com', bookingId: a.slice(0, -1) }).bookings, [])
  assert.deepEqual(get({ action: 'lookup', email: 'one@family.com', bookingId: b }).bookings, [])

  const found = get({ action: 'lookup', email: '  ONE@Family.com ', bookingId: a }).bookings
  assert.equal(found.length, 1)
  assert.equal(found[0].bookingId, a)
  assert.equal(found[0].session, 'Video Review')
})

test('cancel needs the exact booking ID and email; the bypass email is gone', () => {
  const { book, post, sheet } = load()
  const a = book().bookingId
  sheet.appendRow(['Recurring - Monday at 2:30 PM', 'Private Session', 'Client', '', 'Confirmed', 'PAS-RECUR-AAAAAAAA', ''])

  for (const attempt of [
    { bookingId: a, email: '@' },
    { bookingId: a, email: 'one@family.co' },
    { bookingId: a, email: 'recurring@peakaquatic.com' },
    { bookingId: 'PAS-', email: 'recurring@peakaquatic.com' },
    { bookingId: 'PAS-RECUR-AAAAAAAA', email: 'recurring@peakaquatic.com' },
    { bookingId: 'PAS-RECUR-AAAAAAAA', email: '' },
    { bookingId: a.slice(0, -2), email: 'one@family.com' },
  ]) {
    assert.equal(post({ action: 'cancel', ...attempt }).success, false, JSON.stringify(attempt))
  }
  assert.ok(sheet.rows.every((r) => r[4] !== 'Cancelled'))

  assert.equal(post({ action: 'cancel', bookingId: a, email: 'One@Family.com' }).success, true)
  assert.equal(sheet.rows.find((r) => r[5] === a)[4], 'Cancelled')
})

test('customer input is HTML-escaped in emails', () => {
  const { book, mails } = load()
  book({ name: '<a href="https://evil.example/pay">Click</a>', email: 'victim@example.org', skillLevel: '<img src=x onerror=alert(1)>' })
  const mail = mails.find((m) => m.to === 'victim@example.org')
  assert.ok(mail)
  assert.ok(!mail.html.includes('<a href="https://evil.example'))
  assert.ok(!mail.html.includes('<img src=x'))
  assert.ok(mail.html.includes('&lt;a href=&quot;https://evil.example/pay&quot;&gt;Click&lt;/a&gt;'))
  assert.ok(mail.html.includes('#cancel?id='), 'cancel link still present')
})

test('video upload needs an active booking, a video type and a size limit, and is never shared', () => {
  const { book, post, drive, mails, sheet } = load()
  const id = book().bookingId
  const base = { action: 'uploadVideo', fileName: 'swim.mp4', contentType: 'video/mp4', videoBase64: b64(1000) }

  assert.equal(post({ ...base }).success, false)
  assert.equal(post({ ...base, bookingId: 'PAS-NOPE-00000000' }).success, false)
  assert.equal(post({ ...base, bookingId: id.slice(0, -1) }).success, false)
  assert.equal(post({ ...base, bookingId: id, contentType: 'text/html' }).success, false)
  assert.equal(post({ ...base, bookingId: id, videoBase64: b64(35 * 1024 * 1024 + 1) }).success, false)
  assert.equal(drive.files.size, 0)

  mails.length = 0
  const res = post({ ...base, bookingId: id })
  assert.equal(res.success, true)
  const file = [...drive.files.values()][0]
  assert.deepEqual(file.sharing, [])
  assert.ok(mails.some((m) => m.body.includes(file.getUrl())), 'coach notified with the video link')

  sheet.rows.find((r) => r[5] === id)[4] = 'Cancelled'
  assert.equal(post({ ...base, bookingId: id }).success, false)
})

test('direct upload URL needs an active booking and declares type and size to Drive', () => {
  const { book, post, fetches } = load()
  const id = book().bookingId
  const base = { action: 'getUploadUrl', fileName: 'swim.mov', contentType: 'video/quicktime', fileSize: 1024 }

  assert.equal(post({ ...base }).success, false)
  assert.equal(post({ ...base, bookingId: 'PAS-NOPE-00000000' }).success, false)
  assert.equal(post({ ...base, bookingId: id, contentType: 'application/zip' }).success, false)
  assert.equal(post({ ...base, bookingId: id, fileSize: 200 * 1024 * 1024 + 1 }).success, false)
  assert.equal(post({ ...base, bookingId: id, fileSize: 0 }).success, false)
  assert.equal(fetches.length, 0)

  const res = post({ ...base, bookingId: id })
  assert.equal(res.success, true)
  assert.equal(res.uploadUrl, 'https://upload.example/session-1')
  const { opts } = fetches[0]
  assert.equal(JSON.parse(opts.payload).mimeType, 'video/quicktime')
  assert.equal(opts.headers['X-Upload-Content-Type'], 'video/quicktime')
  assert.equal(opts.headers['X-Upload-Content-Length'], '1024')
})
