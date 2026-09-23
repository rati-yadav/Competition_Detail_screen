import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registrationService } from '../services/competitionService';
import BottomNav from '../components/BottomNav';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';

export default function MyEventsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    registrationService.getMyRegistrations()
      .then(d => setRegistrations(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const filtered = registrations.filter(r =>
    activeTab === 'active' ? r.status === 'active' : r.status !== 'active'
  );

  if (!user) return null;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ padding: '16px 16px 0', background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>My Events</div>
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)' }}>
          {['active', 'past'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '10px', fontSize: 13, fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? 'var(--teal)' : 'var(--text-secondary)',
                background: 'none', border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--teal)' : '2px solid transparent',
                marginBottom: -2, cursor: 'pointer', textTransform: 'capitalize',
              }}
            >
              {tab} ({registrations.filter(r => tab === 'active' ? r.status === 'active' : r.status !== 'active').length})
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading && [1,2,3].map(i => (
          <div key={i} style={{ height: 120, background: '#eee', borderRadius: 12 }} />
        ))}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 40 }}>🏆</div>
            <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              No {activeTab} events
            </div>
            {activeTab === 'active' && (
              <button
                onClick={() => navigate('/competitions')}
                style={{ marginTop: 14, padding: '10px 24px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Browse Competitions
              </button>
            )}
          </div>
        )}

        {!loading && filtered.map(reg => {
          const comp = reg.competition;
          return (
            <div
              key={reg._id}
              onClick={() => navigate(`/competitions/${comp?.slug || comp?._id}`)}
              style={{
                background: '#fff', borderRadius: 14, overflow: 'hidden',
                border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
              }}
            >
              {comp?.bannerImage && (
                <img src={comp.bannerImage} alt={comp.title}
                  style={{ width: '100%', height: 90, objectFit: 'cover' }} />
              )}
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
                    {comp?.title || 'Competition'}
                  </div>
                  <StatusBadge status={comp?.status || 'upcoming'} />
                </div>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <MiniInfo label="Ticket" value={reg.ticketNumber} />
                  <MiniInfo label="Registered" value={format(new Date(reg.createdAt), 'dd MMM yyyy')} />
                  <MiniInfo label="Paid" value={`₹${reg.amountPaid?.toLocaleString('en-IN')}`} />
                </div>

                {/* Submission status */}
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                    background: reg.submittedAt ? '#E8F5E9' : '#FFF3E0',
                    color: reg.submittedAt ? '#2E7D32' : '#E65100',
                  }}>
                    {reg.submittedAt ? '✅ Submitted' : '⏳ Not submitted yet'}
                  </div>
                  {comp?.status === 'ongoing' && !reg.submittedAt && (
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/competitions/${comp?.slug || comp?._id}`); }}
                      style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: 'var(--teal)', border: 'none', borderRadius: 8, padding: '4px 12px', cursor: 'pointer' }}
                    >
                      Submit Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}

function MiniInfo({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--text-hint)' }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}
