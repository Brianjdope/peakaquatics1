import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

// Custom editorial line marks — replace generic emoji with brand-aligned icons
const IconLanes = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M2 7h20M2 12h20M2 17h20" />
    <circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
)
const IconPennant = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 3v18" />
    <path d="M5 4l13 2.2-3.5 4 3.5 4L5 12.4" />
  </svg>
)
const IconPeriodization = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 19V13M8 19V9M13 19V5M18 19V11" />
    <path d="M2 19h20" />
  </svg>
)

const SERVICES = [
  {
    Icon: IconLanes,
    title: 'Private Coaching',
    desc: 'One-on-one sessions tailored to your stroke, race strategy, and physical development. Each session is structured around your specific goals — whether that\'s breaking a personal best or earning a national qualifying time.',
    price: 'Hourly & Package Rates Available',
  },
  {
    Icon: IconPennant,
    title: 'Collegiate Consulting',
    desc: 'End-to-end guidance through the college recruitment process — from building your athletic profile and contacting coaches, to evaluating offers and committing to the right program. Division I, II, and III.',
    price: 'Consulting Packages Available',
  },
  {
    Icon: IconPeriodization,
    title: 'Custom Training Plans',
    desc: 'Personalized seasonal training programs designed to peak at the right meets. Programs include dryland training, nutrition guidance, and meet preparation strategies for junior and senior national qualifiers.',
    price: 'Monthly Plans Available',
  },
]

const FAQS = [
  { q: 'Who do you train?', a: 'Competitive swimmers aged 12 and up, from club-level to nationally ranked juniors. All strokes and events welcome.' },
  { q: 'Where are you located?', a: 'Based in Ramsey, NJ. Sessions are available at partner facilities across Bergen County and the surrounding area.' },
  { q: 'How does collegiate consulting work?', a: 'We begin with an evaluation of your times, academic profile, and school preferences, then build a targeted outreach strategy and guide you through every step of the commitment.' },
  { q: 'What results have your athletes achieved?', a: '20+ college placements (D1–D3), a 4th place World Junior Championships finish, national team selection, and multiple US Top-20 all-time rankings.' },
  { q: 'How do I get started?', a: 'Fill out the contact form or send an email. Coach Phil will reach out within 24 hours to schedule an initial consultation.' },
  { q: 'Do you offer group sessions?', a: 'Yes — small group sessions (2–4 athletes) are available for swimmers at similar levels who want to train together.' },
]

export default function Services() {
  const [ref, inView] = useInView(0.1)

  return (
    <section className="services" id="services" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
        >
          <p className="section-label">What We Offer</p>
          <h2>Training &amp; Services</h2>
        </motion.div>

        <motion.div
          className="services-grid"
          style={{ marginTop: '3rem' }}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.95, delay: 0.15 }}
        >
          {SERVICES.map((s, i) => {
            const Icon = s.Icon
            return (
              <div className="service-card" key={i}>
                <span className="service-index">{String(i + 1).padStart(2, '0')}</span>
                <div className="service-icon"><Icon /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="service-price">{s.price}</div>
              </div>
            )
          })}
        </motion.div>

        <motion.div
          style={{ marginTop: '5rem' }}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.3 }}
        >
          <p className="section-label">Questions</p>
          <h2>Frequently Asked</h2>
          <div className="faq-grid" style={{ marginTop: '2rem' }}>
            {FAQS.map((f, i) => (
              <div className="faq-item" key={i}>
                <h4>{f.q}</h4>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
