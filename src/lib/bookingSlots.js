// Pure slot-time helpers shared by the booking calendar (kept free of React so they can be unit-tested).

// Returns the local Date a slot like "1:30 PM" starts on the given calendar day, or null if unparseable.
export function slotStart(year, month, day, time) {
  const match = (time || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return null
  let hrs = parseInt(match[1], 10)
  const mins = parseInt(match[2], 10)
  const period = match[3].toUpperCase()
  if (period === 'PM' && hrs !== 12) hrs += 12
  if (period === 'AM' && hrs === 12) hrs = 0
  return new Date(year, month, day, hrs, mins, 0, 0)
}

// A slot is bookable only if it starts after `now`; unparseable times are treated as past so they never show.
export function isSlotInPast(year, month, day, time, now = new Date()) {
  const start = slotStart(year, month, day, time)
  return !start || start.getTime() <= now.getTime()
}
