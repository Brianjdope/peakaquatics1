import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CONTACT_INFO } from '../data'

const CONTACT_HERO = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/b836c977-cfa8-4164-9d97-5afff61c5640/AdobeStock_466733610.jpeg'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="section-label">Get In Touch</p>
            <h1 className="page-title">Contact</h1>
          </motion.div>
        </div>
      </div>

      <section className="page-section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div className="contact-grid">
            {/* Left: info */}
            <motion.div
              className="contact-info"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2>get in touch</h2>
              <p style={{ marginTop: '1rem', marginBottom: '2.5rem', color: 'var(--muted)' }}>
                Contact us and we will be in touch with you shortly.
              </p>

              {/* Hours */}
              {CONTACT_INFO.hours.map((h, i) => (
                <div key={i} style={{ marginBottom: '1.8rem' }}>
                  <div className="contact-detail-label">{h.season}</div>
                  <div className="contact-detail-value" style={{ marginTop: '0.4rem' }}>{h.weekday}</div>
                  <div className="contact-detail-value">{h.weekend}</div>
                </div>
              ))}

              {/* Location & contact */}
              <div className="contact-detail" style={{ marginTop: '1.5rem' }}>
                <div className="contact-detail-item">
                  <span className="contact-detail-label">Location</span>
                  <span className="contact-detail-value" style={{ whiteSpace: 'pre-line' }}>
                    {CONTACT_INFO.location}
                  </span>
                </div>
                <div className="contact-detail-item" style={{ marginTop: '1rem' }}>
                  <span className="contact-detail-label">Email</span>
                  <span className="contact-detail-value">{CONTACT_INFO.email}</span>
                </div>
                <div className="contact-detail-item" style={{ marginTop: '1rem' }}>
                  <span className="contact-detail-label">Instagram</span>
                  <span className="contact-detail-value">{CONTACT_INFO.instagram}</span>
                </div>
              </div>
            </motion.div>

            {/* Right: form */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              {submitted ? (
                <div className="form-success">
                  <p style={{ color: 'var(--accent)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Thank you!</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                    We will be in touch with you shortly.
                  </p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" name="name" value={form.name} onChange={handleChange} required placeholder="Your name" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input type="text" id="subject" name="subject" value={form.subject} onChange={handleChange} required placeholder="How can we help?" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" name="message" value={form.message} onChange={handleChange} required placeholder="Tell us about your goals..." />
                  </div>
                  <button type="submit" className="form-submit">Submit</button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
