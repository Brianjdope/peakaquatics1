import React from 'react'
import { motion } from 'framer-motion'

export default function TermsPage() {
  return (
    <div className="page-wrapper">
      <section style={{ background: 'var(--surface)', paddingTop: '6rem', paddingBottom: '5rem' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '0.92rem' }}
          >
            <p className="section-label">Legal</p>
            <h1 className="page-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Terms & Conditions</h1>
            <p style={{ color: 'var(--text)', fontSize: '0.85rem', marginBottom: '2rem' }}>
              Last updated: January 1, 2025
            </p>

            <h3 style={{ color: 'var(--text)', marginBottom: '0.75rem' }}>1. Services</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Peak Aquatic Sports provides competitive swimming coaching, stroke analysis, and collegiate recruitment consulting services. All training sessions, clinics, and consultations are subject to availability and scheduling.
            </p>

            <h3 style={{ color: 'var(--text)', marginBottom: '0.75rem' }}>2. Registration & Payment</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Registration for programs and sessions must be completed prior to participation. Payment is due at the time of registration unless otherwise arranged. All fees are non-refundable unless cancelled by Peak Aquatic Sports.
            </p>

            <h3 style={{ color: 'var(--text)', marginBottom: '0.75rem' }}>3. Assumption of Risk</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Swimming is a physical activity that involves inherent risks. Participants and their guardians acknowledge and accept these risks. Peak Aquatic Sports takes all reasonable precautions to ensure safety, but cannot guarantee against injury.
            </p>

            <h3 style={{ color: 'var(--text)', marginBottom: '0.75rem' }}>4. Medical Clearance</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Participants are responsible for ensuring they are medically cleared to participate in swimming activities. Peak Aquatic Sports reserves the right to request medical documentation at any time.
            </p>

            <h3 style={{ color: 'var(--text)', marginBottom: '0.75rem' }}>5. Code of Conduct</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              All athletes, parents, and guardians are expected to conduct themselves in a respectful and sportsmanlike manner. Peak Aquatic Sports reserves the right to dismiss any participant whose behavior is disruptive or inappropriate.
            </p>

            <h3 style={{ color: 'var(--text)', marginBottom: '0.75rem' }}>6. Photo & Video Release</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              By participating in Peak Aquatic Sports programs, you consent to the use of photographs and video taken during sessions for promotional and educational purposes, including use on our website and social media.
            </p>

            <h3 style={{ color: 'var(--text)', marginBottom: '0.75rem' }}>7. Cancellation Policy</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Sessions cancelled by the athlete with less than 24 hours notice may not be rescheduled or refunded. Peak Aquatic Sports reserves the right to cancel sessions due to weather, facility availability, or other unforeseen circumstances, in which case a makeup session or credit will be offered.
            </p>

            <h3 style={{ color: 'var(--text)', marginBottom: '0.75rem' }}>8. Liability Waiver</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              To the fullest extent permitted by law, Peak Aquatic Sports, its coaches, and affiliates shall not be held liable for any injury, loss, or damage arising from participation in our programs. Participants and guardians agree to indemnify and hold harmless Peak Aquatic Sports from any claims.
            </p>

            <h3 style={{ color: 'var(--text)', marginBottom: '0.75rem' }}>9. Privacy</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Personal information collected during registration is used solely for program administration and communication. We do not sell or share personal data with third parties. Video submissions for stroke analysis are kept confidential and used only for coaching purposes.
            </p>

            <h3 style={{ color: 'var(--text)', marginBottom: '0.75rem' }}>10. Changes to Terms</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Peak Aquatic Sports reserves the right to update these terms at any time. Continued participation in our programs constitutes acceptance of any changes.
            </p>

            <h3 style={{ color: 'var(--text)', marginBottom: '0.75rem' }}>11. Contact</h3>
            <p>
              For questions regarding these terms, please contact us at{' '}
              <a href="mailto:peakaquaticsports@gmail.com" style={{ color: 'var(--text)', textDecoration: 'underline' }}>
                peakaquaticsports@gmail.com
              </a>{' '}
              or call <a href="tel:+12013595688" style={{ color: 'var(--text)', textDecoration: 'underline' }}>201-359-5688</a>.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
