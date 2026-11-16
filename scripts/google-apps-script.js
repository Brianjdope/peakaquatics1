// ============================================================
// PEAK AQUATIC SPORTS — Google Apps Script
// Full booking + cancellation + lookup + schedule management
// ============================================================
//
// HOW TO SET UP:
// 1. Create a new Google Sheet named "Peak Aquatic Bookings"
// 2. Extensions → Apps Script → delete existing code → paste this file
// 3. Run setupSheet() once to create headers + formatting
// 4. Run populateSchedule() once to load recurring clients
// 5. Project Settings → Script Properties → add ADMIN_SECRET
//    - A long random value (at least 16 characters; 32+ recommended).
//    - The admin page (#admin) asks for it, and every admin action
//      (Instagram token, Instagram posting, image upload) is refused
//      without it. Never commit the value to the repo.
//    - IG_ACCESS_TOKEN is stored here too, via the admin page.
// 6. Deploy → New deployment → Web app
//    - Execute as: Me  /  Who has access: Anyone
// 7. Copy the Web App URL → paste into BookingCalendar.jsx as SHEETS_API
// 8. After any script change: Deploy → New deployment (never edit existing)
//
// COLUMN LAYOUT (A–H):
//   A: Day/Time  B: Session  C: Members  D: Skill Level
//   E: Status    F: Booking ID  G: Email  H: Phone
// ============================================================

var SHEET_NAME  = 'Sheet1'
var COACH_EMAIL = 'peakaquaticsports@gmail.com'
var SITE_URL    = 'https://brianjdope.github.io/peakaquatics1/'
var LOGO_URL    = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/7fd6ea37-8f94-4626-ac71-1fe5e214471e/peak-aquatic-primary-logo-black.png'

// Column indexes (0-based)
var COL = {
  DATETIME:   0,  // A
  SESSION:    1,  // B
  NAME:       2,  // C — Members
  SKILL:      3,  // D
  STATUS:     4,  // E
  BOOKING_ID: 5,  // F
  EMAIL:      6,  // G
  PHONE:      7,  // H
}

// =============================================================
// ENTRY POINTS
// =============================================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents)
    if (data.action === 'book')      return jsonResponse(handleBooking(data))
    if (data.action === 'cancel')    return jsonResponse(handleCancellation(data))
    if (data.action === 'uploadVideo')  return jsonResponse(handleVideoUpload(data))
    if (data.action === 'getUploadUrl') return jsonResponse(handleGetUploadUrl(data))
    // Admin actions: requireAdmin returns an error response unless the secret matches
    if (data.action === 'verifyAdmin')       return jsonResponse(requireAdmin(data) || { success: true })
    if (data.action === 'uploadImage')       return jsonResponse(requireAdmin(data) || handleImageUpload(data))
    if (data.action === 'setInstagramToken') return jsonResponse(requireAdmin(data) || handleSetInstagramToken(data))
    if (data.action === 'postToInstagram')   return jsonResponse(requireAdmin(data) || handlePostToInstagram(data))
    return jsonResponse({ success: false, error: 'Invalid action' })
  } catch (err) {
    return jsonResponse({ success: false, error: 'doPost error: ' + err.message })
  }
}

function doGet(e) {
  try {
    var action = e.parameter.action
    if (action === 'lookup')    return jsonResponse(handleLookup(e.parameter.email, e.parameter.bookingId))
    if (action === 'available') return jsonResponse(handleAvailability(e.parameter.date, e.parameter.day))
    return jsonResponse({ success: false, error: 'Invalid action' })
  } catch (err) {
    return jsonResponse({ success: false, error: 'doGet error: ' + err.message })
  }
}

// =============================================================
// AVAILABILITY — returns booked times for a given date + weekday
// Called by the booking calendar to grey out taken slots
// e.g. GET ?action=available&date=March 25, 2026&day=Wednesday
// =============================================================

function handleAvailability(date, day) {
  if (!date) return { success: false, error: 'Date is required.' }

  var sheet = getSheet()
  var rows  = sheet.getDataRange().getValues()
  var bookedSet = {}

  // All possible 30-min slots for duration expansion
  var allSlots = [
    '5:00 AM','5:30 AM','5:50 AM','6:00 AM','6:30 AM','7:00 AM','7:30 AM',
    '8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM',
    '11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM',
    '2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM',
    '5:00 PM','5:30 PM','6:00 PM','6:30 PM','7:00 PM','7:30 PM',
    '8:00 PM','8:30 PM','9:00 PM','9:30 PM'
  ]

  for (var i = 1; i < rows.length; i++) {
    var cellDateTime = rows[i][COL.DATETIME].toString()
    var cellStatus   = rows[i][COL.STATUS].toString()
    var cellSession  = rows[i][COL.SESSION].toString()
    if (cellStatus === 'Cancelled' || cellStatus === 'Open') continue

    var time = null

    // Match specific date (e.g. "March 25, 2026 at 2:00 PM")
    if (cellDateTime.indexOf(date) > -1) {
      var timeMatch = cellDateTime.match(/at (.+)$/)
      if (timeMatch) time = timeMatch[1].trim()
    }

    // Match recurring day (e.g. "Recurring - Wednesday at 2:00 PM")
    if (!time && day && cellDateTime.indexOf('Recurring - ' + day) > -1) {
      var recurMatch = cellDateTime.match(/at (.+)$/)
      if (recurMatch) time = recurMatch[1].trim()
    }

    if (time) {
      bookedSet[time] = true
      // Expand based on session duration (30-min slot increments)
      // Group/Semi-Group = 1.5 hr (block 2 extra slots)
      // Everything else  = 1 hr   (block 1 extra slot)
      var extraSlots = (cellSession === 'Group Session' || cellSession === 'Semi-Group') ? 2 : 1
      var idx = allSlots.indexOf(time)
      if (idx > -1) {
        for (var j = 1; j <= extraSlots; j++) {
          if (idx + j < allSlots.length) bookedSet[allSlots[idx + j]] = true
        }
      }
    }
  }

  var booked = Object.keys(bookedSet)
  return { success: true, booked: booked }
}

// =============================================================
// BOOKING
// Creates a row (or appends to group row), sends confirmation
// =============================================================

function handleBooking(data) {
  if (!data.email || !data.session || !data.date || !data.time) {
    return { success: false, error: 'Missing required fields (email, session, date, time).' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { success: false, error: 'Invalid email address.' }
  }

  var sheet = getSheet()
  var bookingId = generateId()
  var dateTime  = data.date + ' at ' + data.time
  var name      = data.name  || ''
  var skill     = data.skillLevel || ''

  // Server-side conflict check — block any session at an already-booked time
  var allRows = sheet.getDataRange().getValues()
  var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  var dateObj = new Date(data.date)
  var recurringKey = !isNaN(dateObj) ? 'Recurring - ' + dayNames[dateObj.getDay()] + ' at ' + data.time : ''
  for (var k = 1; k < allRows.length; k++) {
    var s = allRows[k][COL.STATUS].toString()
    if (s === 'Cancelled' || s === 'Open') continue
    var dt = allRows[k][COL.DATETIME].toString()
    if (dt === dateTime || (recurringKey && dt === recurringKey)) {
      return { success: false, error: 'This time slot is already taken. Please choose another time.' }
    }
  }

  // For group sessions, try to merge into existing row for same slot
  if (data.session === 'Group Session' || data.session === 'Semi-Group' || data.session === 'Dryland') {
    var rows = sheet.getDataRange().getValues()
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][COL.DATETIME] === dateTime && rows[i][COL.SESSION] === data.session && rows[i][COL.STATUS] !== 'Cancelled') {
        var existingNames = rows[i][COL.NAME].toString()
        var existingIds   = rows[i][COL.BOOKING_ID].toString()
        if (existingNames.indexOf(name) === -1) {
          sheet.getRange(i + 1, COL.NAME       + 1).setValue(existingNames ? existingNames + '\n' + name : name)
          sheet.getRange(i + 1, COL.BOOKING_ID + 1).setValue(existingIds   ? existingIds   + '\n' + bookingId  : bookingId)
        }
        try { sendConfirmationEmail(data, bookingId, dateTime) } catch(e) { Logger.log('Email send failed: ' + e.message + ' | stack: ' + (e.stack || '')) }
        try { notifyCoach(data, bookingId, dateTime, '') } catch(e) { Logger.log('Email send failed: ' + e.message + ' | stack: ' + (e.stack || '')) }
        return { success: true, bookingId: bookingId }
      }
    }
  }

  // New row
  var row = [
    dateTime,      // A: Day/Time
    data.session,  // B: Session
    name,          // C: Members
    skill,         // D: Skill Level
    'Confirmed',   // E: Status
    bookingId,     // F: Booking ID
    data.email,    // G: Email
    data.phone || '',  // H: Phone
  ]
  sheet.appendRow(row)
  var lastRow = sheet.getLastRow()
  colorRow(sheet, lastRow, data.session, 'Confirmed')
  sheet.getRange(lastRow, COL.BOOKING_ID + 1).setFontWeight('bold')

  try { sendConfirmationEmail(data, bookingId, dateTime) } catch(e) { Logger.log('Email send failed: ' + e.message + ' | stack: ' + (e.stack || '')) }
  try { notifyCoach(data, bookingId, dateTime, '') } catch(e) { Logger.log('Email send failed: ' + e.message + ' | stack: ' + (e.stack || '')) }
  return { success: true, bookingId: bookingId }
}

// =============================================================
// CANCELLATION
// Marks row Cancelled or removes member from group row
// =============================================================

function handleCancellation(data) {
  var bookingId = String(data.bookingId || '').trim()
  var email     = normalizeEmail(data.email)
  if (!bookingId || !email) {
    return { success: false, error: 'Booking ID and email are required.' }
  }

  var sheet = getSheet()
  var rows  = sheet.getDataRange().getValues()

  for (var i = 1; i < rows.length; i++) {
    var cellIds    = rows[i][COL.BOOKING_ID].toString()
    var cellStatus = rows[i][COL.STATUS].toString()

    if (!rowHasBookingId(rows[i], bookingId)) continue
    if (normalizeEmail(rows[i][COL.EMAIL]) !== email) continue
    if (cellStatus === 'Cancelled') return { success: false, error: 'Booking already cancelled.' }

    var names = rows[i][COL.NAME].toString().split('\n')
    var ids   = cellIds.split('\n')

    if (ids.length > 1) {
      // Group row — remove just this member
      var idx = ids.map(function(x) { return x.trim() }).indexOf(bookingId)
      if (idx > -1) {
        names.splice(idx, 1)
        ids.splice(idx, 1)
        sheet.getRange(i + 1, COL.NAME       + 1).setValue(names.join('\n'))
        sheet.getRange(i + 1, COL.BOOKING_ID + 1).setValue(ids.join('\n'))
      }
    } else {
      // Solo row — mark cancelled
      sheet.getRange(i + 1, COL.STATUS + 1).setValue('Cancelled')
      colorRow(sheet, i + 1, rows[i][COL.SESSION], 'Cancelled')
    }

    try { notifyCoachCancellation(rows[i]) } catch(e) { Logger.log('Email send failed: ' + e.message + ' | stack: ' + (e.stack || '')) }
    try { sendCancellationEmail(rows[i][COL.EMAIL], bookingId, rows[i][COL.DATETIME], rows[i][COL.SESSION]) } catch(e) { Logger.log('Email send failed: ' + e.message + ' | stack: ' + (e.stack || '')) }
    return { success: true, message: 'Booking cancelled.' }
  }

  return { success: false, error: 'Booking not found. Check your Booking ID and email.' }
}

// =============================================================
// LOOKUP
// Returns the active booking matching both the booking ID and the
// exact email it was made with. Never lists bookings by email alone.
// =============================================================

function handleLookup(email, bookingId) {
  var id         = String(bookingId || '').trim()
  var normalized = normalizeEmail(email)
  if (!normalized || !id) return { success: false, error: 'Booking ID and email are required.' }

  var sheet = getSheet()
  var rows  = sheet.getDataRange().getValues()
  var bookings = []

  for (var i = 1; i < rows.length; i++) {
    var cellStatus = rows[i][COL.STATUS].toString()

    if (!rowHasBookingId(rows[i], id)) continue
    if (normalizeEmail(rows[i][COL.EMAIL]) !== normalized) continue
    if (cellStatus === 'Cancelled') continue

    bookings.push({
      bookingId: id,
      session:   rows[i][COL.SESSION],
      date:      rows[i][COL.DATETIME],
      status:    cellStatus,
    })
    break
  }

  return { success: true, bookings: bookings }
}

// =============================================================
// EMAIL — Confirmation to client
// FIX: cancel URL uses #cancel?id= hash format to match App.jsx
// FIX: use data.name instead of out-of-scope `name` variable
// =============================================================

function sendConfirmationEmail(data, bookingId, dateTime) {
  var cancelUrl = SITE_URL + '#cancel?id=' + encodeURIComponent(bookingId) + '&email=' + encodeURIComponent(data.email)
  var html = emailTemplate(
    'Booking Confirmed',
    data.name ? 'Hi ' + data.name + ',' : 'Hi there,',
    'Your session with Peak Aquatic Sports is confirmed. See details below.',
    [
      { label: 'Session',     value: data.session },
      { label: 'Date & Time', value: dateTime },
      { label: 'Skill Level', value: data.skillLevel || 'Not specified' },
      { label: 'Booking ID',  value: bookingId },
    ],
    [
      { url: cancelUrl, label: 'Cancel Booking', color: '#dc2626' },
      { url: SITE_URL,  label: 'Visit Website',  color: '#1a1a2e' },
    ],
    'Save your Booking ID to manage your appointment.'
  )
  // GmailApp uses positional args: (recipient, subject, body, options).
  // The single-object form only works on MailApp — calling it on GmailApp throws.
  GmailApp.sendEmail(
    data.email,
    'Booking Confirmed — Peak Aquatic Sports',
    'Confirmed: ' + data.session + ' on ' + dateTime + '. Booking ID: ' + bookingId,
    {
      htmlBody: html,
      name: 'Peak Aquatic Sports',
      replyTo: COACH_EMAIL,
    }
  )
}

// =============================================================
// EMAIL — Cancellation to client
// =============================================================

function sendCancellationEmail(email, bookingId, dateTime, session) {
  var html = emailTemplate(
    'Booking Cancelled',
    'Your booking has been cancelled.',
    'We\'ve removed your reservation. You can rebook anytime.',
    [
      { label: 'Session',    value: session },
      { label: 'Date/Time',  value: dateTime },
      { label: 'Booking ID', value: bookingId },
    ],
    [{ url: SITE_URL, label: 'Rebook Now', color: '#1a1a2e' }],
    'Questions? Call 201-359-5688 or reply to this email.'
  )
  GmailApp.sendEmail(
    email,
    'Booking Cancelled — Peak Aquatic Sports',
    'Cancelled: ' + session + ' on ' + dateTime + '. Booking ID: ' + bookingId,
    {
      htmlBody: html,
      name: 'Peak Aquatic Sports',
      replyTo: COACH_EMAIL,
    }
  )
}

// =============================================================
// VIDEO UPLOAD — Save to Google Drive via Apps Script
// Frontend sends base64, Apps Script decodes and saves to Drive folder
// =============================================================

var DRIVE_FOLDER_ID = '1c1qGAl8bpEuTMhZQZfi1o4czcB-d4b2H'

// Upload limits (match the web client's limits in src/lib/bookingClient.js)
var MAX_VIDEO_BASE64_BYTES = 35 * 1024 * 1024   // base64 fallback through this script
var MAX_VIDEO_DIRECT_BYTES = 200 * 1024 * 1024  // direct resumable upload to Drive
var MAX_IMAGE_BYTES        = 8 * 1024 * 1024    // Instagram's image size limit
var IMAGE_TYPES            = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function handleVideoUpload(data) {
  if (!data.videoBase64 || !data.fileName) {
    return { success: false, error: 'Missing video data or file name.' }
  }
  var contentType = data.contentType || 'video/mp4'
  if (!isVideoType(contentType)) {
    return { success: false, error: 'Only video files can be uploaded.' }
  }
  if (base64Size(data.videoBase64) > MAX_VIDEO_BASE64_BYTES) {
    return { success: false, error: 'Video must be under 35 MB.' }
  }
  var bookingId = String(data.bookingId || '').trim()
  var booking   = findActiveBookingRow(getSheet().getDataRange().getValues(), bookingId)
  if (!booking) {
    return { success: false, error: 'A valid booking ID is required to upload a video.' }
  }

  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID)
    var blob = Utilities.newBlob(
      Utilities.base64Decode(data.videoBase64),
      contentType,
      String(data.fileName).slice(0, 200)
    )
    // Not shared: the script runs as the coach, who owns the folder, so the
    // link in the notification below opens for the coach only.
    var file = folder.createFile(blob)
    var videoUrl = file.getUrl()

    // Notify coach with video link
    try {
      notifyCoach({
        name: booking[COL.NAME],
        email: booking[COL.EMAIL],
        session: booking[COL.SESSION],
        skillLevel: booking[COL.SKILL],
      }, bookingId, booking[COL.DATETIME], videoUrl)
    } catch(e) { Logger.log('Coach notify error: ' + e.message) }

    return { success: true, videoUrl: videoUrl }
  } catch(e) {
    Logger.log('Video upload error: ' + e.message)
    return { success: false, error: 'Upload failed: ' + e.message }
  }
}

// =============================================================
// DIRECT DRIVE UPLOAD — Returns a resumable upload URL (up to 200MB)
// Requires: Drive API advanced service enabled in Apps Script
// =============================================================
function handleGetUploadUrl(data) {
  if (!data.fileName) {
    return { success: false, error: 'Missing file name.' }
  }
  var contentType = data.contentType || data.mimeType || 'video/mp4'
  var fileSize    = Number(data.fileSize)
  if (!isVideoType(contentType)) {
    return { success: false, error: 'Only video files can be uploaded.' }
  }
  if (!(fileSize > 0) || fileSize > MAX_VIDEO_DIRECT_BYTES) {
    return { success: false, error: 'Video must be under 200 MB.' }
  }
  if (!findActiveBookingRow(getSheet().getDataRange().getValues(), String(data.bookingId || '').trim())) {
    return { success: false, error: 'A valid booking ID is required to upload a video.' }
  }
  try {
    var metadata = {
      name: String(data.fileName).slice(0, 200),
      mimeType: contentType,
      parents: [DRIVE_FOLDER_ID]
    }
    var url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable'
    var res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      // Declaring type and length up front makes Drive hold the upload to them
      headers: {
        Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
        'X-Upload-Content-Type': contentType,
        'X-Upload-Content-Length': String(fileSize),
      },
      payload: JSON.stringify(metadata),
      muteHttpExceptions: true
    })
    if (res.getResponseCode() !== 200) {
      return { success: false, error: 'Drive API error: ' + res.getContentText() }
    }
    var uploadUrl = res.getHeaders()['Location'] || res.getHeaders()['location']
    return { success: true, uploadUrl: uploadUrl }
  } catch(e) {
    Logger.log('getUploadUrl error: ' + e.message)
    return { success: false, error: 'Failed to get upload URL: ' + e.message }
  }
}

// =============================================================
// EMAIL — Notify coach of new booking
// =============================================================

function notifyCoach(data, bookingId, dateTime, videoUrl) {
  var lines = [
    'New booking received.',
    '',
    'Members:     ' + (data.name || '(not provided)'),
    'Email:       ' + data.email,
    'Phone:       ' + (data.phone || '(not provided)'),
    'Session:     ' + data.session,
    'Skill Level: ' + (data.skillLevel || ''),
    'Date/Time:   ' + dateTime,
    'Booking ID:  ' + bookingId,
  ]
  if (videoUrl) {
    lines.push('')
    lines.push('📹 Video uploaded: ' + videoUrl)
  }
  GmailApp.sendEmail(
    COACH_EMAIL,
    '📅 New Booking: ' + data.session + ' — ' + dateTime,
    lines.join('\n')
  )
}

// =============================================================
// EMAIL — Notify coach of cancellation
// =============================================================

function notifyCoachCancellation(row) {
  GmailApp.sendEmail(
    COACH_EMAIL,
    '🚫 Booking Cancelled: ' + row[COL.SESSION] + ' — ' + row[COL.DATETIME],
    [
      'A booking was cancelled.',
      '',
      'Name:       ' + row[COL.NAME],
      'Email:      ' + row[COL.EMAIL],
      'Session:    ' + row[COL.SESSION],
      'Date/Time:  ' + row[COL.DATETIME],
      'Booking ID: ' + row[COL.BOOKING_ID],
    ].join('\n')
  )
}

// =============================================================
// ROW COLORING
// =============================================================

function colorRow(sheet, row, session, status) {
  var range = sheet.getRange(row, 1, 1, 7)
  if (status === 'Cancelled') {
    range.setBackground('#f4cccc').setFontColor('#cc0000')
    return
  }
  if (status === 'Open') {
    range.setBackground('#f3f3f3').setFontColor('#999999')
    return
  }
  var colors = {
    'Intro Call':       { bg: '#dbeafe', font: '#1e40af' },
    'Video Review':     { bg: '#ede9fe', font: '#5b21b6' },
    'Private Session':  { bg: '#d1fae5', font: '#065f46' },
    'Semi-Group':       { bg: '#fef3c7', font: '#92400e' },
    'Group Session':    { bg: '#ffedd5', font: '#9a3412' },
    'Dryland':          { bg: '#fee2e2', font: '#991b1b' },
  }
  var c = colors[session] || { bg: '#ffffff', font: '#000000' }
  range.setBackground(c.bg).setFontColor(c.font)
}

// Auto-color on manual edit
function onEdit(e) {
  var sheet = e.source.getActiveSheet()
  if (sheet.getName() !== SHEET_NAME) return
  var row = e.range.getRow()
  if (row <= 1) return
  var session = sheet.getRange(row, COL.SESSION + 1).getValue()
  var status  = sheet.getRange(row, COL.STATUS  + 1).getValue()
  colorRow(sheet, row, session, status)
}

// =============================================================
// SHEET SETUP — run once to create headers + validation
// =============================================================

function setupSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  sheet.clear()

  // Headers
  var headers = [['Day/Time', 'Session', 'Members', 'Skill Level', 'Status', 'Booking ID', 'Email']]
  sheet.getRange(1, 1, 1, 7).setValues(headers)
    .setBackground('#1a1a2e').setFontColor('#ffffff')
    .setFontWeight('bold').setFontSize(10)

  // Column widths
  sheet.setColumnWidth(1, 200)
  sheet.setColumnWidth(2, 140)
  sheet.setColumnWidth(3, 220)
  sheet.setColumnWidth(4, 120)
  sheet.setColumnWidth(5, 100)
  sheet.setColumnWidth(6, 160)
  sheet.setColumnWidth(7, 200)

  // Data validation
  sheet.getRange('B2:B500').setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['Intro Call', 'Video Review', 'Private Session', 'Semi-Group', 'Group Session', 'Dryland'])
      .setAllowInvalid(false).build()
  )
  sheet.getRange('D2:D500').setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['Novice', 'Intermediate', 'Sectionals+', ''])
      .setAllowInvalid(true).build()
  )
  sheet.getRange('E2:E500').setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['Confirmed', 'Cancelled', 'Pending', 'Completed', 'Open'])
      .setAllowInvalid(false).build()
  )

  sheet.getRange('C2:C500').clearDataValidations()
  sheet.getRange('C2:C500').setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP)
  sheet.getRange('F2:F500').setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP)
  sheet.setFrozenRows(1)

  Logger.log('Sheet setup complete.')
}

// =============================================================
// POPULATE SCHEDULE — run once to load recurring clients
// =============================================================

function populateSchedule() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  // Columns: Day/Time | Session | Members | Skill Level | Status | Booking ID | Email
  var schedule = [
    ['Recurring - Monday at 2:30 PM',    'Private Session', 'ZAK',                                        '', 'Confirmed', '', ''],
    ['Recurring - Monday at 3:30 PM',    'Private Session', 'Aanya Jain',                                  '', 'Confirmed', '', ''],
    ['Recurring - Monday at 4:30 PM',    'Private Session', 'Daisy Lee',                                   '', 'Confirmed', '', ''],
    ['Recurring - Monday at 5:30 PM',    'Private Session', 'Melanie Ilan',                                '', 'Confirmed', '', ''],
    ['Recurring - Monday at 6:30 PM',    'Private Session', 'Sienna Plutzer',                              '', 'Confirmed', '', ''],
    ['Recurring - Monday at 7:30 PM',    'Private Session', 'Emily Kalna',                                 '', 'Confirmed', '', ''],
    ['Recurring - Monday at 8:30 PM',    '',                '',                                            '', 'Open',      '', ''],
    ['Recurring - Tuesday at 1:30 PM',   '',                '',                                            '', 'Open',      '', ''],
    ['Recurring - Tuesday at 2:30 PM',   'Private Session', 'Adam Boned',                                  '', 'Confirmed', '', ''],
    ['Recurring - Tuesday at 3:30 PM',   'Private Session', 'Gio Lee',                                     '', 'Confirmed', '', ''],
    ['Recurring - Tuesday at 4:30 PM',   'Private Session', 'Andy Suh',                                    '', 'Confirmed', '', ''],
    ['Recurring - Tuesday at 5:30 PM',   'Private Session', 'Isabella Kowalski',                           '', 'Confirmed', '', ''],
    ['Recurring - Tuesday at 6:30 PM',   'Private Session', 'Henry Brannan',                               '', 'Confirmed', '', ''],
    ['Recurring - Tuesday at 7:30 PM',   'Private Session', 'Yuriel Lee',                                  '', 'Confirmed', '', ''],
    ['Recurring - Tuesday at 8:30 PM',   'Group Session',   'Sara\nKatheryn\nGardner\nMelanie',            '', 'Confirmed', '', ''],
    ['Recurring - Wednesday at 5:50 AM', 'Dryland',         'Harrison\nRyker\nCole',                       '', 'Confirmed', '', ''],
    ['Recurring - Wednesday at 7:00 AM', 'Private Session', 'Ela',                                         '', 'Confirmed', '', ''],
    ['Recurring - Wednesday at 1:30 PM', 'Private Session', 'Al Kim',                                      '', 'Confirmed', '', ''],
    ['Recurring - Wednesday at 2:30 PM', 'Private Session', 'Will Mulder',                                 '', 'Confirmed', '', ''],
    ['Recurring - Wednesday at 3:30 PM', 'Semi-Group',      'William Thompson\nDaniel Hong',               '', 'Confirmed', '', ''],
    ['Recurring - Wednesday at 4:30 PM', 'Private Session', 'Annika',                                      '', 'Confirmed', '', ''],
    ['Recurring - Wednesday at 5:30 PM', 'Semi-Group',      'Edgar\nWyatt Swisher',                        '', 'Confirmed', '', ''],
    ['Recurring - Wednesday at 6:30 PM', 'Private Session', 'Aahana',                                      '', 'Confirmed', '', ''],
    ['Recurring - Wednesday at 7:30 PM', 'Private Session', 'Ethan Reines',                                '', 'Confirmed', '', ''],
    ['Recurring - Wednesday at 8:30 PM', 'Group Session',   'Levi\nEla\nBrandon Rho\nAndrew Hinkle\nSanti Sanchez', '', 'Confirmed', '', ''],
    ['Recurring - Thursday at 1:30 PM',  'Private Session', 'Adam Boned',                                  '', 'Confirmed', '', ''],
    ['Recurring - Thursday at 2:30 PM',  'Private Session', 'Jay Kim',                                     '', 'Confirmed', '', ''],
    ['Recurring - Thursday at 3:30 PM',  'Private Session', 'Daniel Lim',                                  '', 'Confirmed', '', ''],
    ['Recurring - Thursday at 4:30 PM',  'Private Session', 'Alex Jeon',                                   '', 'Confirmed', '', ''],
    ['Recurring - Thursday at 5:30 PM',  'Private Session', 'Cole Wilson',                                 '', 'Confirmed', '', ''],
    ['Recurring - Thursday at 6:30 PM',  'Private Session', 'Aaron Hong',                                  '', 'Confirmed', '', ''],
    ['Recurring - Thursday at 7:30 PM',  'Private Session', 'Chase Kim',                                   '', 'Confirmed', '', ''],
    ['Recurring - Thursday at 8:30 PM',  'Semi-Group',      'Ela\nSalma',                                  '', 'Confirmed', '', ''],
    ['Recurring - Friday at 5:50 AM',    'Dryland',         'Josh\nEthan\nChase',                          '', 'Confirmed', '', ''],
    ['Recurring - Friday at 7:00 AM',    'Private Session', 'Ela',                                         '', 'Confirmed', '', ''],
    ['Recurring - Friday at 1:00 PM',    'Private Session', 'ZAK',                                         '', 'Confirmed', '', ''],
    ['Recurring - Friday at 2:00 PM',    'Private Session', 'Jonas',                                       '', 'Confirmed', '', ''],
    ['Recurring - Friday at 3:00 PM',    'Private Session', 'Sean Darder',                                 '', 'Confirmed', '', ''],
    ['Recurring - Friday at 4:00 PM',    'Semi-Group',      'Lucas Kichukov\nMichael',                     '', 'Confirmed', '', ''],
    ['Recurring - Friday at 5:00 PM',    'Private Session', 'Max Kim',                                     '', 'Confirmed', '', ''],
    ['Recurring - Friday at 6:00 PM',    'Private Session', 'Eric Shin',                                   '', 'Confirmed', '', ''],
    ['Recurring - Friday at 7:00 PM',    'Private Session', 'Cheryn Cho',                                  '', 'Confirmed', '', ''],
    ['Recurring - Friday at 8:00 PM',    'Private Session', 'Matthew Chon',                                '', 'Confirmed', '', ''],
    ['Recurring - Saturday at 12:00 PM', 'Group Session',   'Charlie Lee\nAanya\nIDDO',                    '', 'Confirmed', '', ''],
    ['Recurring - Saturday at 1:30 PM',  'Group Session',   'Ivan Yeryn\nKyle Lee\nRyker\nSebastian',      '', 'Confirmed', '', ''],
    ['Recurring - Saturday at 3:00 PM',  'Group Session',   'Connor\nJoshua\nJeremiah\nSienna',            '', 'Confirmed', '', ''],
    ['Recurring - Saturday at 4:30 PM',  '',                '',                                            '', 'Open',      '', ''],
    ['Recurring - Sunday at 12:30 PM',   'Private Session', 'Stephanie Kim',                               '', 'Confirmed', '', ''],
    ['Recurring - Sunday at 1:30 PM',    'Private Session', 'Connor Hong',                                 '', 'Confirmed', '', ''],
    ['Recurring - Sunday at 2:30 PM',    'Private Session', 'Collin Lee',                                  '', 'Confirmed', '', ''],
    ['Recurring - Sunday at 3:30 PM',    'Private Session', 'Mady Raguindin',                              '', 'Confirmed', '', ''],
    ['Recurring - Sunday at 4:30 PM',    'Private Session', 'Josh Reines',                                 '', 'Confirmed', '', ''],
    ['Recurring - Sunday at 5:30 PM',    'Private Session', 'Milo Pfiefer',                                '', 'Confirmed', '', ''],
    ['Recurring - Sunday at 6:30 PM',    'Group Session',   'Michael Kim\nJeremiah Rhee\nJay Kim\nWilliam Mulder\nJoshua Yu\nRyker Levi\nTheo Souh', '', 'Confirmed', '', ''],
  ]

  // Assign booking IDs to confirmed rows
  for (var i = 0; i < schedule.length; i++) {
    if (schedule[i][4] === 'Confirmed') {
      schedule[i][5] = generateId()
    }
  }

  sheet.getRange(2, 1, schedule.length, 7).setValues(schedule)

  // Color each row
  for (var j = 0; j < schedule.length; j++) {
    colorRow(sheet, j + 2, schedule[j][1], schedule[j][4])
  }

  Logger.log('Schedule populated: ' + schedule.length + ' rows.')
}

// =============================================================
// WEEKLY RESET — archives sheet, sends summary to coach
// Run setupWeeklyTrigger() once to automate this every Sunday
// =============================================================

function weeklyReset() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName(SHEET_NAME)
  var data  = sheet.getDataRange().getValues()

  // Archive to a dated sheet
  var archiveName = 'Archive_' + Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd')
  var archive = ss.getSheetByName(archiveName) || ss.insertSheet(archiveName)
  if (data.length > 1) {
    archive.getRange(1, 1, data.length, data[0].length).setValues(data)
    sheet.getRange(1, 1, data.length, data[0].length)
      .copyTo(archive.getRange(1, 1), SpreadsheetApp.CopyPasteType.PASTE_FORMAT)
  }

  // Clear bookings (keep header)
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1)
  }

  // Summary email
  var confirmed = data.filter(function(r, i) { return i > 0 && r[COL.STATUS] === 'Confirmed'  }).length
  var cancelled = data.filter(function(r, i) { return i > 0 && r[COL.STATUS] === 'Cancelled'  }).length
  GmailApp.sendEmail(
    COACH_EMAIL,
    'Weekly Summary — Peak Aquatic Sports',
    'Week ending ' + archiveName + '\n\nConfirmed: ' + confirmed + '\nCancelled: ' + cancelled + '\n\nArchived to sheet: ' + archiveName
  )
}

function setupWeeklyTrigger() {
  // Delete existing trigger if any
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'weeklyReset') ScriptApp.deleteTrigger(t)
  })
  ScriptApp.newTrigger('weeklyReset')
    .timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(23).create()
  Logger.log('Weekly trigger set for Sunday at 11 PM.')
}

// =============================================================
// HTML EMAIL TEMPLATE
// =============================================================

// Every text argument is plain text and is HTML-escaped here, because
// greeting and detail values carry customer input (name, session, etc.).
function emailTemplate(title, greeting, message, details, buttons, footer) {
  var isConfirmed = title === 'Booking Confirmed'
  var headerColor = isConfirmed ? '#059669' : '#dc2626'
  title    = escapeHtml(title)
  greeting = escapeHtml(greeting)
  message  = escapeHtml(message)
  footer   = escapeHtml(footer)

  var detailRows = ''
  for (var i = 0; i < details.length; i++) {
    detailRows += '<tr>'
      + '<td style="padding:8px 12px;color:#6b7280;font-size:14px;border-bottom:1px solid #f3f4f6;">' + escapeHtml(details[i].label) + '</td>'
      + '<td style="padding:8px 12px;color:#111827;font-size:14px;font-weight:600;border-bottom:1px solid #f3f4f6;">' + escapeHtml(details[i].value) + '</td>'
      + '</tr>'
  }

  var buttonHtml = ''
  for (var j = 0; j < buttons.length; j++) {
    buttonHtml += '<a href="' + escapeHtml(buttons[j].url) + '" style="display:inline-block;background:' + buttons[j].color
      + ';color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;margin:0 8px 8px 0;">'
      + escapeHtml(buttons[j].label) + '</a>'
  }

  return '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;"><tr><td align="center">'
    + '<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">'
    // Header
    + '<tr><td style="background:#1a1a2e;padding:32px 40px;text-align:center;">'
    + '<img src="' + LOGO_URL + '" alt="Peak Aquatic" width="60" style="display:block;margin:0 auto 12px;filter:invert(1) brightness(2);">'
    + '<h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:1px;">PEAK AQUATIC SPORTS</h1>'
    + '</td></tr>'
    // Status bar
    + '<tr><td style="background:' + headerColor + ';padding:14px 40px;text-align:center;">'
    + '<span style="color:#fff;font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">' + title + '</span>'
    + '</td></tr>'
    // Body
    + '<tr><td style="padding:32px 40px;">'
    + '<p style="margin:0 0 8px;color:#111827;font-size:16px;font-weight:600;">' + greeting + '</p>'
    + '<p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">' + message + '</p>'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;margin-bottom:24px;">' + detailRows + '</table>'
    + '<div style="text-align:center;padding:8px 0 16px;">' + buttonHtml + '</div>'
    + '<p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">' + footer + '</p>'
    + '</td></tr>'
    // Footer
    + '<tr><td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">'
    + '<p style="margin:0 0 4px;color:#6b7280;font-size:13px;font-weight:600;">Peak Aquatic Sports</p>'
    + '<p style="margin:0;color:#9ca3af;font-size:12px;">Ramsey, NJ · peakaquaticsports@gmail.com · 201-359-5688</p>'
    + '</td></tr>'
    + '</table></td></tr></table></body></html>'
}

// =============================================================
// UTILITIES
// =============================================================

function getSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  if (!sheet) throw new Error('Sheet "' + SHEET_NAME + '" not found.')
  return sheet
}

// The booking ID plus the exact email is what lets a customer look up or
// cancel a booking, so the random part comes from a UUID, not Math.random.
function generateId() {
  var ts   = Date.now().toString(36).toUpperCase().slice(-5)
  var rand = Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase()
  return 'PAS-' + ts + '-' + rand
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}

// Emails compare exactly, ignoring case and surrounding whitespace
function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

// A row's Booking ID cell holds one ID, or one per line for group rows
function rowHasBookingId(row, bookingId) {
  var id = String(bookingId || '').trim()
  if (!id) return false
  return row[COL.BOOKING_ID].toString().split('\n').some(function(x) { return x.trim() === id })
}

// The sheet row holding this exact booking ID, unless it was cancelled
function findActiveBookingRow(rows, bookingId) {
  for (var i = 1; i < rows.length; i++) {
    if (rowHasBookingId(rows[i], bookingId) && rows[i][COL.STATUS].toString() !== 'Cancelled') return rows[i]
  }
  return null
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isVideoType(contentType) {
  return /^video\/[a-z0-9.+-]+$/i.test(String(contentType || ''))
}

// Decoded byte size of a base64 string, without decoding it
function base64Size(b64) {
  var s = String(b64 || '')
  var padding = s.slice(-2) === '==' ? 2 : (s.slice(-1) === '=' ? 1 : 0)
  return Math.floor(s.length * 3 / 4) - padding
}

// =============================================================
// ADMIN AUTH — admin actions must send the ADMIN_SECRET Script
// Property as data.adminSecret (see HOW TO SET UP)
// =============================================================

var ADMIN_SECRET_MIN_LENGTH = 16

// Returns null when data.adminSecret matches, otherwise an error response
function requireAdmin(data) {
  var expected = PropertiesService.getScriptProperties().getProperty('ADMIN_SECRET') || ''
  if (expected.length < ADMIN_SECRET_MIN_LENGTH) {
    return { success: false, error: 'Admin access is not configured.' }
  }
  if (!secretsMatch(String(data.adminSecret || ''), expected)) {
    return { success: false, error: 'Unauthorized.' }
  }
  return null
}

// Compares every character so timing doesn't reveal how much matched
function secretsMatch(given, expected) {
  if (given.length !== expected.length) return false
  var diff = 0
  for (var i = 0; i < expected.length; i++) {
    diff |= given.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return diff === 0
}

// =============================================================
// IMAGE UPLOAD — Save image to Drive (private) for an Instagram post.
// Admin only; handlePostToInstagram shares it just while posting.
// =============================================================

function handleImageUpload(data) {
  if (!data.imageBase64 || !data.fileName) {
    return { success: false, error: 'Missing image data or file name.' }
  }
  var contentType = String(data.contentType || '')
  if (IMAGE_TYPES.indexOf(contentType) === -1) {
    return { success: false, error: 'Image must be JPEG, PNG, WebP or GIF.' }
  }
  if (base64Size(data.imageBase64) > MAX_IMAGE_BYTES) {
    return { success: false, error: 'Image must be under 8 MB.' }
  }

  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID)
    var blob = Utilities.newBlob(
      Utilities.base64Decode(data.imageBase64),
      contentType,
      String(data.fileName).slice(0, 200)
    )
    var file = folder.createFile(blob)
    return { success: true, imageFileId: file.getId() }
  } catch (e) {
    Logger.log('Image upload error: ' + e.message)
    return { success: false, error: 'Upload failed: ' + e.message }
  }
}

// =============================================================
// INSTAGRAM — Server-side posting via Graph API (admin only)
// Token stored in Script Properties and never returned to a client
// =============================================================

var IG_USER_ID = '17841438687144817' // Peak Aquatic Sports IG Business Account ID

/**
 * Save or exchange an Instagram access token.
 * - If data.shortLivedToken is provided, exchanges it for a 60-day long-lived token.
 * - If data.longLivedToken is provided, stores it directly.
 * Requires: Meta App ID and App Secret in Script Properties (IG_APP_ID, IG_APP_SECRET)
 */
function handleSetInstagramToken(data) {
  var props = PropertiesService.getScriptProperties()

  if (data.longLivedToken) {
    props.setProperty('IG_ACCESS_TOKEN', data.longLivedToken)
    return { success: true, message: 'Long-lived token saved.' }
  }

  if (data.shortLivedToken) {
    var appId     = props.getProperty('IG_APP_ID')
    var appSecret = props.getProperty('IG_APP_SECRET')
    if (!appId || !appSecret) {
      return { success: false, error: 'IG_APP_ID and IG_APP_SECRET must be set in Script Properties first.' }
    }
    try {
      var url = 'https://graph.facebook.com/v19.0/oauth/access_token'
        + '?grant_type=fb_exchange_token'
        + '&client_id=' + appId
        + '&client_secret=' + appSecret
        + '&fb_exchange_token=' + encodeURIComponent(data.shortLivedToken)
      var res  = UrlFetchApp.fetch(url, { muteHttpExceptions: true })
      var json = JSON.parse(res.getContentText())
      if (json.error) {
        return { success: false, error: json.error.message }
      }
      props.setProperty('IG_ACCESS_TOKEN', json.access_token)
      var expiresIn = json.expires_in || 5184000 // default 60 days
      var expiryDate = new Date(Date.now() + expiresIn * 1000)
      return {
        success: true,
        message: 'Token exchanged and saved. Expires: ' + expiryDate.toLocaleDateString(),
        expiresAt: expiryDate.toISOString()
      }
    } catch (e) {
      return { success: false, error: 'Token exchange failed: ' + e.message }
    }
  }

  return { success: false, error: 'Provide shortLivedToken or longLivedToken.' }
}

/**
 * Post an image to Instagram.
 * data.imageUrl     — public URL of the image, or
 * data.imageFileId  — an image saved by handleImageUpload
 * data.caption      — post caption (required)
 */
function handlePostToInstagram(data) {
  if (!data.imageUrl && !data.imageFileId) return { success: false, error: 'Missing imageUrl or imageFileId.' }
  if (!data.caption)  return { success: false, error: 'Missing caption.' }

  var props = PropertiesService.getScriptProperties()
  var token = props.getProperty('IG_ACCESS_TOKEN')
  if (!token) {
    return { success: false, error: 'No Instagram token configured. Use setInstagramToken first.' }
  }

  var sharedFile = null
  try {
    var imageUrl = data.imageUrl
    if (data.imageFileId) {
      sharedFile = getUploadedImage(data.imageFileId)
      if (!sharedFile) return { success: false, error: 'Uploaded image not found.' }
      // Instagram fetches the image by URL, so share it only for this post
      sharedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
      imageUrl = 'https://lh3.googleusercontent.com/d/' + sharedFile.getId()
    }

    // Step 1: Create media container
    var containerRes = UrlFetchApp.fetch(
      'https://graph.facebook.com/v19.0/' + IG_USER_ID + '/media', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          image_url: imageUrl,
          caption: data.caption,
          access_token: token
        }),
        muteHttpExceptions: true
      }
    )
    var containerData = JSON.parse(containerRes.getContentText())
    if (containerData.error) {
      return { success: false, error: 'Container error: ' + containerData.error.message }
    }
    var creationId = containerData.id

    // Step 2: Wait for Instagram to process the image
    Utilities.sleep(5000)

    // Step 3: Publish
    var publishRes = UrlFetchApp.fetch(
      'https://graph.facebook.com/v19.0/' + IG_USER_ID + '/media_publish', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          creation_id: creationId,
          access_token: token
        }),
        muteHttpExceptions: true
      }
    )
    var publishData = JSON.parse(publishRes.getContentText())
    if (publishData.error) {
      return { success: false, error: 'Publish error: ' + publishData.error.message }
    }

    return { success: true, postId: publishData.id, message: 'Posted to Instagram!' }

  } catch (e) {
    Logger.log('Instagram post error: ' + e.message)
    return { success: false, error: 'Failed to post: ' + e.message }
  } finally {
    if (sharedFile) {
      try { sharedFile.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE) }
      catch (e) { Logger.log('Unshare error: ' + e.message) }
    }
  }
}

// A file saved by handleImageUpload (must live in the upload folder)
function getUploadedImage(fileId) {
  try {
    var file    = DriveApp.getFileById(String(fileId))
    var parents = file.getParents()
    while (parents.hasNext()) {
      if (parents.next().getId() === DRIVE_FOLDER_ID) return file
    }
  } catch (e) {
    Logger.log('Image lookup error: ' + e.message)
  }
  return null
}
