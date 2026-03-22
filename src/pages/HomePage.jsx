import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Ticker from '../components/Ticker'
import StatsBar from '../components/StatsBar'
import SchoolLogo from '../components/SchoolLogo'
import Testimonials from '../components/Testimonials'
import { ABOUT } from '../data'

const HERO_IMG = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/f6ab90ae-4c57-4688-98b9-652657e80ec4/Banner1.jpg'

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const FEATURED_SCHOOLS = [
  'Princeton University',
  'University of Texas',
  'Harvard University',
  'Brown University',
  'West Point',
  'Wesleyan University',
  'Tufts University',
  'Cornell University',
  'Northwestern University',
  'Purdue University',
  'Colgate University',
  'University of Maine',
]

export default function HomePage({ setPage }) {
  const bgRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      if (bgRef.current) {
        bgRef.current.style.transform = `translateY(${window.scrollY * 0.28}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div ref={bgRef} className="hero-bg" style={{ backgroundImage: `url(${HERO_IMG})` }} />
        <div className="hero-overlay" />
        <div className="hero-glow" />

        <div className="hero-content">
          <motion.p className="hero-eyebrow" variants={fadeUp} initial="hidden" animate="visible"
            transition={{ duration: 0.9, delay: 0.1 }}>
            Ramsey, NJ · Elite Competitive Swimming
          </motion.p>

          <motion.h1 variants={fadeUp} initial="hidden" animate="visible"
            transition={{ duration: 0.95, delay: 0.25 }}>
            Go Above <em>&amp; Beyond</em>
          </motion.h1>

          <motion.p className="hero-sub" variants={fadeUp} initial="hidden" animate="visible"
            transition={{ duration: 0.95, delay: 0.4 }}>
            Refine your skill and maximize your efficiency in the water.
          </motion.p>

          <motion.div className="hero-actions" variants={fadeUp} initial="hidden" animate="visible"
            transition={{ duration: 0.95, delay: 0.55 }}>
            <button className="btn btn-solid" onClick={() => setPage('contact')}>Get In Touch</button>
            <button className="btn" onClick={() => setPage('about')}>Learn More</button>
          </motion.div>
        </div>

        <div className="hero-scroll">
          <div className="hero-scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* Ticker */}
      <Ticker />

      {/* Stats */}
      <StatsBar />

      {/* What We Do */}
      <section style={{ background: 'var(--surface)', padding: '6rem 0' }}>
        <div className="container">
          <div className="what-we-do-grid">
            <div>
              <p className="section-label">What We Do</p>
              <h2>A Consultancy Built<br />for Champions</h2>
            </div>
            <div>
              <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '1.2rem' }}>
                {ABOUT.homeIntro}
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '2rem' }}>
                {ABOUT.homeBody}
              </p>
              <button className="btn btn-solid" onClick={() => setPage('about')}>Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Excellence — School Emblems */}
      <section style={{ background: 'var(--bg)', padding: '6rem 0', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="section-label">Academic Excellence</p>
          <h2 style={{ marginBottom: '0.75rem' }}>Where Our Athletes Go</h2>
          <p style={{ color: 'var(--muted)', maxWidth: '500px', margin: '0 auto 3.5rem', fontSize: '0.9rem' }}>
            Our athletes compete and succeed at the nation's most prestigious universities.
          </p>
          <div className="schools-emblem-grid">
            {FEATURED_SCHOOLS.map(school => (
              <button
                key={school}
                className="school-emblem-card"
                onClick={() => setPage('placements')}
                title={school}
              >
                <SchoolLogo school={school} size={72} />
                <span className="school-emblem-name">{school}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: '3rem' }}>
            <button className="btn" onClick={() => setPage('placements')}>View All Placements</button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />
    </div>
  )
}
