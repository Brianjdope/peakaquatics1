import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Full-screen photo viewer for the Gallery page, styled like the article photo
// lightbox in NewsModal. Rendered through a portal so it is positioned against
// the viewport. Arrow keys / swipe move between photos; Esc or a backdrop click
// closes it.
//   photos:   [{ src, alt, caption, date }]
//   index:    index of the photo being shown, or null when closed
//   setIndex: the state setter for index (null closes the viewer)
export default function PhotoLightbox({ photos, index, setIndex }) {
  const open = index !== null && index >= 0 && index < photos.length
  const closeRef = useRef(null)
  const touchStartX = useRef(null)

  const onClose = () => setIndex(null)
  // Functional update, so key presses that land before a re-render still count
  const step = (dir) => setIndex((i) => (i === null ? i : (i + dir + photos.length) % photos.length))

  // While open: lock page scroll, focus the close button, and give focus back
  // to whatever opened the viewer when it closes.
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      opener?.focus?.()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  if (typeof document === 'undefined') return null
  const photo = open ? photos[index] : null

  return createPortal(
    <AnimatePresence>
      {photo && (
        <motion.div
          className="modal-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return
            const dx = e.changedTouches[0].clientX - touchStartX.current
            touchStartX.current = null
            if (Math.abs(dx) > 50 && photos.length > 1) step(dx < 0 ? 1 : -1)
          }}
        >
          <button ref={closeRef} className="modal-lightbox-close" onClick={onClose} aria-label="Close photo">✕</button>
          {photos.length > 1 && (
            <>
              <button className="modal-lightbox-nav modal-lightbox-prev" onClick={() => step(-1)} aria-label="Previous photo">‹</button>
              <button className="modal-lightbox-nav modal-lightbox-next" onClick={() => step(1)} aria-label="Next photo">›</button>
            </>
          )}
          <figure className="gallery-lightbox-figure">
            <motion.img
              key={photo.src}
              className="modal-lightbox-img"
              src={photo.src}
              alt={photo.alt}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
            {photo.caption && (
              <figcaption className="gallery-lightbox-caption">
                {photo.caption}
                {photo.date && <span>{photo.date}</span>}
              </figcaption>
            )}
          </figure>
          <div className="modal-lightbox-counter">{index + 1} / {photos.length}</div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
