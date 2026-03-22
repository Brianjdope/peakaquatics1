import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ARTICLES } from '../data'

export default function NewsModal({ id, onClose }) {
  const article = id ? ARTICLES[id] : null

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = id ? 'hidden' : ''
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [id, onClose])

  return (
    <AnimatePresence>
      {article && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            className="modal-panel"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
            <img
              className="modal-img"
              src={article.img}
              alt={article.title}
              style={{ objectPosition: article.imgPos || 'center 30%' }}
            />
            <div className="modal-body">
              <div className="modal-meta">
                <span className="article-tag">{article.tag}</span>
                <span className="article-date">{article.date}</span>
              </div>
              <h2>{article.title}</h2>
              <div style={{ marginTop: '1.5rem' }}>
                {article.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
