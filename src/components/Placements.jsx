import React from 'react'
import { motion } from 'framer-motion'
import { PLACEMENTS } from '../data'
import { useInView } from '../hooks/useInView'

export default function Placements() {
  const [ref, inView] = useInView(0.1)

  return (
    <section className="placements" id="placements" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
        >
          <p className="section-label">College Placements</p>
          <h2>Where Our Athletes<br />Go Next</h2>
          <p style={{ marginTop: '1rem', maxWidth: '540px' }}>
            Over 20 student-athletes placed at Division I, II, and III programs across the country — a testament to world-class coaching and comprehensive recruitment guidance.
          </p>
        </motion.div>

        <motion.div
          className="placements-grid"
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.95, delay: 0.2 }}
        >
          {PLACEMENTS.map((p, i) => (
            <div className="placement-card" key={i}>
              <div className="placement-name">{p.name}</div>
              <div className="placement-school">{p.school}</div>
              {p.year && <div className="placement-year">Class of {p.year}</div>}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
