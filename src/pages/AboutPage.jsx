import React from 'react'
import { motion } from 'framer-motion'
import { ABOUT } from '../data'

const COACH_IMG = '/legacy/v2.webp'
const WATER_BG = '/legacy/bernd-dittrich-pa0-0svirnm-unsplash.webp'

export default function AboutPage() {
  return (
    <div className="page-wrapper">
      {/* Mission — water background with dark overlay, starts at top */}
      <section className="page-section" style={{ position: 'relative', overflow: 'hidden', paddingTop: '5.5rem' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${WATER_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.14,
          filter: 'saturate(0.3)',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="two-col-grid">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <p className="section-label">Our Mission</p>
              <h2>What We Stand For</h2>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
              <p className="body-text">{ABOUT.mission}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Coach Bio */}
      <section className="page-section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="about-grid">
            <motion.div
              className="about-img-wrap"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.1 }}
            >
              <img src={COACH_IMG} alt="Coach Philip Kang" />
            </motion.div>

            <motion.div
              className="about-content"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
            >
              <p className="section-label">The Founder</p>
              <h2>Philip Kang</h2>
              <div style={{ marginTop: '1.5rem' }}>
                {ABOUT.coachBio.map((para, i) => (
                  <p key={i} className="body-text" style={{ marginBottom: '1.2rem' }}>{para}</p>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trusted Partners */}
      <section className="page-section" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="section-label">Our Trusted Partners</p>
          <h2 style={{ marginBottom: '3rem' }}>Our Trusted Partners</h2>
          <div className="partners-row">
            {ABOUT.partners.map((p) => (
              <div key={p.name} className="partner-card">
                <img
                  src={p.img}
                  alt={p.name}
                  className="partner-logo"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
                <span className="partner-name-fallback" style={{ display: 'none' }}>{p.name}</span>
                <p className="partner-name">{p.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
