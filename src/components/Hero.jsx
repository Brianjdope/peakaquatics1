import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const HERO_IMG = '/photos/kate-usa.jpg'

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

export default function Hero() {
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
    <section className="hero">
      <div
        ref={bgRef}
        className="hero-bg"
        style={{ backgroundImage: `url(${HERO_IMG})` }}
      />
      <div className="hero-overlay" />
      <div className="hero-glow" />

      <div className="hero-content">
        <motion.p
          className="hero-eyebrow"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.9, delay: 0.1 }}
        >
          Ramsey, NJ · Elite Competitive Swimming
        </motion.p>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.95, delay: 0.25 }}
        >
          Where <em>Champions</em><br />
          Are Made
        </motion.h1>

        <motion.p
          className="hero-sub"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.95, delay: 0.4 }}
        >
          Private elite coaching and collegiate recruitment consulting for swimmers ready to compete at the highest level.
        </motion.p>

        <motion.div
          className="hero-actions"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.95, delay: 0.55 }}
        >
          <a className="btn btn-solid" href="#contact">Work With Coach Phil</a>
          <a className="btn" href="#about">Learn More</a>
        </motion.div>
      </div>

      <div className="hero-scroll">
        <div className="hero-scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  )
}
