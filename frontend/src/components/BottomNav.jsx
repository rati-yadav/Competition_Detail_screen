import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--teal)' : '#BDBDBD'}>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);
const SearchIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--teal)' : '#BDBDBD'}>
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);
const TrophyIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--teal)' : '#BDBDBD'}>
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
  </svg>
);
const ProfileIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--teal)' : '#BDBDBD'}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);
const HelpIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--teal)' : '#BDBDBD'}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
  </svg>
);

const NAV_ITEMS = [
  { id: 'home',    label: 'Home',      path: '/competitions',  Icon: HomeIcon },
  { id: 'search',  label: 'Explore',   path: '/search',        Icon: SearchIcon },
  { id: 'events',  label: 'My Events', path: '/my-events',     Icon: TrophyIcon },
  { id: 'profile', label: 'Profile',   path: '/profile',       Icon: ProfileIcon },
  { id: 'help',    label: 'Help',      path: '/help',          Icon: HelpIcon },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNav = (item) => {
    // Profile pe click — agar logged in hai to /profile, nahi to /login
    if (item.id === 'profile' && !user) {
      navigate('/login');
      return;
    }
    navigate(item.path);
  };

  return (
    <nav
      aria-label="Bottom navigation"
      style={{
        position: 'sticky',
        bottom: 0,
        background: '#fff',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        zIndex: 100,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.07)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.path ||
          (item.id === 'home' && location.pathname === '/');
        return (
          <button
            key={item.id}
            onClick={() => handleNav(item)}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '8px 4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <item.Icon active={active} />
            <span style={{ fontSize: 10, color: active ? 'var(--teal)' : '#BDBDBD', fontWeight: active ? 700 : 400 }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
