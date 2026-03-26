const memory = {
  bookings: [],
}

function normalizeDate(date, time) {
  const base = date?.split(' at ')[0] || date || ''
  return `${base}${time ? ` at ${time}` : ''}`
}

export function listBookingsByEmail(email) {
  return memory.bookings.filter((b) => b.email.toLowerCase() === String(email).toLowerCase() && b.status !== 'cancelled')
}

export function listBookedTimes(date) {
  return memory.bookings.filter((b) => b.date === date && b.status !== 'cancelled').map((b) => b.time)
}

export function createBookingRecord(input) {
  const bookingId = `PK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const record = {
    bookingId,
    name: input.name,
    email: input.email,
    phone: input.phone || '',
    session: input.session,
    skillLevel: input.skillLevel || '',
    date: normalizeDate(input.date, input.time),
    time: input.time || '',
    status: 'pending_payment',
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString(),
  }
  memory.bookings.push(record)
  return record
}

export function markBookingPaid(bookingId) {
  const booking = memory.bookings.find((b) => b.bookingId === bookingId)
  if (!booking) return null
  booking.paymentStatus = 'paid'
  booking.status = 'confirmed'
  return booking
}

export function cancelBookingRecord(bookingId, email) {
  const booking = memory.bookings.find((b) => b.bookingId === bookingId && b.email.toLowerCase() === String(email).toLowerCase())
  if (!booking) return null
  booking.status = 'cancelled'
  return booking
}
