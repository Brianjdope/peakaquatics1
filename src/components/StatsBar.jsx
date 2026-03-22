import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { STATS } from '../data'

function StatBlock({ num, label }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`stat-block${inView ? ' in-view' : ''}`}>
      <motion.div
        className="stat-num"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {num}
      </motion.div>
      <motion.div
        className="stat-label"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.15 }}
      >
        {label}
      </motion.div>
    </div>
  )
}

export default function StatsBar() {
  return (
    <div className="stats-bar">
      <div className="container">
        <div className="stats-grid">
          {STATS.map((s, i) => (
            <StatBlock key={i} {...s} />
          ))}
        </div>
      </div>
    </div>
  )
}
