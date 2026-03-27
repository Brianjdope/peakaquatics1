const SHEETS_API = 'https://script.google.com/macros/s/AKfycbxjnbYWd8wj5ZGBy8FvYMP00JxGfeZEkeceggWuKe88qGNwNwFO4r0NhHY0VZ1Mh7PN/exec'

const FALLBACK_MSG = 'Booking server is unavailable. Please email peakaquaticsports@gmail.com or call 201-359-5688.'

async function readJson(res) {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    if (text.includes('<html') || text.includes('<!DOCTYPE') || text.includes('Not Allowed')) {
      return { success: false, error: FALLBACK_MSG }
    }
    return { success: false, error: text || 'Unexpected server response.' }
  }
}

export async function fetchAvailability(date, day) {
  const params = new URLSearchParams({ action: 'available', date, day })
  const res = await fetch(`${SHEETS_API}?${params.toString()}`)
  return readJson(res)
}

export async function lookupBookings(email) {
  const params = new URLSearchParams({ action: 'lookup', email })
  const res = await fetch(`${SHEETS_API}?${params.toString()}`)
  return readJson(res)
}

export async function cancelBooking(bookingId, email) {
  const res = await fetch(SHEETS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'cancel', bookingId, email }),
  })
  return readJson(res)
}

export async function createBooking(payload) {
  const body = {
    action: 'book',
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    session: payload.session,
    skillLevel: payload.skillLevel,
    date: payload.date,
    time: payload.time,
  }

  const res = await fetch(SHEETS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(body),
  })
  return readJson(res)
}

export async function getUploadUrl(fileName, fileSize, contentType) {
  const res = await fetch(SHEETS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: 'uploadUrl',
      fileName,
      fileSize,
      contentType,
      origin: window.location.origin,
    }),
  })
  return readJson(res)
}

export function uploadToDrive(uploadUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4')

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText))
        } catch {
          resolve({ id: null })
        }
      } else {
        reject(new Error('Upload failed with status ' + xhr.status))
      }
    }

    xhr.onerror = () => reject(new Error('Upload network error'))
    xhr.send(file)
  })
}

export async function linkVideo(fileId, bookingId) {
  const res = await fetch(SHEETS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: 'linkVideo',
      fileId,
      bookingId,
    }),
  })
  return readJson(res)
}
