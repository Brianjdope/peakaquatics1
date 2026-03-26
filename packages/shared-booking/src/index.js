export const SESSION_TYPES = [
  { id: 'intro', label: 'Intro Call', duration: '15 min' },
  { id: 'video', label: 'Video Review', duration: '20 min' },
  { id: 'private', label: 'Private Session', duration: '1 hr' },
  { id: 'semi', label: 'Semi-Group', duration: '1.5 hr' },
  { id: 'group', label: 'Group Session', duration: '1.5 hr' },
  { id: 'dryland', label: 'Dryland', duration: '1 hr' },
]

export const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
]

export function isValidBookingRequest(payload) {
  return Boolean(payload?.name && payload?.email && payload?.session && payload?.date && payload?.time)
}
