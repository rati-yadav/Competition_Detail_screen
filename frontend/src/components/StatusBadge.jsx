import React from 'react';

const CONFIG = {
  registration_open: { label: 'Registration Open', bg: '#E8F5E9', color: '#2E7D32' },
  upcoming:          { label: 'Upcoming',           bg: '#E3F2FD', color: '#1565C0' },
  ongoing:           { label: 'Live',               bg: '#FFF3E0', color: '#E65100' },
  completed:         { label: 'Completed',          bg: '#F3E5F5', color: '#6A1B9A' },
  cancelled:         { label: 'Cancelled',          bg: '#FFEBEE', color: '#B71C1C' },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || { label: status, bg: '#F5F5F5', color: '#757575' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: cfg.bg,
        color: cfg.color,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
      }}
    >
      {cfg.label}
    </span>
  );
}
