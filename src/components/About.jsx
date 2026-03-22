import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

const ABOUT_IMG = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/1768921889010-CI1NQOOZMBGTLGYH81VB/IMG_2412.JPEG'

const CREDENTIALS = [
  'Former collegiate swimmer and elite-level coach',
  'ASCA Level 4 certified — top tier of national coaching certification',
  '12th all-time US 1500m Freestyle record holder in his program',
  'Specializes in stroke mechanics, race strategy, and collegiate recruitment',
  'Based in Ramsey, NJ — training athletes across the tri-state area',
]

export default function About() {
  const [ref, inView] = useInView(0.2)

  return (
    <section className="about" id="about">
      <div className="about-grid">
        <motion.div
          className="about-img-wrap"
          initial={{ x: -40, opacity: 0 }}
          animate={inView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.95, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <img src={ABOUT_IMG} alt="Coach Phil" />
        </motion.div>

        <motion.div
          ref={ref}
          className="about-content"
          initial={{ x: 40, opacity: 0 }}
          animate={inView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.95, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="section-label">About Coach Phil</p>
          <h2>An Elite Coach<br />for Elite Swimmers</h2>

          <p style={{ marginTop: '1.5rem' }}>
            Coach Phil brings years of high-performance training expertise to every session.
            With a deep understanding of competitive swimming at all levels — from junior nationals
            to Division I collegiate programs — his approach is technical, individual, and results-driven.
          </p>
          <p>
            Whether you're chasing a national qualifying time or navigating the college recruitment
            process, Coach Phil provides the edge that separates good swimmers from great ones.
          </p>

          <div className="about-credentials">
            {CREDENTIALS.map((c, i) => (
              <div className="credential-item" key={i}>
                <div className="credential-icon" />
                <span>{c}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <a className="btn btn-solid" href="#contact">Start Training</a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
