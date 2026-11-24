import React, { useEffect, useState } from 'react'

// Owns its own scroll state so a scroll event re-renders only this bar,
// not the whole page tree in App.
export default function ScrollProgress() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const p = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100
      setPct(Math.min(p || 0, 100))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return <div className="scroll-progress" style={{ width: `${pct}%` }} />
}
