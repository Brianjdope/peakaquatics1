import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MILESTONES } from '../data'

const EASE = [0.16, 1, 0.3, 1]

export default function Milestones() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <section
      ref={sectionRef}
      style={{
        background: 'var(--bg)',
        padding: '6rem 0 5rem',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <p className="section-label">Recent Wins</p>
            <h2 style={{ marginTop: '0.5rem' }}>Recent<br />Milestones</h2>
          </div>
          <p style={{
            color: 'var(--muted)',
            maxWidth: '300px',
            fontSize: '0.88rem',
            lineHeight: 1.7,
            margin: 0,
          }}>
            Records broken, national cuts earned, podiums claimed — a snapshot of recent results from our athletes.
          </p>
        </motion.div>
      </div>

      <div className="milestones-track">
        {MILESTONES.map((m, i) => (
          <motion.div
            key={i}
            className="milestone-card"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.08 * i, ease: EASE }}
          >
            <div className="milestone-accent" />
            <div className="milestone-tag">{m.tag}</div>
            <div className="milestone-time">{m.time}</div>
            <div className="milestone-event">{m.event}</div>
            <div className="milestone-foot">
              <span className="milestone-name">{m.name}</span>
              <span className="milestone-date">{m.date}</span>
            </div>
          </motion.div>
        ))}
        {/* Trailing spacer so the last card can scroll into a comfortable position */}
        <div style={{ flexShrink: 0, width: '2rem' }} aria-hidden="true" />
      </div>
    </section>
  )
}
