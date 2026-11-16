import test from 'node:test'
import assert from 'node:assert/strict'
import { slotStart, isSlotInPast } from '../src/lib/bookingSlots.js'

test('slotStart parses AM/PM slot times on the given day', () => {
  assert.deepEqual(slotStart(2026, 9, 19, '1:30 PM'), new Date(2026, 9, 19, 13, 30))
  assert.deepEqual(slotStart(2026, 9, 19, '9:00 AM'), new Date(2026, 9, 19, 9, 0))
  assert.deepEqual(slotStart(2026, 9, 19, '12:30 PM'), new Date(2026, 9, 19, 12, 30))
  assert.deepEqual(slotStart(2026, 9, 19, '12:15 AM'), new Date(2026, 9, 19, 0, 15))
  assert.equal(slotStart(2026, 9, 19, 'noon'), null)
})

test('isSlotInPast hides slots earlier than now today (B7)', () => {
  const now = new Date(2026, 9, 19, 10, 0)
  assert.equal(isSlotInPast(2026, 9, 19, '9:00 AM', now), true)
  assert.equal(isSlotInPast(2026, 9, 19, '10:00 AM', now), true)
  assert.equal(isSlotInPast(2026, 9, 19, '1:30 PM', now), false)
  assert.equal(isSlotInPast(2026, 9, 20, '9:00 AM', now), false)
  assert.equal(isSlotInPast(2026, 9, 18, '1:30 PM', now), true)
  assert.equal(isSlotInPast(2026, 9, 19, 'bogus', now), true)
})
