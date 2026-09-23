import React, { useState, useEffect } from 'react';

function pad(n) {
  return String(n).padStart(2, '0');
}

function getTimeLeft(targetDate) {
  const diff = new Date(targetDate) - new Date();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

/**
 * CountdownTimer
 * Props:
 *   targetDate  — ISO string or Date; counts down to this moment
 *   label       — optional prefix label (e.g. "Registration ends in")
 */
export default function CountdownTimer({ targetDate, label }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!timeLeft) {
    return <span style={{ color: 'var(--red)', fontWeight: 600, fontSize: 13 }}>Ended</span>;
  }

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {label && (
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginRight: 2 }}>
          {label}
        </span>
      )}
      {days > 0 && <Chip value={pad(days)} unit="d" />}
      <Chip value={pad(hours)} unit="h" />
      <Chip value={pad(minutes)} unit="m" />
      <Chip value={pad(seconds)} unit="s" />
    </div>
  );
}

function Chip({ value, unit }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 1,
        background: 'var(--teal)',
        color: '#fff',
        borderRadius: 6,
        padding: '2px 7px',
        fontSize: 13,
        fontWeight: 700,
        lineHeight: 1.6,
        minWidth: 36,
        justifyContent: 'center',
      }}
    >
      {value}
      <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.85 }}>{unit}</span>
    </span>
  );
}
