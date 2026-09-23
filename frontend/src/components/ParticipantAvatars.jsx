import React from 'react';

/**
 * ParticipantAvatars
 * Shows stacked avatar circles + participant count.
 * Props:
 *   registeredCount — number
 *   totalSlots      — number
 *   avatarUrls      — optional array of image URLs (up to 4 shown)
 */
export default function ParticipantAvatars({ registeredCount = 0, totalSlots = 0, avatarUrls = [] }) {
  const displayAvatars = avatarUrls.slice(0, 4);
  const remaining = Math.max(0, registeredCount - displayAvatars.length);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* Stacked avatars */}
      <div style={{ display: 'flex' }}>
        {displayAvatars.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`Participant ${i + 1}`}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #fff',
              marginLeft: i === 0 ? 0 : -8,
              zIndex: displayAvatars.length - i,
              position: 'relative',
            }}
          />
        ))}
        {/* Fallback avatar if none provided */}
        {displayAvatars.length === 0 &&
          [1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: `hsl(${i * 80}, 50%, 65%)`,
                border: '2px solid #fff',
                marginLeft: i === 0 ? 0 : -8,
                position: 'relative',
                zIndex: 3 - i,
              }}
            />
          ))}
      </div>

      {/* Count */}
      <div>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
          {registeredCount.toLocaleString('en-IN')}
        </span>
        {totalSlots > 0 && (
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            /{totalSlots.toLocaleString('en-IN')} joined
          </span>
        )}
      </div>
    </div>
  );
}
