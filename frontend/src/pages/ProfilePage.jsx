import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registrationService } from '../services/competitionService';
import BottomNav from '../components/BottomNav';
import StatusBadge from '../components/StatusBadge';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    registrationService.getMyRegistrations()
      .then((d) => setRegistrations(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/competitions');
  };

  if (!user) return null;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ background: 'var(--teal)', padding: '24px 16px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Avatar circle */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 800, color: '#fff',
            border: '3px solid rgba(255,255,255,0.5)',
            flexShrink: 0,
          }}>
            {user.avatar
              ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{user.name}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{user.email}</div>
            <div style={{
              display: 'inline-block', marginTop: 6, padding: '2px 10px',
              background: 'rgba(255,255,255,0.2)', borderRadius: 20,
              fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'capitalize',
            }}>
              {user.role}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>

        {/* Stats cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <StatCard label="Registered" value={registrations.length} />
          <StatCard label="Active" value={registrations.filter(r => r.status === 'active').length} />
          <StatCard label="Submitted" value={registrations.filter(r => r.submittedAt).length} />
        </div>

        {/* My Registrations */}
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>My Registrations</div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2].map(i => <div key={i} style={{ height: 80, background: '#eee', borderRadius: 12 }} />)}
          </div>
        )}

        {!loading && registrations.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '32px 16px',
            background: '#fff', borderRadius: 12, border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>No registrations yet</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Join a competition to get started!</div>
            <button
              onClick={() => navigate('/competitions')}
              style={{ marginTop: 14, padding: '10px 24px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              Browse Competitions
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {registrations.map((reg) => (
            <div
              key={reg._id}
              onClick={() => navigate(`/competitions/${reg.competition?.slug || reg.competition?._id}`)}
              style={{
                background: '#fff', borderRadius: 12, padding: '14px',
                border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', flex: 1, marginRight: 8 }}>
                  {reg.competition?.title || 'Competition'}
                </div>
                <StatusBadge status={reg.competition?.status || 'upcoming'} />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <InfoChip label="Ticket" value={reg.ticketNumber} />
                <InfoChip label="Paid" value={`₹${reg.amountPaid?.toLocaleString('en-IN')}`} />
                <InfoChip label="Payment" value={reg.paymentStatus} />
              </div>
              {reg.submittedAt && (
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>
                  ✅ Entry submitted
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', marginTop: 24, padding: '14px',
            background: '#fff', color: 'var(--red)',
            border: '1.5px solid var(--red)', borderRadius: 12,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{
      flex: 1, background: '#fff', borderRadius: 12, padding: '14px 10px',
      textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--text-hint)' }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{value}</div>
    </div>
  );
}
