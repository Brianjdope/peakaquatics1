import React, { useState } from 'react'

// Real logo images from the original peakaquaticsports.com site
const SCHOOL_LOGOS = {
  'Princeton University':       '/logos/princeton.png',
  'Harvard University':         '/logos/harvard.png',
  'University of Texas':        '/legacy/long-horns.webp',
  'Brown University':           '/legacy/1200px-brown-bears-logo-svg.webp',
  'West Point':                 '/legacy/army-west-point-new-logo.webp',
  'Wesleyan University':        '/legacy/wesleyan.webp',
  'Tufts University':           '/legacy/tufts.webp',
  'Cornell University':         '/legacy/cornell.webp',
  'Northwestern University':    '/legacy/kayla-northwestern-logo.webp',
  'Purdue University':          '/legacy/purdue-university-logo-vector.webp',
  'Colgate University':         '/legacy/colgate-michael-granin.webp',
  'Columbia University':                '/logos/columbia.jpg',
  'University of California San Diego': '/logos/ucsd.jpg',
  'Holy Cross University':              '/logos/holy-cross.png',
  'Lehigh University':                  '/logos/lehigh.png',
  'TCNJ':                               '/logos/tcnj.webp',
  'University of Maine':                '/logos/maine.png',
  'University of Rochester':            '/logos/rochester.png',
  'Lafayette College':                  '/logos/lafayette.png',
  'New York University':                '/logos/nyu.png',
  'Bryant University':                  '/logos/bryant.jpg',
  'Boston University':                  '/logos/boston-university.png',
  'Williams College':                   '/logos/williams.png',
  'Bowdoin College':                    '/logos/bowdoin.jpg',
  'Carnegie Mellon University':         '/logos/carnegie-mellon.jpg',
  'Providence College':                 '/logos/providence.webp',
  'Middlebury College':                 '/logos/middlebury.svg',
}

// Fallback color badges for schools not in the image map
const SCHOOL_FALLBACK = {
  'Carnegie Mellon University':  { abbr: 'CMU',   bg: '#C41230', color: '#fff' },
  'University of Rochester':     { abbr: 'UR',    bg: '#003087', color: '#FAC800' },
  'Lehigh University':           { abbr: 'LU',    bg: '#653700', color: '#fff' },
  'Holy Cross University':       { abbr: 'HC',    bg: '#602D8C', color: '#fff' },
  'Lafayette College':           { abbr: 'LAF',   bg: '#8B2346', color: '#fff' },
  'Middlebury College':          { abbr: 'MIDD',  bg: '#0a2240', color: '#fff' },
  'University of Maine':         { abbr: 'UME',   bg: '#003DA5', color: '#fff' },
  'TCNJ':                        { abbr: 'TCNJ',  bg: '#1E3A6E', color: '#C9A94A' },
  'Columbia University':              { abbr: 'COL',  bg: '#003DA5', color: '#fff' },
  'University of California San Diego': { abbr: 'UCSD', bg: '#182B49', color: '#FFCD00' },
}

// Schools whose logos should be rendered in white (via CSS filter) for dark backgrounds
const WHITE_FILTER_SCHOOLS = new Set(['Middlebury College'])

export function getSchoolData(school) {
  return SCHOOL_FALLBACK[school] || { abbr: school.split(' ').map(w => w[0]).join('').slice(0, 3), bg: '#2a3550', color: '#4b8fd4' }
}

export default function SchoolLogo({ school, size = 60 }) {
  const imgSrc = SCHOOL_LOGOS[school]
  const [imgFailed, setImgFailed] = useState(false)

  if (imgSrc && !imgFailed) {
    const whiteFilter = WHITE_FILTER_SCHOOLS.has(school)
        ? { filter: 'brightness(0) invert(1)' }
        : null
    return (
      <img
        src={imgSrc}
        alt={school}
        title={school}
        className="school-logo-img"
        style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, ...whiteFilter }}
        // Fall back to the badge below if the image fails to load
        onError={() => setImgFailed(true)}
      />
    )
  }

  const { abbr, bg, color } = getSchoolData(school)
  const fontSize = size <= 36 ? size * 0.3 : size <= 60 ? size * 0.26 : size * 0.22

  return (
    <div
      className="school-logo-badge"
      style={{
        width: size,
        height: size,
        background: bg,
        color: color,
        fontSize: fontSize,
        flexShrink: 0,
      }}
      title={school}
    >
      {abbr}
    </div>
  )
}
