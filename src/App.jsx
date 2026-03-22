import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Nav from './components/Nav'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import NewsPage from './pages/NewsPage'
import RecordsPage from './pages/RecordsPage'
import ServicesPage from './pages/ServicesPage'
import PlacementsPage from './pages/PlacementsPage'
import ContactPage from './pages/ContactPage'

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.3 } },
}

export default function App() {
  const [page, setPage] = useState('home')
  const [scrollPct, setScrollPct] = useState(0)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [page])

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100
      setScrollPct(Math.min(pct || 0, 100))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const renderPage = () => {
    switch (page) {
      case 'home':       return <HomePage setPage={setPage} />
      case 'about':      return <AboutPage />
      case 'news':       return <NewsPage />
      case 'records':    return <RecordsPage />
      case 'services':   return <ServicesPage setPage={setPage} />
      case 'placements': return <PlacementsPage />
      case 'contact':    return <ContactPage />
      default:           return <HomePage setPage={setPage} />
    }
  }

  return (
    <>
      <div className="scroll-progress" style={{ width: `${scrollPct}%` }} />
      <Nav page={page} setPage={setPage} />

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      <Footer setPage={setPage} />
    </>
  )
}
