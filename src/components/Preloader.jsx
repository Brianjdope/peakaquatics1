import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LOGO_URL = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/7fd6ea37-8f94-4626-ac71-1fe5e214471e/peak-aquatic-primary-logo-black.png'

export default function Preloader({ onComplete }) {
  // Phases: logo → text → zoomOut → done
  const [phase, setPhase] = useState('logo')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 800)
    const t2 = setTimeout(() => setPhase('zoomOut'), 2600)
    const t3 = setTimeout(() => { setPhase('done'); onComplete?.() }, 3400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  if (phase === 'done') return null

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#030303',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            overflow: 'hidden',
          }}
        >
          {/* Insignia logo — pops out first */}
          <motion.img
            src={LOGO_URL}
            alt="Peak Aquatic Sports"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{
              scale: phase === 'zoomOut' ? 2.5 : 1,
              opacity: phase === 'zoomOut' ? 0 : 1,
            }}
            transition={{
              duration: phase === 'logo' ? 0.6 : phase === 'zoomOut' ? 0.8 : 1.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              height: 'clamp(80px, 18vw, 200px)',
              width: 'auto',
              filter: 'brightness(0) invert(1)',
              userSelect: 'none',
            }}
          />

          {/* "PEAK AQUATIC SPORTS" text — fades in after the logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: phase === 'text' ? 1 : phase === 'zoomOut' ? 0 : 0,
              y: phase === 'text' ? 0 : phase === 'zoomOut' ? -30 : 20,
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Anton', Arial, sans-serif",
              fontSize: 'clamp(1.2rem, 3vw, 2.5rem)',
              color: '#fcfcfc',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              userSelect: 'none',
            }}
          >
            Peak Aquatic Sports
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
