import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LOGO_URL = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/7fd6ea37-8f94-4626-ac71-1fe5e214471e/peak-aquatic-primary-logo-black.png'

export default function Preloader({ onComplete }) {
  // Phases: logo → tagline → reveal → done
  const [phase, setPhase] = useState('logo')
  const timeouts = useRef([])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 1400)
    const t2 = setTimeout(() => setPhase('reveal'), 2600)
    const t3 = setTimeout(() => { setPhase('done'); onComplete?.() }, 3200)
    timeouts.current = [t1, t2, t3]
    return () => timeouts.current.forEach(clearTimeout)
  }, [onComplete])

  if (phase === 'done') return null

  const showTagline = phase === 'tagline' || phase === 'reveal'
  const isReveal = phase === 'reveal'

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isReveal ? 0 : 1 }}
          transition={{ duration: isReveal ? 0.8 : 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#030303',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 2vw',
          }}>
            {/* Logo — fades and scales in */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                opacity: { duration: 0.8, ease: 'easeOut' },
                scale: { duration: 1, ease: [0.16, 1, 0.3, 1] },
              }}
              style={{
                height: 'clamp(95px, 17vw, 185px)',
                overflow: 'hidden',
                userSelect: 'none',
              }}
            >
              <img
                src={LOGO_URL}
                alt="Peak Aquatic Sports"
                style={{
                  height: 'clamp(130px, 26vw, 280px)',
                  width: 'auto',
                  filter: 'brightness(0) invert(1) contrast(10)',
                  objectPosition: 'top',
                  display: 'block',
                }}
              />
            </motion.div>

            {/* Rise Higher — appears after logo */}
            {showTagline && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  marginTop: 'clamp(0.8rem, 1.5vw, 1.5rem)',
                  fontFamily: "'Anton', Arial, sans-serif",
                  fontSize: 'clamp(0.9rem, 1.5vw, 1.3rem)',
                  color: 'rgba(252,252,252,0.6)',
                  letterSpacing: '0.12em',
                  fontWeight: 400,
                  userSelect: 'none',
                  textTransform: 'uppercase',
                }}
              >
                Rise Higher
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
