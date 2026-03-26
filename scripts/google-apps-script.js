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
// 5. Deploy → New deployment → Web app
//    - Execute as: Me  /  Who has access: Anyone
// 6. Copy the Web App URL → paste into BookingCalendar.jsx as SHEETS_API
// 7. After any script change: Deploy → New deployment (never edit existing)
//
// COLUMN LAYOUT (A–G):
//   A: Booking ID  B: Name  C: Session  D: Email
//   E: Date/Time   F: Phone  G: Status
// ============================================================

var SHEET_NAME  = 'Sheet1'
var COACH_EMAIL = 'peakaquaticsports@gmail.com'
var SITE_URL    = 'https://brianjdope.github.io/peakaquatics1/'
var LOGO_URL    = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/7fd6ea37-8f94-4626-ac71-1fe5e214471e/peak-aquatic-primary-logo-black.png'

// Column indexes (0-based)
var COL = {
  BOOKING_ID: 0,  // A
  NAME:       1,  // B
  SESSION:    2,  // C
  EMAIL:      3,  // D
  DATETIME:   4,  // E
  PHONE:      5,  // F
  STATUS:     6,  // G
}

// =============================================================
// ENTRY POINTS
// =============================================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents)
    if (data.action === 'book')   return jsonResponse(handleBooking(data))
    if (data.action === 'cancel') return jsonResponse(handleCancellation(data))
    return jsonResponse({ success: false, error: 'Invalid action' })
  } catch (err) {
    return jsonResponse({ success: false, error: 'doPost error: ' + err.message })
  }
}

function doGet(e) {
  try {
    var action = e.parameter.action
    if (action === 'lookup')    return jsonResponse(handleLookup(e.parameter.email))
    if (action === 'available') return jsonResponse(handleAvailability(e.parameter.date, e.parameter.day))
    return jsonResponse({ success: false, error: 'Invalid action' })
  } catch (err) {
    return jsonResponse({ success: false, error: 'doGet error: ' + err.message })
  }
}

// =============================================================
// AVAILABILITY — returns booked times for a given date + weekday
// Called by the booking calendar to grey out taken slots
// e.g. GET ?action=available&date=Saturday, Mar 29&day=Saturday
// =============================================================

function handleAvailability(date, day) {
  if (!date) return { success: false, error: 'Date is required.' }

  var sheet = getSheet()
  var rows  = sheet.getDataRange().getValues()
  var booked = []

  for (var i = 1; i < rows.length; i++) {
    var cellDateTime = rows[i][COL.DATETIME].toString()
    var cellStatus   = rows[i][COL.STATUS].toString()
    if (cellStatus === 'Cancelled') continue

    // Match specific date (e.g. "Saturday, Mar 29 at 2:00 PM")
    if (cellDateTime.indexOf(date) > -1) {
      var timeMatch = cellDateTime.match(/at (.+)$/)
      if (timeMatch) booked.push(timeMatch[1].trim())
    }

    // Match recurring day (e.g. "Recurring - Saturday at 2:00 PM")
    if (day && cellDateTime.indexOf('Recurring - ' + day) > -1) {
      var recurMatch = cellDateTime.match(/at (.+)$/)
      if (recurMatch) booked.push(recurMatch[1].trim())
    }
  }

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

  var sheet = getSheet()
  var bookingId = generateId()
  var dateTime  = data.date + ' at ' + data.time
  var name      = data.name  || ''
  var skill     = data.skillLevel || ''

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
        sendConfirmationEmail(data, bookingId, dateTime)
        notifyCoach(data, bookingId, dateTime)
        return { success: true, bookingId: bookingId }
      }
    }
  }

  // New row
  var row = [
    bookingId,         // A: Booking ID
    name,              // B: Name
    data.session,      // C: Session
    data.email,        // D: Email
    dateTime,          // E: Date/Time
    data.phone || '',  // F: Phone
    'Confirmed',       // G: Status
  ]
  sheet.appendRow(row)
  var lastRow = sheet.getLastRow()
  colorRow(sheet, lastRow, data.session, 'Confirmed')
  sheet.getRange(lastRow, COL.BOOKING_ID + 1).setFontWeight('bold')

  sendConfirmationEmail(data, bookingId, dateTime)
  notifyCoach(data, bookingId, dateTime)
  return { success: true, bookingId: bookingId }
}

// =============================================================
// CANCELLATION
// Marks row Cancelled or removes member from group row
// =============================================================

function handleCancellation(data) {
  if (!data.bookingId || !data.email) {
    return { success: false, error: 'Booking ID and email are required.' }
  }

  var sheet = getSheet()
  var rows  = sheet.getDataRange().getValues()

  for (var i = 1; i < rows.length; i++) {
    var cellIds   = rows[i][COL.BOOKING_ID].toString()
    var cellEmail = rows[i][COL.EMAIL].toString().toLowerCase()
    var cellStatus = rows[i][COL.STATUS].toString()

    if (cellIds.indexOf(data.bookingId) === -1) continue
    if (cellEmail.indexOf(data.email.toLowerCase()) === -1 && data.email !== 'recurring@peakaquatic.com') continue
    if (cellStatus === 'Cancelled') return { success: false, error: 'Booking already cancelled.' }

    var names = rows[i][COL.NAME].toString().split('\n')
    var ids   = cellIds.split('\n')

    if (ids.length > 1) {
      // Group row — remove just this member
      var idx = ids.indexOf(data.bookingId)
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

    notifyCoachCancellation(rows[i])
    sendCancellationEmail(rows[i][COL.EMAIL], data.bookingId, rows[i][COL.DATETIME], rows[i][COL.SESSION])
    return { success: true, message: 'Booking cancelled.' }
  }

  return { success: false, error: 'Booking not found. Check your Booking ID and email.' }
}

// =============================================================
// LOOKUP
// Returns all active bookings for an email address
// =============================================================

function handleLookup(email) {
  if (!email) return { success: false, error: 'Email is required.' }

  var sheet = getSheet()
  var rows  = sheet.getDataRange().getValues()
  var bookings = []

  for (var i = 1; i < rows.length; i++) {
    var cellEmail  = rows[i][COL.EMAIL].toString().toLowerCase()
    var cellStatus = rows[i][COL.STATUS].toString()

    if (cellEmail.indexOf(email.toLowerCase()) === -1) continue
    if (cellStatus === 'Cancelled') continue

    var ids = rows[i][COL.BOOKING_ID].toString().split('\n')
    for (var j = 0; j < ids.length; j++) {
      if (ids[j].trim()) {
        bookings.push({
          bookingId: ids[j].trim(),
          session:   rows[i][COL.SESSION],
          date:      rows[i][COL.DATETIME],
          status:    cellStatus,
        })
      }
    }
  }

  return { success: true, bookings: bookings }
}

// =============================================================
// EMAIL — Confirmation to client
// =============================================================

function sendConfirmationEmail(data, bookingId, dateTime) {
  var cancelUrl = SITE_URL + '?cancel=' + encodeURIComponent(bookingId) + '&email=' + encodeURIComponent(data.email)
  var html = emailTemplate(
    'Booking Confirmed',
    name ? 'Hi ' + name + ',' : 'Hi there,',
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
  MailApp.sendEmail({
    to: data.email,
    subject: 'Booking Confirmed — Peak Aquatic Sports',
    htmlBody: html,
    body: 'Confirmed: ' + data.session + ' on ' + dateTime + '. Booking ID: ' + bookingId,
  })
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
  MailApp.sendEmail({
    to: email,
    subject: 'Booking Cancelled — Peak Aquatic Sports',
    htmlBody: html,
    body: 'Cancelled: ' + session + ' on ' + dateTime + '. Booking ID: ' + bookingId,
  })
}

// =============================================================
// EMAIL — Notify coach of new booking
// =============================================================

function notifyCoach(data, bookingId, dateTime) {
  MailApp.sendEmail(
    COACH_EMAIL,
    '📅 New Booking: ' + data.session + ' — ' + dateTime,
    [
      'New booking received.',
      '',
      'Members:     ' + (name || '(not provided)'),
      'Email:       ' + data.email,
      'Session:     ' + data.session,
      'Skill Level: ' + (data.skillLevel || ''),
      'Date/Time:   ' + dateTime,
      'Booking ID:  ' + bookingId,
    ].join('\n')
  )
}

// =============================================================
// EMAIL — Notify coach of cancellation
// =============================================================

function notifyCoachCancellation(row) {
  MailApp.sendEmail(
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

  // Headers: A: Booking ID | B: Name | C: Session | D: Email | E: Date/Time | F: Phone | G: Status
  var headers = [['Booking ID', 'Name', 'Session', 'Email', 'Date/Time', 'Phone', 'Status']]
  sheet.getRange(1, 1, 1, 7).setValues(headers)
    .setBackground('#1a1a2e').setFontColor('#ffffff')
    .setFontWeight('bold').setFontSize(10)

  // Column widths
  sheet.setColumnWidth(1, 160)  // Booking ID
  sheet.setColumnWidth(2, 200)  // Name
  sheet.setColumnWidth(3, 140)  // Session
  sheet.setColumnWidth(4, 200)  // Email
  sheet.setColumnWidth(5, 200)  // Date/Time
  sheet.setColumnWidth(6, 130)  // Phone
  sheet.setColumnWidth(7, 110)  // Status

  // Data validation
  sheet.getRange('C2:C500').setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['Intro Call', 'Video Review', 'Private Session', 'Semi-Group', 'Group Session', 'Dryland'])
      .setAllowInvalid(false).build()
  )
  sheet.getRange('G2:G500').setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['Confirmed', 'Cancelled', 'Pending', 'Completed', 'Open'])
      .setAllowInvalid(false).build()
  )

  sheet.getRange('B2:B500').setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP)
  sheet.getRange('A2:A500').setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP)
  sheet.setFrozenRows(1)

  Logger.log('Sheet setup complete.')
}

// =============================================================
// POPULATE SCHEDULE — run once to load recurring clients
// =============================================================

function populateSchedule() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  // Columns: Booking ID | Name | Session | Email | Date/Time | Phone | Status
  var schedule = [
    ['', 'ZAK',                                        'Private Session', '', 'Recurring - Monday at 2:30 PM',    '', 'Confirmed'],
    ['', 'Aanya Jain',                                  'Private Session', '', 'Recurring - Monday at 3:30 PM',    '', 'Confirmed'],
    ['', 'Daisy Lee',                                   'Private Session', '', 'Recurring - Monday at 4:30 PM',    '', 'Confirmed'],
    ['', 'Melanie Ilan',                                'Private Session', '', 'Recurring - Monday at 5:30 PM',    '', 'Confirmed'],
    ['', 'Sienna Plutzer',                              'Private Session', '', 'Recurring - Monday at 6:30 PM',    '', 'Confirmed'],
    ['', 'Emily Kalna',                                 'Private Session', '', 'Recurring - Monday at 7:30 PM',    '', 'Confirmed'],
    ['', '',                                            '',                '', 'Recurring - Monday at 8:30 PM',    '', 'Open'     ],
    ['', '',                                            '',                '', 'Recurring - Tuesday at 1:30 PM',   '', 'Open'     ],
    ['', 'Adam Boned',                                  'Private Session', '', 'Recurring - Tuesday at 2:30 PM',   '', 'Confirmed'],
    ['', 'Gio Lee',                                     'Private Session', '', 'Recurring - Tuesday at 3:30 PM',   '', 'Confirmed'],
    ['', 'Andy Suh',                                    'Private Session', '', 'Recurring - Tuesday at 4:30 PM',   '', 'Confirmed'],
    ['', 'Isabella Kowalski',                           'Private Session', '', 'Recurring - Tuesday at 5:30 PM',   '', 'Confirmed'],
    ['', 'Henry Brannan',                               'Private Session', '', 'Recurring - Tuesday at 6:30 PM',   '', 'Confirmed'],
    ['', 'Yuriel Lee',                                  'Private Session', '', 'Recurring - Tuesday at 7:30 PM',   '', 'Confirmed'],
    ['', 'Sara\nKatheryn\nGardner\nMelanie',            'Group Session',   '', 'Recurring - Tuesday at 8:30 PM',   '', 'Confirmed'],
    ['', 'Harrison\nRyker\nCole',                       'Dryland',         '', 'Recurring - Wednesday at 5:50 AM', '', 'Confirmed'],
    ['', 'Ela',                                         'Private Session', '', 'Recurring - Wednesday at 7:00 AM', '', 'Confirmed'],
    ['', 'Al Kim',                                      'Private Session', '', 'Recurring - Wednesday at 1:30 PM', '', 'Confirmed'],
    ['', 'Will Mulder',                                 'Private Session', '', 'Recurring - Wednesday at 2:30 PM', '', 'Confirmed'],
    ['', 'William Thompson\nDaniel Hong',               'Semi-Group',      '', 'Recurring - Wednesday at 3:30 PM', '', 'Confirmed'],
    ['', 'Annika',                                      'Private Session', '', 'Recurring - Wednesday at 4:30 PM', '', 'Confirmed'],
    ['', 'Edgar\nWyatt Swisher',                        'Semi-Group',      '', 'Recurring - Wednesday at 5:30 PM', '', 'Confirmed'],
    ['', 'Aahana',                                      'Private Session', '', 'Recurring - Wednesday at 6:30 PM', '', 'Confirmed'],
    ['', 'Ethan Reines',                                'Private Session', '', 'Recurring - Wednesday at 7:30 PM', '', 'Confirmed'],
    ['', 'Levi\nEla\nBrandon Rho\nAndrew Hinkle\nSanti Sanchez', 'Group Session', '', 'Recurring - Wednesday at 8:30 PM', '', 'Confirmed'],
    ['', 'Adam Boned',                                  'Private Session', '', 'Recurring - Thursday at 1:30 PM',  '', 'Confirmed'],
    ['', 'Jay Kim',                                     'Private Session', '', 'Recurring - Thursday at 2:30 PM',  '', 'Confirmed'],
    ['', 'Daniel Lim',                                  'Private Session', '', 'Recurring - Thursday at 3:30 PM',  '', 'Confirmed'],
    ['', 'Alex Jeon',                                   'Private Session', '', 'Recurring - Thursday at 4:30 PM',  '', 'Confirmed'],
    ['', 'Cole Wilson',                                 'Private Session', '', 'Recurring - Thursday at 5:30 PM',  '', 'Confirmed'],
    ['', 'Aaron Hong',                                  'Private Session', '', 'Recurring - Thursday at 6:30 PM',  '', 'Confirmed'],
    ['', 'Chase Kim',                                   'Private Session', '', 'Recurring - Thursday at 7:30 PM',  '', 'Confirmed'],
    ['', 'Ela\nSalma',                                  'Semi-Group',      '', 'Recurring - Thursday at 8:30 PM',  '', 'Confirmed'],
    ['', 'Josh\nEthan\nChase',                          'Dryland',         '', 'Recurring - Friday at 5:50 AM',    '', 'Confirmed'],
    ['', 'Ela',                                         'Private Session', '', 'Recurring - Friday at 7:00 AM',    '', 'Confirmed'],
    ['', 'ZAK',                                         'Private Session', '', 'Recurring - Friday at 1:00 PM',    '', 'Confirmed'],
    ['', 'Jonas',                                       'Private Session', '', 'Recurring - Friday at 2:00 PM',    '', 'Confirmed'],
    ['', 'Sean Darder',                                 'Private Session', '', 'Recurring - Friday at 3:00 PM',    '', 'Confirmed'],
    ['', 'Lucas Kichukov\nMichael',                     'Semi-Group',      '', 'Recurring - Friday at 4:00 PM',    '', 'Confirmed'],
    ['', 'Max Kim',                                     'Private Session', '', 'Recurring - Friday at 5:00 PM',    '', 'Confirmed'],
    ['', 'Eric Shin',                                   'Private Session', '', 'Recurring - Friday at 6:00 PM',    '', 'Confirmed'],
    ['', 'Cheryn Cho',                                  'Private Session', '', 'Recurring - Friday at 7:00 PM',    '', 'Confirmed'],
    ['', 'Matthew Chon',                                'Private Session', '', 'Recurring - Friday at 8:00 PM',    '', 'Confirmed'],
    ['', 'Charlie Lee\nAanya\nIDDO',                    'Group Session',   '', 'Recurring - Saturday at 12:00 PM', '', 'Confirmed'],
    ['', 'Ivan Yeryn\nKyle Lee\nRyker\nSebastian',      'Group Session',   '', 'Recurring - Saturday at 1:30 PM',  '', 'Confirmed'],
    ['', 'Connor\nJoshua\nJeremiah\nSienna',            'Group Session',   '', 'Recurring - Saturday at 3:00 PM',  '', 'Confirmed'],
    ['', '',                                            '',                '', 'Recurring - Saturday at 4:30 PM',  '', 'Open'     ],
    ['', 'Stephanie Kim',                               'Private Session', '', 'Recurring - Sunday at 12:30 PM',   '', 'Confirmed'],
    ['', 'Connor Hong',                                 'Private Session', '', 'Recurring - Sunday at 1:30 PM',    '', 'Confirmed'],
    ['', 'Collin Lee',                                  'Private Session', '', 'Recurring - Sunday at 2:30 PM',    '', 'Confirmed'],
    ['', 'Mady Raguindin',                              'Private Session', '', 'Recurring - Sunday at 3:30 PM',    '', 'Confirmed'],
    ['', 'Josh Reines',                                 'Private Session', '', 'Recurring - Sunday at 4:30 PM',    '', 'Confirmed'],
    ['', 'Milo Pfiefer',                                'Private Session', '', 'Recurring - Sunday at 5:30 PM',    '', 'Confirmed'],
    ['', 'Michael Kim\nJeremiah Rhee\nJay Kim\nWilliam Mulder\nJoshua Yu\nRyker Levi\nTheo Souh', 'Group Session', '', 'Recurring - Sunday at 6:30 PM', '', 'Confirmed'],
  ]

  // Assign booking IDs to confirmed rows (col index 0 = Booking ID, col index 6 = Status)
  for (var i = 0; i < schedule.length; i++) {
    if (schedule[i][6] === 'Confirmed') {
      schedule[i][0] = generateId()
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
  MailApp.sendEmail(
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

function emailTemplate(title, greeting, message, details, buttons, footer) {
  var isConfirmed = title === 'Booking Confirmed'
  var headerColor = isConfirmed ? '#059669' : '#dc2626'

  var detailRows = ''
  for (var i = 0; i < details.length; i++) {
    detailRows += '<tr>'
      + '<td style="padding:8px 12px;color:#6b7280;font-size:14px;border-bottom:1px solid #f3f4f6;">' + details[i].label + '</td>'
      + '<td style="padding:8px 12px;color:#111827;font-size:14px;font-weight:600;border-bottom:1px solid #f3f4f6;">' + details[i].value + '</td>'
      + '</tr>'
  }

  var buttonHtml = ''
  for (var j = 0; j < buttons.length; j++) {
    buttonHtml += '<a href="' + buttons[j].url + '" style="display:inline-block;background:' + buttons[j].color
      + ';color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;margin:0 8px 8px 0;">'
      + buttons[j].label + '</a>'
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

function generateId() {
  var ts   = Date.now().toString(36).toUpperCase().slice(-5)
  var rand = Math.random().toString(36).slice(2, 5).toUpperCase()
  return 'PAS-' + ts + '-' + rand
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}
