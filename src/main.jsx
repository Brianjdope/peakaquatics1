import React from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import App from './App'
import './styles/globals.css'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg, #0a0a0a)', color: '#fff', padding: '2rem', textAlign: 'center'
    }}>
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', lineHeight: 1.6 }}>
          We hit an unexpected error. Please try again, or refresh the page.
        </p>
        <pre style={{
          background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 8,
          fontSize: '0.8rem', textAlign: 'left', overflow: 'auto', marginBottom: '1.5rem'
        }}>{error?.message}</pre>
        <button
          onClick={resetErrorBoundary}
          style={{
            padding: '0.85rem 2rem', background: '#fff', color: '#000', border: 'none',
            borderRadius: 999, fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem'
          }}
        >Try again</button>
      </div>
    </div>
  )
}

// Unregister any stale service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()))
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
