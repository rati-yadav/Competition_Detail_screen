import React, { useState } from 'react';

/**
 * TabSection
 * Props:
 *   tabs — array of { id, label, content: ReactNode }
 */
export default function TabSection({ tabs = [] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');

  if (!tabs.length) return null;

  const current = tabs.find((t) => t.id === active);

  return (
    <div>
      {/* Tab bar */}
      <div
        role="tablist"
        style={{
          display: 'flex',
          borderBottom: '2px solid var(--border)',
          gap: 0,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              style={{
                flex: '1 1 0',
                padding: '10px 8px',
                fontSize: 12.5,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--teal)' : 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--teal)' : '2px solid transparent',
                marginBottom: -2,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div role="tabpanel" style={{ paddingTop: 14 }}>
        {current?.content}
      </div>
    </div>
  );
}
