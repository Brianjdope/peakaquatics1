import React from 'react'

// Real logo images from the original peakaquaticsports.com site
const SCHOOL_LOGOS = {
  'Princeton University':       'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/1710177732669-5EE3FX2WO1F1IMY17YUE/Chloe+Princeton.png',
  'Harvard University':         'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/1687948198978-GXOUUKKXL0ML5DQ6EU61/harvard-university-logo.png',
  'University of Texas':        'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/1695319439504-Z0N3WB4CCSKZJS2UVVBL/Long+horns.png',
  'Brown University':           'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/1687948198992-FGXQBHW8NVS9D7DLK8D4/1200px-Brown_Bears_logo.svg.png',
  'West Point':                 'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/1690334253065-ZFL95C5IXRU1RJFH8VPG/Army-West-Point-New-Logo.jpeg',
  'Wesleyan University':        'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/1688644957925-FW42G0I3QH4OY9WHRASD/Wesleyan.png',
  'Tufts University':           'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/1688644957844-RN9CU4H4MJFJ3QFMVUNV/Tufts.png',
  'Cornell University':         'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/1690333385500-H4CMZYC00H7FJEMCUDM4/Cornell.png',
  'Northwestern University':    'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/1714063364628-0THWKQ09ZYGDVVILPHAO/Kayla+Northwestern+Logo.png',
  'Purdue University':          'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/1687948199984-7CJEID9AA4QURTDHIXNV/purdue-university-logo-vector.png',
  'Colgate University':         'https://images.squarespace-cdn.com/content/v1/613a5c22540e534e72bda9a1/1722180581424-32CGBJR07XT022TWSFIF/Colgate+Michael+Granin.png',
}

// Fallback color badges for schools not in the image map
const SCHOOL_FALLBACK = {
  'Carnegie Mellon University':  { abbr: 'CMU',   bg: '#C41230', color: '#fff' },
  'University of Rochester':     { abbr: 'UR',    bg: '#003087', color: '#FAC800' },
  'Lehigh University':           { abbr: 'LU',    bg: '#653700', color: '#fff' },
  'Holy Cross University':       { abbr: 'HC',    bg: '#602D8C', color: '#fff' },
  'Lafayette College':           { abbr: 'LAF',   bg: '#8B2346', color: '#fff' },
  'University of Maine':         { abbr: 'UME',   bg: '#003DA5', color: '#fff' },
  'TCNJ':                        { abbr: 'TCNJ',  bg: '#1E3A6E', color: '#C9A94A' },
}

export function getSchoolData(school) {
  return SCHOOL_FALLBACK[school] || { abbr: school.split(' ').map(w => w[0]).join('').slice(0, 3), bg: '#2a3550', color: '#4b8fd4' }
}

export default function SchoolLogo({ school, size = 60 }) {
  const imgSrc = SCHOOL_LOGOS[school]

  if (imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={school}
        title={school}
        className="school-logo-img"
        style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
        onError={(e) => {
          // Fall back to badge if image fails
          e.target.style.display = 'none'
          e.target.nextSibling && (e.target.nextSibling.style.display = 'flex')
        }}
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
