import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

export default function Contact() {
  const [ref, inView] = useInView(0.1)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', interest: '', message: ''
  })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In production, wire this to a real form backend (Formspree, EmailJS, etc.)
    setSubmitted(true)
  }

  return (
    <section className="contact" id="contact" ref={ref}>
      <div className="container">
        <div className="contact-grid">
          <motion.div
            className="contact-info"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.95 }}
          >
            <p className="section-label">Get In Touch</p>
            <h2>Ready to Train<br />at the Elite Level?</h2>
            <p style={{ marginTop: '1.5rem' }}>
              Whether you're a competitive swimmer looking to break through to the next level,
              or a family navigating the college recruitment process — Coach Phil is here to help.
            </p>

            <div className="contact-detail">
              <div className="contact-detail-item">
                <span className="contact-detail-label">Location</span>
                <span className="contact-detail-value">Ramsey, NJ — Bergen County</span>
              </div>
              <div className="contact-detail-item">
                <span className="contact-detail-label">Email</span>
                <span className="contact-detail-value">info@peakaquaticsports.com</span>
              </div>
              <div className="contact-detail-item">
                <span className="contact-detail-label">Response Time</span>
                <span className="contact-detail-value">Within 24 hours</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.95, delay: 0.15 }}
          >
            {submitted ? (
              <div className="form-success">
                <p style={{ color: 'var(--accent)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Message Received</p>
                <p style={{ fontSize: '0.9rem' }}>Thank you for reaching out. Coach Phil will be in touch within 24 hours.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone (Optional)</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="(201) 000-0000"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="interest">Area of Interest</label>
                    <select
                      id="interest"
                      name="interest"
                      value={form.interest}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>Select an option</option>
                      <option value="private">Private Coaching</option>
                      <option value="consulting">Collegiate Consulting</option>
                      <option value="plan">Custom Training Plan</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us about your goals and current competitive level..."
                  />
                </div>

                <button type="submit" className="form-submit">
                  Send Message →
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
