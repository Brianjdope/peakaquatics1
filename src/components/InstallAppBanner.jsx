import React, { useEffect, useState } from 'react'
import { bindInstallPrompt, promptInstall } from '../lib/pwa'

const DISMISS_KEY = 'peak-install-banner-dismissed'

function wasDismissed() {
  try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
}

export default function InstallAppBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    bindInstallPrompt((ready) => setVisible(ready && !wasDismissed()))
  }, [])

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="install-banner" role="status">
      <p className="install-banner-text">Install Peak Aquatic Sports for faster booking on your phone.</p>
      <div className="install-banner-actions">
        <button
          className="install-btn install-btn-primary"
          onClick={async () => {
            await promptInstall()
            setVisible(false)
          }}
        >
          Install App
        </button>
        <button className="install-btn" onClick={dismiss}>
          Not now
        </button>
      </div>
    </div>
  )
}
