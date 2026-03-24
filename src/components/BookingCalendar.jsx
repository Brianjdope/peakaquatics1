import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const SESSION_TYPES = [
  { id: 'intro', label: 'Intro Call', duration: '15 min', color: '#4a9eff' },
  { id: 'video', label: 'Video Review', duration: '20 min', color: '#a78bfa' },
  { id: 'private', label: 'Private Session', duration: '1 hr', color: '#34d399' },
  { id: 'semi', label: 'Semi-Group', duration: '1.5 hr', color: '#fbbf24' },
]

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

export default function BookingCalendar() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const fileRef = useRef()

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const isToday = (day) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

  const isPast = (day) => {
    const d = new Date(currentYear, currentMonth, day)
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return d < t
  }

  const isWeekend = (day) => {
    const d = new Date(currentYear, currentMonth, day).getDay()
    return d === 0 || d === 6
  }

  const handleConfirm = () => {
    setConfirmed(true)
  }

  const sessionObj = SESSION_TYPES.find(s => s.id === selectedSession)
  const dateStr = selectedDate ? `${MONTHS[currentMonth]} ${selectedDate}, ${currentYear}` : ''

  if (confirmed) {
    const isVideo = selectedSession === 'video'
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '2.5rem 2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>&#10003;</div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Booking Request Sent</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 340, margin: '0 auto 1.5rem' }}>
          {sessionObj?.label} on {dateStr} at {selectedTime}. We'll confirm via email within 24 hours.
        </p>

        {isVideo && (
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '1.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Upload Your Video
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '0.78rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Attach your stroke or race video so Coach Phil can annotate it before your review call.
            </p>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed var(--border2)',
                borderRadius: 8,
                padding: '1.5rem 1rem',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#a78bfa'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
            >
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <p style={{ color: videoFile ? 'var(--text)' : 'var(--muted)', fontSize: '0.82rem' }}>
                {videoFile ? videoFile.name : 'Click to upload video (MP4, MOV)'}
              </p>
              <p style={{ color: 'var(--muted)', fontSize: '0.7rem', marginTop: '0.4rem' }}>Max 200MB · 30–60 seconds ideal</p>
            </div>
            {videoFile && (
              <p style={{ color: '#a78bfa', fontSize: '0.78rem', marginTop: '0.75rem' }}>
                Video attached — we'll review it before your call.
              </p>
            )}
          </div>
        )}

        <button
          onClick={() => { setConfirmed(false); setSelectedDate(null); setSelectedTime(null); setSelectedSession(null); setVideoFile(null) }}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            color: 'var(--muted)',
            padding: '0.5rem 1.25rem',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          Book Another
        </button>
      </motion.div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Session type selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
        {SESSION_TYPES.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSession(s.id)}
            style={{
              background: selectedSession === s.id ? 'var(--surface2)' : 'transparent',
              border: `1px solid ${selectedSession === s.id ? s.color : 'var(--border)'}`,
              borderRadius: 8,
              padding: '0.65rem 0.75rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: s.color,
                flexShrink: 0,
              }} />
              <span style={{ color: 'var(--text)', fontSize: '0.82rem', fontWeight: 500 }}>{s.label}</span>
            </div>
            <span style={{ color: 'var(--muted)', fontSize: '0.7rem', marginLeft: '1.05rem' }}>{s.duration}</span>
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '1rem',
        overflow: 'hidden',
      }}>
        {/* Month nav */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          padding: '0 0.25rem',
        }}>
          <button onClick={prevMonth} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            cursor: 'pointer', fontSize: '1rem', padding: '0.25rem 0.5rem',
            borderRadius: 4, transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >&#8249;</button>
          <span style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 600 }}>
            {MONTHS[currentMonth]} {currentYear}
          </span>
          <button onClick={nextMonth} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            cursor: 'pointer', fontSize: '1rem', padding: '0.25rem 0.5rem',
            borderRadius: 4, transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >&#8250;</button>
        </div>

        {/* Day headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0,
          marginBottom: '0.25rem',
        }}>
          {DAYS.map(d => (
            <div key={d} style={{
              textAlign: 'center',
              color: 'var(--muted)',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              padding: '0.25rem 0',
              textTransform: 'uppercase',
            }}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px',
        }}>
          {/* Empty cells for offset */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} style={{ aspectRatio: '1', padding: '0.2rem' }} />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const past = isPast(day)
            const weekend = isWeekend(day)
            const todayDay = isToday(day)
            const selected = selectedDate === day
            const disabled = past || weekend

            return (
              <button
                key={day}
                disabled={disabled}
                onClick={() => { setSelectedDate(day); setSelectedTime(null) }}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: selected
                    ? (sessionObj?.color || 'var(--text)')
                    : todayDay
                      ? 'rgba(255,255,255,0.06)'
                      : 'transparent',
                  color: selected
                    ? '#000'
                    : disabled
                      ? 'rgba(255,255,255,0.12)'
                      : 'var(--text)',
                  border: todayDay && !selected ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: selected || todayDay ? 600 : 400,
                  cursor: disabled ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                  padding: 0,
                }}
                onMouseEnter={e => {
                  if (!disabled && !selected) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }}
                onMouseLeave={e => {
                  if (!disabled && !selected) e.currentTarget.style.background = todayDay ? 'rgba(255,255,255,0.06)' : 'transparent'
                }}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      <AnimatePresence>
        {selectedDate && selectedSession && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              color: 'var(--muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}>
              Available times — {MONTHS[currentMonth]} {selectedDate}
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.4rem',
            }}>
              {TIME_SLOTS.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  style={{
                    background: selectedTime === t ? (sessionObj?.color || 'var(--text)') : 'var(--surface2)',
                    color: selectedTime === t ? '#000' : 'var(--text)',
                    border: `1px solid ${selectedTime === t ? 'transparent' : 'var(--border)'}`,
                    borderRadius: 6,
                    padding: '0.5rem 0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (selectedTime !== t) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                  }}
                  onMouseLeave={e => {
                    if (selectedTime !== t) e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm button */}
      <AnimatePresence>
        {selectedDate && selectedSession && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <div style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '0.75rem 1rem',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: sessionObj?.color,
                flexShrink: 0,
              }} />
              <div>
                <p style={{ color: 'var(--text)', fontSize: '0.82rem', fontWeight: 500 }}>
                  {sessionObj?.label} — {sessionObj?.duration}
                </p>
                <p style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>
                  {dateStr} at {selectedTime}
                </p>
              </div>
            </div>
            <button
              onClick={handleConfirm}
              style={{
                width: '100%',
                background: sessionObj?.color || 'var(--text)',
                color: '#000',
                border: 'none',
                borderRadius: 8,
                padding: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Confirm Booking
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!selectedSession && (
        <p style={{ color: 'var(--muted)', fontSize: '0.72rem', textAlign: 'center' }}>
          Select a session type, then pick a date and time.
        </p>
      )}
    </div>
  )
}
