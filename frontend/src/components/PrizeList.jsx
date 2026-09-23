import React from 'react';

const MEDAL_COLORS = {
  gold: '#F9A825',
  silver: '#9E9E9E',
  bronze: '#BF6E32',
  special: '#00897B',
};

const MEDAL_BG = {
  gold: '#FFF8E1',
  silver: '#F5F5F5',
  bronze: '#FBE9E7',
  special: '#E0F2F1',
};

/**
 * PrizeList
 * Props:
 *   prizes — array of { rank, label, medalColor, amount }
 */
export default function PrizeList({ prizes = [] }) {
  if (!prizes.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {prizes.map((prize) => {
        const color = MEDAL_COLORS[prize.medalColor] || MEDAL_COLORS.special;
        const bg = MEDAL_BG[prize.medalColor] || MEDAL_BG.special;

        return (
          <div
            key={prize.rank}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: bg,
              borderRadius: 10,
              borderLeft: `4px solid ${color}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MedalIcon color={color} rank={prize.rank} />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                {prize.label}
              </span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color }}>
              ₹ {prize.amount.toLocaleString('en-IN')}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MedalIcon({ color, rank }) {
  return (
    <div
      aria-label={`Rank ${rank}`}
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{rank}</span>
    </div>
  );
}
