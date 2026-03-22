import React from 'react'
import { motion } from 'framer-motion'
import { SERVICES_DATA, FAQS } from '../data'

const SERVICES_HERO = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/d5442bc1-106e-4cbb-b97c-1bf08cf27df3/AdobeStock_135671836.jpeg'

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
                <div className="service-icon">{s.icon}</div>
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
