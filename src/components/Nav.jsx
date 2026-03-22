import React, { useEffect, useState } from 'react'

const LINKS = [
  { label: 'Home',       page: 'home' },
  { label: 'About',      page: 'about' },
  { label: 'News & Events', page: 'news' },
  { label: 'Records',    page: 'records' },
  { label: 'Services',   page: 'services' },
  { label: 'Placements', page: 'placements' },
]

export default function Nav({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav${scrolled || page !== 'home' ? ' scrolled' : ''}`}>
      <button className="nav-logo" onClick={() => setPage('home')}>
        <img
          src="https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/7fd6ea37-8f94-4626-ac71-1fe5e214471e/peak-aquatic-primary-logo-black.png"
          alt="Peak Aquatic Sports"
          className="nav-logo-img"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        <span className="nav-logo-text">Peak <span>Aquatic</span> Sports</span>
      </button>
      <ul className="nav-links">
        {LINKS.map(l => (
          <li key={l.label}>
            <button
              className={`nav-link-btn${page === l.page ? ' active' : ''}`}
              onClick={() => setPage(l.page)}
            >
              {l.label}
            </button>
          </li>
        ))}
      </ul>
      <button className="nav-cta" onClick={() => setPage('contact')}>Contact</button>
    </nav>
  )
}
