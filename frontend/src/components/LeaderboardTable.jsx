import React from 'react';

const RANK_COLORS = ['#F9A825', '#9E9E9E', '#BF6E32'];

/**
 * LeaderboardTable
 * Props:
 *   entries  — array from leaderboard API (with computedRank, user, finalScore, displayName, avatarUrl)
 *   loading  — boolean
 *   myUserId — current user's _id string (to highlight their row)
 */
export default function LeaderboardTable({ entries = [], loading, myUserId }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[1, 2, 3].map((i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '24px 0',
          color: 'var(--text-hint)',
          fontSize: 13,
        }}
      >
        No participants yet. Be the first!
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} role="list" aria-label="Leaderboard">
      {entries.map((entry) => {
        const rank = entry.computedRank ?? entry.rank;
        const isMe = entry.user?._id === myUserId || entry.user === myUserId;
        const name = entry.user?.name || entry.displayName || 'Participant';
        const avatar =
          entry.user?.avatar ||
          entry.avatarUrl ||
          `https://i.pravatar.cc/40?u=${name}`;
        const rankColor = rank <= 3 ? RANK_COLORS[rank - 1] : 'var(--text-secondary)';

        return (
          <div
            key={entry._id}
            role="listitem"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              background: isMe ? 'var(--teal-light)' : 'var(--surface)',
              borderRadius: 10,
              border: isMe ? '1.5px solid var(--teal-mid)' : '1.5px solid var(--border)',
              transition: 'background 0.2s',
            }}
          >
            {/* Rank */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: rank <= 3 ? rankColor : 'var(--bg)',
                border: rank > 3 ? '1.5px solid var(--border)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: rank <= 3 ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {rank}
              </span>
            </div>

            {/* Avatar */}
            <img
              src={avatar}
              alt={name}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--border)',
                flexShrink: 0,
              }}
            />

            {/* Name */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: isMe ? 700 : 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {name} {isMe && <span style={{ color: 'var(--teal)', fontSize: 11 }}>(You)</span>}
              </div>
            </div>

            {/* Score */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: rankColor }}>
                {entry.finalScore ?? 0}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-hint)' }}>pts</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        background: 'var(--surface)',
        borderRadius: 10,
        border: '1.5px solid var(--border)',
      }}
    >
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eee' }} />
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#eee' }} />
      <div style={{ flex: 1, height: 14, borderRadius: 6, background: '#eee' }} />
      <div style={{ width: 36, height: 18, borderRadius: 6, background: '#eee' }} />
    </div>
  );
}
