import { useEffect } from 'react'

// To activate: sign up free at https://behold.so, connect @scarletaquatics,
// copy your Feed ID, and replace the placeholder below.
const BEHOLD_FEED_ID = '' // ← paste your Behold Feed ID here

export default function InstagramFeed() {
  useEffect(() => {
    if (!BEHOLD_FEED_ID) return
    if (document.querySelector('script[src*="behold.so"]')) return
    const s = document.createElement('script')
    s.src = 'https://w.behold.so/widget.js'
    s.type = 'module'
    document.head.appendChild(s)
  }, [])

  return (
    <section style={{ background: 'var(--bg)', padding: '6rem 0', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p className="section-label">Follow Along</p>
            <h2 style={{ marginTop: '0.5rem' }}>@scarletaquatics</h2>
          </div>
          <a
            href="https://www.instagram.com/scarletaquatics/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--muted)', fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '0.05em' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            View Profile
          </a>
        </div>

        {BEHOLD_FEED_ID ? (
          /* eslint-disable-next-line react/no-unknown-property */
          <behold-widget feed-id={BEHOLD_FEED_ID} />
        ) : (
          /* Placeholder grid shown until Behold is configured */
          <div>
            <div className="instagram-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '4px',
            }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <a
                  key={i}
                  href="https://www.instagram.com/scarletaquatics/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    aspectRatio: '1',
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="rgba(255,255,255,0.15)" stroke="none"/>
                  </svg>
                </a>
              ))}
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '1.5rem', lineHeight: 1.7 }}>
              To show live posts: sign up free at{' '}
              <a href="https://behold.so" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline' }}>
                behold.so
              </a>
              , connect @scarletaquatics, then paste your Feed ID into{' '}
              <code style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>InstagramFeed.jsx</code>.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
