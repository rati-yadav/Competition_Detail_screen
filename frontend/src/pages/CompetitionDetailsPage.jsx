import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { competitionService, registrationService, leaderboardService } from '../services/competitionService';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from '../components/CountdownTimer';
import InstructorCard from '../components/InstructorCard';
import PrizeList from '../components/PrizeList';
import LeaderboardTable from '../components/LeaderboardTable';
import TabSection from '../components/TabSection';
import ParticipantAvatars from '../components/ParticipantAvatars';
import StatusBadge from '../components/StatusBadge';
import BottomNav from '../components/BottomNav';

// ─── Icons ────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
);
const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--teal)" aria-hidden="true">
    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
  </svg>
);
const UsersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--teal)" aria-hidden="true">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);
const CertificateIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--teal)" aria-hidden="true">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
  </svg>
);
const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--teal)" aria-hidden="true">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
  </svg>
);

// ─── Helper ───────────────────────────────────────────────────────
function fmt(date) {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy');
}

function InfoRow({ icon, label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 110 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginLeft: 'auto', textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function CompetitionDetailsPage() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [competition, setCompetition]       = useState(null);
  const [userRegistration, setUserRegistration] = useState(null);
  const [leaderboard, setLeaderboard]       = useState([]);
  const [lbLoading, setLbLoading]           = useState(false);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [registering, setRegistering]       = useState(false);
  const [regError, setRegError]             = useState(null);
  const [regSuccess, setRegSuccess]         = useState(null);
  const [aboutExpanded, setAboutExpanded]   = useState(false);
  const [cancelling, setCancelling]         = useState(false);

  // Fetch competition details
  const fetchCompetition = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await competitionService.getOne(idOrSlug);
      setCompetition(data.data);
      setUserRegistration(data.userRegistration);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [idOrSlug]);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async (compId) => {
    try {
      setLbLoading(true);
      const data = await leaderboardService.get(compId, { limit: 10 });
      setLeaderboard(data.data || []);
    } catch (_) {
      setLeaderboard([]);
    } finally {
      setLbLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompetition();
  }, [fetchCompetition]);

  useEffect(() => {
    if (competition?._id) fetchLeaderboard(competition._id);
  }, [competition?._id, fetchLeaderboard]);

  // Register handler
  const handleRegister = async () => {
    if (!user) return navigate('/login');
    setRegistering(true);
    setRegError(null);
    setRegSuccess(null);
    try {
      const data = await registrationService.register(competition._id);
      setRegSuccess(data);
      setUserRegistration({
        ticketNumber: data.data.ticketNumber,
        paymentStatus: data.data.paymentStatus,
        registeredAt: data.data.registeredAt,
      });
      // Optimistically increment count
      setCompetition((prev) => ({
        ...prev,
        registeredCount: (prev.registeredCount || 0) + 1,
      }));
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  // Cancel handler
  const handleCancel = async () => {
    if (!window.confirm('Cancel your registration? This cannot be undone.')) return;
    setCancelling(true);
    try {
      await registrationService.cancel(competition._id);
      setUserRegistration(null);
      setRegSuccess(null);
      setCompetition((prev) => ({
        ...prev,
        registeredCount: Math.max(0, (prev.registeredCount || 1) - 1),
      }));
    } catch (err) {
      setRegError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  // Share handler
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: competition?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-wrapper" style={{ padding: 16 }}>
        <SkeletonPage />
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (error || !competition) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, padding: 24 }}>
        <div style={{ fontSize: 48 }}>😕</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Competition not found</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>{error}</div>
        <button onClick={() => navigate('/competitions')} style={{ ...btnStyle('var(--teal)'), padding: '10px 24px' }}>
          Browse Competitions
        </button>
      </div>
    );
  }

  const isRegistered       = !!userRegistration;
  const isOpen             = competition.liveStatus === 'registration_open' || competition.status === 'registration_open';
  const isOngoing          = competition.liveStatus === 'ongoing' || competition.status === 'ongoing';
  const isCompleted        = competition.liveStatus === 'completed' || competition.status === 'completed';
  const remainingSlots     = competition.remainingSlots ?? (competition.totalSlots - competition.registeredCount);
  const effectivePrice     = competition.discountedFee ?? competition.entryFee;
  const hasDiscount        = competition.discountedFee !== null && competition.discountedFee !== undefined && competition.discountedFee < competition.entryFee;

  // ── Tab content ────────────────────────────────────────────────
  const aboutText = competition.about || 'No description available.';
  const TRUNCATE_LEN = 220;
  const needsTruncate = aboutText.length > TRUNCATE_LEN;

  const tabs = [
    {
      id: 'about',
      label: 'About Competition',
      content: (
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {aboutExpanded || !needsTruncate
              ? aboutText
              : aboutText.slice(0, TRUNCATE_LEN) + '…'}
          </p>
          {needsTruncate && (
            <button
              onClick={() => setAboutExpanded((v) => !v)}
              style={{ marginTop: 8, fontSize: 12, color: 'var(--teal)', fontWeight: 600, background: 'none', border: 'none' }}
            >
              {aboutExpanded ? 'Show less ▲' : 'Read more ▼'}
            </button>
          )}
        </div>
      ),
    },
    {
      id: 'rules',
      label: 'Judging Procedure',
      content: (
        <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(competition.rules || []).map((rule, i) => (
            <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {rule}
            </li>
          ))}
          {!competition.rules?.length && (
            <li style={{ fontSize: 13, color: 'var(--text-hint)' }}>Rules will be announced soon.</li>
          )}
        </ul>
      ),
    },
    {
      id: 'prizes',
      label: 'Prizes & Certificates',
      content: (
        <div>
          <PrizeList prizes={competition.prizes} />
          {competition.hasCertificate && (
            <div
              style={{
                marginTop: 12,
                padding: '10px 14px',
                background: 'var(--teal-light)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CertificateIcon />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--teal-dark)' }}>
                All participants receive a digital certificate
              </span>
            </div>
          )}
        </div>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="page-wrapper">
      {/* ── Header ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#fff',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '10px 16px',
          gap: 12,
        }}
      >
        <button
          aria-label="Go back"
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', display: 'flex', color: 'var(--text-primary)', padding: 4 }}
        >
          <BackIcon />
        </button>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Pro Details
        </span>
        <button
          aria-label="Share competition"
          onClick={handleShare}
          style={{ background: 'none', border: 'none', display: 'flex', color: 'var(--text-secondary)', padding: 4 }}
        >
          <ShareIcon />
        </button>
      </div>

      <div style={{ padding: '0 16px 100px' }}>

        {/* ── Title & Status ── */}
        <div style={{ paddingTop: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, flex: 1 }}>
              {competition.title}
            </h1>
            <StatusBadge status={competition.liveStatus || competition.status} />
          </div>

          {/* Tags */}
          {competition.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {competition.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '2px 10px',
                    background: 'var(--teal-light)',
                    color: 'var(--teal-dark)',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </span>
              ))}
              {competition.hasCertificate && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: '2px 10px',
                    background: '#E8F5E9',
                    color: '#2E7D32',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  <CertificateIcon />
                  Lifetime gov certificate
                </span>
              )}
            </div>
          )}

          {/* Price row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Entry Fee</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal-dark)' }}>
                  {competition.isFree ? 'FREE' : `₹ ${effectivePrice.toLocaleString('en-IN')}`}
                </span>
                {hasDiscount && (
                  <span style={{ fontSize: 13, color: 'var(--text-hint)', textDecoration: 'line-through' }}>
                    ₹ {competition.entryFee.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {hasDiscount && (
              <div
                style={{
                  padding: '4px 10px',
                  background: '#E8F5E9',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#2E7D32',
                }}
              >
                {Math.round(((competition.entryFee - effectivePrice) / competition.entryFee) * 100)}% OFF
              </div>
            )}

            {/* Participants */}
            <div style={{ marginLeft: 'auto' }}>
              <ParticipantAvatars
                registeredCount={competition.registeredCount}
                totalSlots={competition.totalSlots}
              />
            </div>
          </div>

          {/* Countdown — show relevant one based on status */}
          {isOpen && (
            <div style={{ marginBottom: 10, padding: '10px 14px', background: 'var(--teal-light)', borderRadius: 10 }}>
              <CountdownTimer
                targetDate={competition.registrationEnd}
                label="Registration closes in"
              />
            </div>
          )}
          {isOngoing && (
            <div style={{ marginBottom: 10, padding: '10px 14px', background: '#FFF3E0', borderRadius: 10 }}>
              <CountdownTimer
                targetDate={competition.competitionEnd}
                label="Competition ends in"
              />
            </div>
          )}
        </div>

        {/* ── Instructor ── */}
        <Section title="Instructor">
          <InstructorCard instructor={competition.instructor} />
        </Section>

        {/* ── Competition Meta ── */}
        <Section title="My Competition">
          <div>
            <InfoRow
              icon={<CalendarIcon />}
              label="Registration Start"
              value={fmt(competition.registrationStart)}
            />
            <InfoRow
              icon={<CalendarIcon />}
              label="Registration End"
              value={fmt(competition.registrationEnd)}
            />
            <InfoRow
              icon={<ClockIcon />}
              label="Competition Start"
              value={fmt(competition.competitionStart)}
            />
            <InfoRow
              icon={<ClockIcon />}
              label="Competition End"
              value={fmt(competition.competitionEnd)}
            />
            <InfoRow
              icon={<UsersIcon />}
              label="Total Slots"
              value={competition.totalSlots?.toLocaleString('en-IN')}
            />
            <InfoRow
              icon={<UsersIcon />}
              label="Remaining Slots"
              value={
                remainingSlots <= 0
                  ? <span style={{ color: 'var(--red)', fontWeight: 700 }}>Full</span>
                  : <span style={{ color: remainingSlots < 20 ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>
                      {remainingSlots.toLocaleString('en-IN')}
                    </span>
              }
            />
            {competition.submissionType && (
              <InfoRow
                icon={<ClockIcon />}
                label="Submission Type"
                value={competition.submissionType.charAt(0).toUpperCase() + competition.submissionType.slice(1)}
              />
            )}
          </div>
        </Section>

        {/* ── Previous Winners / Leaderboard ── */}
        <Section title="Previous Winners">
          <LeaderboardTable
            entries={leaderboard}
            loading={lbLoading}
            myUserId={user?._id}
          />
        </Section>

        {/* ── About / Rules / Prizes tabs ── */}
        <Section>
          <TabSection tabs={tabs} />
        </Section>

        {/* ── Prizes summary (quick view) ── */}
        {competition.prizes?.length > 0 && (
          <Section title={`Rewards · ${competition.prizes.length} Prizes`}>
            <PrizeList prizes={competition.prizes} />
          </Section>
        )}

        {/* ── Submission instructions ── */}
        {competition.submissionInstructions && (
          <Section title="Contest Submission">
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {competition.submissionInstructions}
            </p>
          </Section>
        )}

        {/* ── Refer section ── */}
        <Section>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--teal-light)',
              borderRadius: 'var(--radius-md)',
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal-dark)' }}>
                Refer a friend, earn Reward?
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                You can earn 20% on every sale through referrals
              </div>
            </div>
            <button
              onClick={handleShare}
              style={{ ...btnStyle('var(--teal)'), padding: '8px 16px', fontSize: 12, flexShrink: 0 }}
            >
              Refer Now
            </button>
          </div>
        </Section>

        {/* ── Registration success/error feedback ── */}
        {regError && (
          <div
            role="alert"
            style={{
              padding: '10px 14px',
              background: '#FFEBEE',
              borderRadius: 10,
              color: 'var(--red)',
              fontSize: 13,
              marginBottom: 12,
              borderLeft: '4px solid var(--red)',
            }}
          >
            {regError}
          </div>
        )}
        {regSuccess && (
          <div
            role="status"
            style={{
              padding: '10px 14px',
              background: '#E8F5E9',
              borderRadius: 10,
              color: '#2E7D32',
              fontSize: 13,
              marginBottom: 12,
              borderLeft: '4px solid #43A047',
            }}
          >
            🎉 Registered! Your ticket: <strong>{regSuccess.data?.ticketNumber}</strong>
          </div>
        )}

        {/* ── User's own registration info (if registered) ── */}
        {isRegistered && (
          <div
            style={{
              padding: '12px 14px',
              background: '#E8F5E9',
              borderRadius: 10,
              marginBottom: 12,
              borderLeft: '4px solid var(--green)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2E7D32', marginBottom: 4 }}>
              ✅ You are registered
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Ticket: <strong>{userRegistration.ticketNumber}</strong>
              {' · '}
              Payment: <strong>{userRegistration.paymentStatus}</strong>
            </div>
          </div>
        )}

      </div>

      {/* ── Sticky CTA button ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 56,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 480,
          padding: '10px 16px',
          background: 'linear-gradient(to top, #fff 80%, transparent)',
          zIndex: 90,
        }}
      >
        {isRegistered ? (
          <div style={{ display: 'flex', gap: 10 }}>
            {isOngoing && (
              <button
                style={{ ...btnStyle('var(--teal)'), flex: 2 }}
                onClick={() => navigate(`/competitions/${idOrSlug}/submit`)}
              >
                Submit Entry
              </button>
            )}
            <button
              style={{ ...btnStyle('#fff', 'var(--red)', 'var(--red)'), flex: isOngoing ? 1 : 1 }}
              onClick={handleCancel}
              disabled={cancelling || isCompleted}
            >
              {cancelling ? 'Cancelling…' : 'Cancel Registration'}
            </button>
          </div>
        ) : (
          <button
            style={{
              ...btnStyle(
                isOpen && remainingSlots > 0 ? 'var(--teal)' : '#BDBDBD'
              ),
              width: '100%',
              opacity: registering ? 0.7 : 1,
            }}
            onClick={handleRegister}
            disabled={!isOpen || remainingSlots <= 0 || registering}
            aria-busy={registering}
          >
            {registering
              ? 'Registering…'
              : !isOpen
              ? competition.status === 'upcoming'
                ? 'Registration Not Open Yet'
                : 'Registration Closed'
              : remainingSlots <= 0
              ? 'Competition Full'
              : `Contest Submission · ₹${effectivePrice.toLocaleString('en-IN')}`}
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {title && (
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Button style helper ──────────────────────────────────────────
function btnStyle(bg, color = '#fff', borderColor = 'transparent') {
  return {
    padding: '14px 20px',
    background: bg,
    color,
    border: `1.5px solid ${borderColor}`,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  };
}

// ─── Skeleton loader ──────────────────────────────────────────────
function SkeletonPage() {
  return (
    <div style={{ paddingTop: 16 }}>
      {[200, 100, 160, 80, 240].map((w, i) => (
        <div
          key={i}
          style={{
            height: i === 0 ? 28 : i === 4 ? 120 : 16,
            width: `${w}px`,
            background: '#eee',
            borderRadius: 8,
            marginBottom: 16,
            maxWidth: '100%',
          }}
        />
      ))}
    </div>
  );
}
