import React from 'react'
import { TICKER_ITEMS } from '../data'

export default function Ticker() {
  // Duplicate for seamless loop
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div className="ticker-wrapper">
      <div className="ticker-track">
        {items.map(([name, achievement], i) => (
          <span className="ticker-item" key={i}>
            <strong>{name}</strong>
            {achievement}
            <span className="ticker-dot" />
          </span>
        ))}
      </div>
    </div>
  )
}
