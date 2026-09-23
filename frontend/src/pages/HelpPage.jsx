import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';

const FAQS = [
  { q: 'How do I register for a competition?', a: 'Go to the competition details page and click the "Contest Submission" button. You need to be logged in to register.' },
  { q: 'Can I cancel my registration?', a: 'Yes, you can cancel before the competition starts. Go to the competition page — a "Cancel Registration" button will appear if you are registered.' },
  { q: 'How do I submit my entry?', a: 'Once the competition is live (ongoing status), a "Submit Entry" button appears on the competition page. Upload your entry URL before the deadline.' },
  { q: 'When are results announced?', a: 'Results are announced on the result date shown in the competition details. Winners are updated on the leaderboard.' },
  { q: 'Will I get a certificate?', a: 'Yes! Competitions marked with "Lifetime gov certificate" issue digital certificates to all participants after the competition ends.' },
  { q: 'How are winners selected?', a: 'Judges score submissions on a 0–100 scale. Average of all judge scores determines the final leaderboard ranking.' },
  { q: 'What is the refund policy?', a: 'Cancellations before competition start are eligible for a refund. Contact support with your ticket number for refund requests.' },
];

export default function HelpPage() {
  const [open, setOpen] = useState(null);

  return (
    <div className="page-wrapper">
      <div style={{ padding: '16px 16px 0', background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ fontSize: 18, fontWeight: 800, paddingBottom: 14 }}>Help & FAQ</div>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>

        {/* Contact card */}
        <div style={{
          background: 'var(--teal)', borderRadius: 14, padding: '18px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ fontSize: 32 }}>💬</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Need Help?</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 3 }}>
              Our support team is available Mon–Sat, 10am–6pm
            </div>
            <a
              href="mailto:support@feedants.com"
              style={{ display: 'inline-block', marginTop: 8, fontSize: 12, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '4px 14px', borderRadius: 20 }}
            >
              support@feedants.com
            </a>
          </div>
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Frequently Asked Questions</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', textAlign: 'left', padding: '14px', background: 'none', border: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{faq.q}</span>
                <span style={{ fontSize: 16, color: 'var(--teal)', fontWeight: 700, flexShrink: 0 }}>
                  {open === i ? '−' : '+'}
                </span>
              </button>
              {open === i && (
                <div style={{ padding: '0 14px 14px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border)' , paddingTop: 10 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
