// Checks the request shapes src/lib/bookingClient.js sends to the Apps Script,
// so the web client and scripts/google-apps-script.js stay in step.
import test from 'node:test'
import assert from 'node:assert/strict'

const calls = []
globalThis.fetch = async (url, opts = {}) => {
  calls.push({ url: String(url), opts })
  return { text: async () => JSON.stringify({ success: true, bookings: [] }) }
}

const { lookupBookings, cancelBooking } = await import('../src/lib/bookingClient.js')

test('lookup sends both the booking ID and the email', async () => {
  calls.length = 0
  await lookupBookings('parent@example.com', 'PAS-ABCDE-1234ABCD')
  const url = new URL(calls[0].url)
  assert.equal(url.searchParams.get('action'), 'lookup')
  assert.equal(url.searchParams.get('email'), 'parent@example.com')
  assert.equal(url.searchParams.get('bookingId'), 'PAS-ABCDE-1234ABCD')
})

test('cancel posts the booking ID and email', async () => {
  calls.length = 0
  await cancelBooking('PAS-ABCDE-1234ABCD', 'parent@example.com')
  assert.equal(calls[0].opts.method, 'POST')
  assert.deepEqual(JSON.parse(calls[0].opts.body), { action: 'cancel', bookingId: 'PAS-ABCDE-1234ABCD', email: 'parent@example.com' })
})
