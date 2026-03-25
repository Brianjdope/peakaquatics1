import React from 'react'
import { motion } from 'framer-motion'
import { SERVICES_DATA, FAQS } from '../data'
import BookingCalendar from '../components/BookingCalendar'

const SERVICES_HERO = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/d5442bc1-106e-4cbb-b97c-1bf08cf27df3/AdobeStock_135671836.jpeg'

const ServiceIcon = ({ type }) => {
  const size = 28
  const color = 'rgba(252,252,252,0.9)'
  const icons = {
    private: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M6 21v-2a6 6 0 0 1 12 0v2"/>
      </svg>
    ),
    semi: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="3.5"/>
        <path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2"/>
        <circle cx="18" cy="8" r="2.5"/>
        <path d="M18 13.5a4 4 0 0 1 4 4V21"/>
      </svg>
    ),
    group: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="3"/>
        <path d="M5 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2"/>
        <circle cx="4" cy="9" r="2.5"/>
        <path d="M4 14a4 4 0 0 0-3 4v3"/>
        <circle cx="20" cy="9" r="2.5"/>
        <path d="M20 14a4 4 0 0 1 3 4v3"/>
      </svg>
    ),
  }
  return icons[type] || null
}

export default function ServicesPage({ setPage }) {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header-bg" style={{ backgroundImage: `url(${SERVICES_HERO})` }} />
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="section-label">What We Offer</p>
            <h1 className="page-title">Services</h1>
          </motion.div>
        </div>
      </div>

      {/* Services */}
      <section className="page-section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <motion.div
            className="services-grid"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {SERVICES_DATA.map((s, i) => (
              <div className="service-card" key={i}>
                <div className="service-icon"><ServiceIcon type={s.icon} /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="service-price">Duration: {s.duration}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="page-section" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <p className="section-label">Questions</p>
            <h2 style={{ marginBottom: '2rem' }}>Frequently Asked</h2>
            <div className="faq-grid">
              {FAQS.map((f, i) => (
                <div className="faq-item" key={i}>
                  <h4>{f.q}</h4>
                  <p>{f.a}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Book a Session */}
      <section id="booking" className="page-section" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="contact-grid">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="section-label">Schedule</p>
              <h2 style={{ marginBottom: '0.75rem' }}>Book a Session</h2>
              <p style={{ color: 'var(--muted)', maxWidth: 440, marginBottom: '2rem', lineHeight: 1.7 }}>
                Pick a session type, choose a date and time, and we'll confirm your booking within 24 hours.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  { step: '01', title: 'Choose Your Session', desc: 'Select from intro calls, video reviews, private or group sessions.' },
                  { step: '02', title: 'Pick a Date & Time', desc: 'Browse available slots on the calendar and choose what works for you.' },
                  { step: '03', title: 'Get Confirmation', desc: 'We\'ll confirm your booking via email within 24 hours.' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                    style={{
                      display: 'flex',
                      gap: '1.25rem',
                      alignItems: 'flex-start',
                      padding: '1.25rem',
                      background: 'var(--surface2)',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '0.8rem',
                      color: 'var(--accent)',
                      fontWeight: 700,
                      minWidth: 32,
                      paddingTop: 2,
                    }}>{s.step}</span>
                    <div>
                      <h4 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>{s.title}</h4>
                      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{s.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <BookingCalendar />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--surface)', padding: '5rem 0', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem' }}>Ready to Get Started?</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
            Contact us and we will be in touch with you shortly.
          </p>
          <button className="btn btn-solid" onClick={() => setPage('contact')}>Contact Us</button>
        </div>
      </section>
    </div>
  )
}
