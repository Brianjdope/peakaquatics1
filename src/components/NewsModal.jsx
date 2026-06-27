import React, { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ARTICLES } from '../data'

export default function NewsModal({ id, onClose }) {
  const article = id ? ARTICLES[id] : null
  // null = lightbox closed, number = currently viewed photo index
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const gallery = article?.gallery || null

  // Reset lightbox whenever the article changes
  useEffect(() => { setLightboxIndex(null) }, [id])

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const nextPhoto = useCallback(() => {
    if (!gallery) return
    setLightboxIndex((i) => (i === null ? 0 : (i + 1) % gallery.length))
  }, [gallery])
  const prevPhoto = useCallback(() => {
    if (!gallery) return
    setLightboxIndex((i) => (i === null ? 0 : (i - 1 + gallery.length) % gallery.length))
  }, [gallery])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (lightboxIndex !== null) closeLightbox()
        else onClose()
      } else if (lightboxIndex !== null) {
        if (e.key === 'ArrowRight') nextPhoto()
        if (e.key === 'ArrowLeft')  prevPhoto()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = id ? 'hidden' : ''
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [id, onClose, lightboxIndex, closeLightbox, nextPhoto, prevPhoto])

  return (
    <>
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
              style={{ objectPosition: article.imgPos || 'center 30%', ...article.imgStyle }}
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

              {gallery && gallery.length > 0 && (
                <div className="modal-gallery">
                  <h3 className="modal-gallery-title">Photo Gallery</h3>
                  <div className="modal-gallery-grid">
                    {gallery.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        className="modal-gallery-thumb"
                        onClick={() => setLightboxIndex(i)}
                        aria-label={`Open photo ${i + 1} of ${gallery.length}`}
                      >
                        <img src={src} alt={`Photo ${i + 1}`} loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>

    {/* Lightbox — rendered via portal to document.body so it escapes the
        modal-backdrop's backdrop-filter containing block. With backdrop-filter
        set on the backdrop, a position:fixed descendant would be positioned
        relative to the (scrolled) backdrop, not the viewport — meaning the
        lightbox would appear off-screen above whatever the user is reading.
        The portal must be a sibling of (not a child of) the modal's
        AnimatePresence, otherwise AnimatePresence treats it as a managed child
        and the lightbox never mounts. */}
    {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {lightboxIndex !== null && gallery && (
          <motion.div
            className="modal-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => { if (e.target === e.currentTarget) closeLightbox() }}
          >
            <button
              className="modal-lightbox-close"
              onClick={closeLightbox}
              aria-label="Close photo"
            >✕</button>
            {gallery.length > 1 && (
              <>
                <button
                  className="modal-lightbox-nav modal-lightbox-prev"
                  onClick={prevPhoto}
                  aria-label="Previous photo"
                >‹</button>
                <button
                  className="modal-lightbox-nav modal-lightbox-next"
                  onClick={nextPhoto}
                  aria-label="Next photo"
                >›</button>
              </>
            )}
            <motion.img
              key={lightboxIndex}
              className="modal-lightbox-img"
              src={gallery[lightboxIndex]}
              alt={`Photo ${lightboxIndex + 1} of ${gallery.length}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
            <div className="modal-lightbox-counter">
              {lightboxIndex + 1} / {gallery.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  )
}
