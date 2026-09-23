import React from 'react';

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--gold)" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const PlayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--teal)" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

/**
 * InstructorCard
 * Props: instructor object from competition data
 */
export default function InstructorCard({ instructor }) {
  if (!instructor) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 16px',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <img
          src={instructor.avatar || `https://i.pravatar.cc/80?u=${instructor.name}`}
          alt={instructor.name}
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid var(--teal-light)',
          }}
        />
        {/* Play button overlay */}
        <button
          aria-label="Watch instructor video"
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            background: '#fff',
            border: '1.5px solid var(--border)',
            borderRadius: '50%',
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          <PlayIcon />
        </button>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>
          {instructor.name}
        </div>
        {instructor.bio && (
          <div
            style={{
              fontSize: 11.5,
              color: 'var(--text-secondary)',
              marginBottom: 6,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {instructor.bio}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {instructor.rating > 0 && (
            <StatBadge icon={<StarIcon />} value={instructor.rating.toFixed(1)} label="Rating" />
          )}
          {instructor.totalStudents > 0 && (
            <StatBadge value={`${instructor.totalStudents.toLocaleString()}+`} label="Students" />
          )}
          {instructor.experience && (
            <StatBadge value={instructor.experience} label="Experience" />
          )}
        </div>
      </div>
    </div>
  );
}

function StatBadge({ icon, value, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {icon}
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
}
