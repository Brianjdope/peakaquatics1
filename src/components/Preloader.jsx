import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LOGO_URL = 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/7fd6ea37-8f94-4626-ac71-1fe5e214471e/peak-aquatic-primary-logo-black.png'

const TITLE_LETTERS = 'PEAK AQUATIC SPORTS'.split('')

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1]
const EASE_OUT_QUART = [0.25, 1, 0.5, 1]

export default function Preloader({ onComplete }) {
  // Phases: line → logo → title → tagline → reveal → done
  const [phase, setPhase] = useState('line')
  const [skipped, setSkipped] = useState(false)
  const [reducedMotion] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
  // Detect mobile once so the hand-off morph offset matches the hero header
  // layout for the current breakpoint. On desktop, the hero's heavier bottom
  // padding offsets its content ~4rem above viewport center; on mobile that
  // offset is essentially zero after the recent padding tightening.
  const [isMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth <= 768
  )
  const heroOffsetY = isMobile ? '-0.4rem' : '-4rem'
  const heroOffsetScale = isMobile ? 0.94 : 0.89
  const timeoutsRef = useRef([])

  useEffect(() => {
    // Pre-warm the homepage hero hand-off image so it doesn't pop in.
    if (typeof window !== 'undefined') {
      const img = new Image()
      img.src = LOGO_URL
    }

    if (reducedMotion) {
      // Quick, accessible fade — no theatrics.
      const t = setTimeout(() => { setPhase('done'); onComplete?.() }, 400)
      timeoutsRef.current = [t]
      return () => clearTimeout(t)
    }

    const t1 = setTimeout(() => setPhase('logo'),    600)
    const t2 = setTimeout(() => setPhase('title'),   1700)
    const t3 = setTimeout(() => setPhase('tagline'), 2900)
    const t4 = setTimeout(() => setPhase('reveal'),  4100)
    const t5 = setTimeout(() => { setPhase('done'); onComplete?.() }, 4900)
    timeoutsRef.current = [t1, t2, t3, t4, t5]

    const skip = () => {
      // Cancel pending phase advances, freeze current visible elements,
      // and quickly fade everything out.
      timeoutsRef.current.forEach(clearTimeout)
      setSkipped(true)
      const fin = setTimeout(() => { setPhase('done'); onComplete?.() }, 400)
      timeoutsRef.current = [fin]
    }

    const onKey = (e) => { if (e.key === 'Escape') skip() }

    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', skip)
    window.addEventListener('wheel', skip, { passive: true })
    window.addEventListener('touchmove', skip, { passive: true })

    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchmove', skip)
    }
  }, [onComplete, reducedMotion])

  if (phase === 'done') return null

  // Reduced-motion render: minimal, quick fade.
  if (reducedMotion) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#030303',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 2vw',
          }}
        >
          <img
            src={LOGO_URL}
            alt="Peak Aquatic Sports"
            style={{
              height: 'clamp(95px, 17vw, 185px)',
              width: 'auto',
              filter: 'brightness(0) invert(1) contrast(10)',
              objectPosition: 'top',
            }}
          />
          <div
            style={{
              marginTop: '1rem',
              fontFamily: "'Anton', Arial, sans-serif",
              fontSize: 'clamp(0.9rem, 1.5vw, 1.3rem)',
              color: 'rgba(252,252,252,0.65)',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
            }}
          >
            Rise Higher
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  const showLine    = phase !== 'line'
  const showLogo    = ['logo', 'title', 'tagline', 'reveal'].includes(phase)
  const showTitle   = ['title', 'tagline', 'reveal'].includes(phase)
  const showTagline = phase === 'tagline' || phase === 'reveal'
  const showShimmer = showTagline
  const isReveal    = phase === 'reveal'
  const isLogoOnly  = phase === 'logo'
  const isFading    = isReveal || skipped

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isFading ? 0 : 1 }}
          transition={{
            opacity: {
              duration: skipped ? 0.4 : 0.7,
              delay: isReveal && !skipped ? 0.25 : 0,
              ease: EASE_OUT_EXPO,
            },
          }}
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
          {/* Ambient gradient wash — subtle aurora suggesting water depth */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isFading ? 0 : 0.6 }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse at 30% 20%, rgba(58, 134, 200, 0.18) 0%, transparent 55%), ' +
                'radial-gradient(ellipse at 70% 80%, rgba(28, 90, 150, 0.16) 0%, transparent 55%)',
              pointerEvents: 'none',
            }}
          />

          {/* Top accent line — draws outward from center */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: showLine ? 1 : 0,
              opacity: showLine && !isFading ? 1 : 0,
            }}
            transition={{
              scaleX: { duration: 1.1, ease: EASE_OUT_EXPO },
              opacity: { duration: 0.4 },
            }}
            style={{
              position: 'absolute',
              top: 'calc(50% - clamp(140px, 22vw, 240px))',
              left: '50%',
              transform: 'translateX(-50%)',
              transformOrigin: 'center',
              width: 'clamp(180px, 30vw, 360px)',
              height: '1px',
              background:
                'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
            }}
          />

          {/* Bottom accent line — mirrors top */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: showLine ? 1 : 0,
              opacity: showLine && !isFading ? 1 : 0,
            }}
            transition={{
              scaleX: { duration: 1.1, ease: EASE_OUT_EXPO, delay: 0.1 },
              opacity: { duration: 0.4, delay: 0.1 },
            }}
            style={{
              position: 'absolute',
              bottom: 'calc(50% - clamp(160px, 24vw, 260px))',
              left: '50%',
              transform: 'translateX(-50%)',
              transformOrigin: 'center',
              width: 'clamp(180px, 30vw, 360px)',
              height: '1px',
              background:
                'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
            }}
          />

          {/* Hand-off morph wrapper: during reveal, scale down to match the
              hero header's size exactly (logo ratio 250/280 = 0.89) and lift
              up by the hero's content offset so the preloader's logo/title
              come to rest at the precise position where the hero version will
              render. The result is a seamless dissolve — the eye sees one
              continuous element, not a curtain. */}
          <motion.div
            animate={{
              scale: isReveal ? heroOffsetScale : 1,
              y: isReveal ? heroOffsetY : 0,
            }}
            transition={{
              scale: { duration: 0.9, ease: EASE_OUT_EXPO },
              y: { duration: 0.9, ease: EASE_OUT_EXPO },
            }}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 2vw',
            }}
          >
            {/* Logo — fades in with float-up, gentle scale, and blur-to-clear */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 14, filter: 'blur(6px)' }}
              animate={{
                opacity: showLogo ? 1 : 0,
                scale: showLogo ? 1 : 0.85,
                y: 0,
                filter: 'blur(0px)',
                marginBottom: isLogoOnly ? 0 : 'clamp(1.5rem, 3vw, 2.5rem)',
              }}
              transition={{
                opacity: { duration: 0.9, ease: 'easeOut' },
                scale: { duration: 1.1, ease: EASE_OUT_EXPO },
                y: { duration: 1, ease: EASE_OUT_EXPO },
                filter: { duration: 0.8, ease: 'easeOut' },
                marginBottom: { duration: 0.9, ease: EASE_OUT_EXPO },
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

            {/* PEAK AQUATIC SPORTS — clip-mask reveal from bottom, staggered,
                with a chrome-shine shimmer sweep after the letters settle */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'nowrap',
                height: showTitle ? 'auto' : 0,
                overflow: 'hidden',
              }}
            >
              {showTitle && TITLE_LETTERS.map((char, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    overflow: 'hidden',
                    lineHeight: 0.9,
                    marginRight: char === ' ' ? 'clamp(0.5rem, 1.5vw, 1.2rem)' : 0,
                  }}
                >
                  <motion.span
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{
                      duration: 0.9,
                      delay: 0.035 * i,
                      ease: EASE_OUT_EXPO,
                    }}
                    style={{
                      display: 'inline-block',
                      fontFamily: "'Anton', Arial, sans-serif",
                      fontSize: 'clamp(3rem, 9vw, 9rem)',
                      color: '#fcfcfc',
                      letterSpacing: '-0.02em',
                      fontWeight: 400,
                      lineHeight: 0.9,
                      userSelect: 'none',
                    }}
                  >
                    {char === ' ' ? '' : char}
                  </motion.span>
                </span>
              ))}

              {/* Soft halo breath — a faint ambient glow blooms once behind
                  the title and dissolves. Quiet, no movement of light across
                  the letters — just a sense of weight settling in. */}
              {showShimmer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: [0, 0.45, 0], scale: 1.15 }}
                  transition={{
                    opacity: { duration: 1.8, times: [0, 0.35, 1], ease: 'easeOut' },
                    scale: { duration: 1.8, ease: EASE_OUT_EXPO },
                  }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '110%',
                    height: '180%',
                    background:
                      'radial-gradient(ellipse at center, rgba(255,255,255,0.10) 0%, transparent 60%)',
                    pointerEvents: 'none',
                    zIndex: -1,
                  }}
                />
              )}
            </div>

            {/* Rise Higher — letter spacing expands outward */}
            {showTagline && (
              <motion.div
                initial={{ opacity: 0, letterSpacing: '0.02em', y: 8 }}
                animate={{ opacity: 1, letterSpacing: '0.32em', y: 0 }}
                transition={{
                  opacity: { duration: 0.7, ease: 'easeOut' },
                  letterSpacing: { duration: 1.1, ease: EASE_OUT_QUART },
                  y: { duration: 0.7, ease: EASE_OUT_EXPO },
                }}
                style={{
                  marginTop: 'clamp(0.9rem, 1.7vw, 1.6rem)',
                  fontFamily: "'Anton', Arial, sans-serif",
                  fontSize: 'clamp(0.9rem, 1.5vw, 1.3rem)',
                  color: 'rgba(252,252,252,0.65)',
                  fontWeight: 400,
                  userSelect: 'none',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                Rise Higher
              </motion.div>
            )}

            {/* Underline — draws beneath the tagline */}
            {showTagline && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.6 }}
                transition={{
                  scaleX: { duration: 1, ease: EASE_OUT_EXPO, delay: 0.25 },
                  opacity: { duration: 0.4, delay: 0.25 },
                }}
                style={{
                  marginTop: 'clamp(0.6rem, 1vw, 0.9rem)',
                  width: 'clamp(40px, 6vw, 70px)',
                  height: '1px',
                  background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.9), transparent)',
                  transformOrigin: 'center',
                }}
              />
            )}
          </motion.div>

          {/* Subtle skip hint — only after content is settled */}
          {showTagline && !isFading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              style={{
                position: 'absolute',
                bottom: 'clamp(1.5rem, 3vw, 2.5rem)',
                left: '50%',
                transform: 'translateX(-50%)',
                fontFamily: 'var(--mono, ui-monospace, monospace)',
                fontSize: '0.55rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.7)',
                userSelect: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Tap or press Esc to skip
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
