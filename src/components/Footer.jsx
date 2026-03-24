import React from 'react'
import { CONTACT_INFO } from '../data'

const COL1 = [
  { label: 'Home',       page: 'home' },
  { label: 'About',      page: 'about' },
  { label: 'News & Events', page: 'news' },
  { label: 'Records',    page: 'records' },
]
const COL2 = [
  { label: 'Services',   page: 'services' },
  { label: 'Placements', page: 'placements' },
  { label: 'Contact',    page: 'contact' },
]

export default function Footer({ setPage }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Peak <span>Aquatic</span> Sports</h3>
            <p>Elite competitive swimming coaching and collegiate recruitment consulting based in Ramsey, NJ.</p>
            <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{CONTACT_INFO.email}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Instagram: {CONTACT_INFO.instagram}</span>
            </div>
          </div>

          <div className="footer-nav">
            <div className="footer-nav-title">Navigate</div>
            <ul>
              {COL1.map(l => (
                <li key={l.label}>
                  <button className="footer-nav-btn" onClick={() => setPage(l.page)}>{l.label}</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-nav">
            <div className="footer-nav-title">More</div>
            <ul>
              {COL2.map(l => (
                <li key={l.label}>
                  <button className="footer-nav-btn" onClick={() => setPage(l.page)}>{l.label}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Peak Aquatic Sports. All rights reserved.</span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
            <button className="footer-nav-btn" onClick={() => setPage('terms')} style={{ fontSize: '0.78rem' }}>Terms & Conditions</button>
            <span>Ramsey, NJ · 150 Triangle Plaza</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
