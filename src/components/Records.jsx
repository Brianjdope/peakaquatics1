import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RECORDS_HERO, RECORDS_TABLES } from '../data'
import { useInView } from '../hooks/useInView'

const TAB_KEYS = ['scy-men', 'scy-women', 'lcm-men', 'lcm-women']

const Medal = ({ place }) => {
  const colors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: colors[place] || '#666',
      color: '#1a1a2e',
      fontSize: '0.65rem',
      fontWeight: 800,
      flexShrink: 0,
    }}>
      {place}
    </span>
  )
}

export default function Records() {
  const [ref, inView] = useInView(0.1)
  const [activeTab, setActiveTab] = useState('scy-men')

  const table = RECORDS_TABLES[activeTab]

  return (
    <section className="records" id="records" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
        >
          <p className="section-label">Program Records</p>
          <h2>All-Time Bests</h2>
        </motion.div>

        {/* Hero Cards */}
        <motion.div
          className="records-hero-grid"
          style={{ marginTop: '2.5rem' }}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.95, delay: 0.15 }}
        >
          {RECORDS_HERO.map((r, i) => (
            <div className="record-hero-card" key={i}>
              <div className="record-badge">{r.badge}</div>
              <div className="record-time">{r.time}</div>
              <div className="record-event">{r.event}</div>
              <div className="record-swimmer">{r.swimmer}</div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.3 }}
          style={{ marginTop: '3rem' }}
        >
          <div className="records-tabs">
            {TAB_KEYS.map(key => (
              <button
                key={key}
                className={`tab-btn${activeTab === key ? ' active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {RECORDS_TABLES[key].label.replace(' — ', ' ')}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1rem' }}
            >
              {table.rows.map(([event, n1, t1, y1, n2, t2, y2, n3, t3, y3], i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '0.75rem 1rem',
                  }}
                >
                  <div style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text)',
                    marginBottom: '0.5rem',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}>
                    {event}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {[
                      { medal: 1, name: n1, time: t1, year: y1 },
                      { medal: 2, name: n2, time: t2, year: y2 },
                      { medal: 3, name: n3, time: t3, year: y3 },
                    ].filter(p => p.name).map(p => (
                      <div key={p.medal} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Medal place={p.medal} />
                        <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text2)', fontWeight: 500 }}>
                          {p.name}
                        </span>
                        <span style={{
                          fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)',
                          fontFamily: 'monospace', minWidth: 65, textAlign: 'right',
                        }}>
                          {p.time}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', minWidth: 30, textAlign: 'right' }}>
                          {p.year}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
