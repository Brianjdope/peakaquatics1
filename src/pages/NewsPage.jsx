import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ARTICLES, NEWS_LIST } from '../data'
import NewsModal from '../components/NewsModal'

export default function NewsPage() {
  const [activeId, setActiveId] = useState(null)
  const carouselRef = useRef(null)

  const featured = NEWS_LIST.find(n => n.featured)
  const rest = NEWS_LIST.filter(n => !n.featured)

  const scroll = (dir) => {
    if (!carouselRef.current) return
    carouselRef.current.scrollBy({ left: dir * 340, behavior: 'smooth' })
  }

  return (
    <>
      <div className="page-wrapper">
        <div className="page-header">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <p className="section-label">Latest Updates</p>
              <h1 className="page-title">News &amp; Events</h1>
            </motion.div>
          </div>
        </div>

        <section className="page-section" style={{ background: 'var(--surface)' }}>
          <div className="container">
            {/* Featured */}
            {featured && (
              <motion.div
                className="news-featured"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                onClick={() => setActiveId(featured.id)}
              >
                <div className="news-featured-img">
                  <img
                    src={ARTICLES[featured.id].img}
                    alt={ARTICLES[featured.id].title}
                    style={{ objectPosition: ARTICLES[featured.id].imgPos || 'center 30%' }}
                  />
                </div>
                <div className="news-featured-body">
                  <span className="article-tag">{ARTICLES[featured.id].tag}</span>
                  <span className="article-date">{ARTICLES[featured.id].date}</span>
                  <h3>{ARTICLES[featured.id].title}</h3>
                  <p>{ARTICLES[featured.id].excerpt}</p>
                  <div style={{ marginTop: '1.5rem' }}>
                    <span className="btn">Read Article</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Carousel */}
            <motion.div
              style={{ marginTop: '2.5rem' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="news-carousel" ref={carouselRef}>
                {rest.map(({ id }) => {
                  const a = ARTICLES[id]
                  return (
                    <div className="news-card" key={id} onClick={() => setActiveId(id)}>
                      <img
                        className="news-card-img"
                        src={a.img}
                        alt={a.title}
                        style={{ objectPosition: a.imgPos || 'center 30%' }}
                      />
                      <div className="news-card-body">
                        <span className="article-tag">{a.tag}</span>
                        <div className="article-date" style={{ marginBottom: '0.5rem' }}>{a.date}</div>
                        <h4>{a.title}</h4>
                        <p>{a.excerpt}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="carousel-nav">
                <button className="carousel-btn" onClick={() => scroll(-1)} aria-label="Previous">←</button>
                <button className="carousel-btn" onClick={() => scroll(1)}  aria-label="Next">→</button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <NewsModal id={activeId} onClose={() => setActiveId(null)} />
    </>
  )
}
