import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { competitionService } from '../services/competitionService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import BottomNav from '../components/BottomNav';
import CountdownTimer from '../components/CountdownTimer';

export default function CompetitionsListPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    competitionService
      .getAll({ limit: 20 })
      .then((data) => setCompetitions(data.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div
        style={{
          background: 'var(--teal)',
          padding: '16px 16px 20px',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 2 }}>Welcome back</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{user ? user.name : 'Feedants'}</div>
          </div>
          {user ? (
            <button
              onClick={logout}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Login
            </button>
          )}
        </div>
        <div style={{ fontSize: 13, opacity: 0.9 }}>Browse Competitions</div>
      </div>

      {/* List */}
      <div style={{ padding: '16px 16px 80px' }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 140, background: '#eee', borderRadius: 12 }} />
            ))}
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--red)', fontSize: 13, padding: '16px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {!loading && !error && competitions.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-hint)', padding: 40, fontSize: 14 }}>
            No competitions found.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {competitions.map((comp) => (
            <CompetitionCard key={comp._id} competition={comp} onClick={() => navigate(`/competitions/${comp.slug || comp._id}`)} />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function CompetitionCard({ competition: comp, onClick }) {
  const effectivePrice = comp.discountedFee ?? comp.entryFee;
  const isOpen = comp.status === 'registration_open';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`View ${comp.title}`}
      style={{
        background: '#fff',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
        border: '1px solid var(--border)',
      }}
    >
      {/* Banner */}
      {comp.bannerImage && (
        <img
          src={comp.bannerImage}
          alt={comp.title}
          style={{ width: '100%', height: 120, objectFit: 'cover' }}
        />
      )}

      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', flex: 1, marginRight: 8 }}>
            {comp.title}
          </div>
          <StatusBadge status={comp.status} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--teal-dark)' }}>
              {comp.isFree ? 'FREE' : `₹${effectivePrice?.toLocaleString('en-IN')}`}
            </span>
            {comp.discountedFee !== null && comp.discountedFee !== undefined && comp.discountedFee < comp.entryFee && (
              <span style={{ fontSize: 11, color: 'var(--text-hint)', textDecoration: 'line-through', marginLeft: 6 }}>
                ₹{comp.entryFee?.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {comp.registeredCount?.toLocaleString('en-IN')} registered
          </div>
        </div>

        {isOpen && comp.registrationEnd && (
          <div style={{ marginTop: 8 }}>
            <CountdownTimer targetDate={comp.registrationEnd} label="Closes in" />
          </div>
        )}
      </div>
    </div>
  );
}
