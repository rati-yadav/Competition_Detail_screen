import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(-1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', padding: '24px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--teal)' }}>Feedants</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Sign in to register for competitions</div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle} htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>

        {error && (
          <div role="alert" style={{ color: 'var(--red)', fontSize: 13, padding: '8px 12px', background: '#FFEBEE', borderRadius: 8 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '14px',
            background: 'var(--teal)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 4,
          }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--teal)', fontWeight: 600 }}>
          Register
        </Link>
      </div>

      {/* Quick-fill demo credentials */}
      <div style={{ marginTop: 24, padding: '12px 14px', background: 'var(--teal-light)', borderRadius: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal-dark)', marginBottom: 6 }}>Demo credentials</div>
        {[
          { label: 'User', email: 'priya@example.com', pwd: 'User@1234' },
          { label: 'Admin', email: 'admin@feedants.com', pwd: 'Admin@123' },
        ].map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => { setEmail(c.email); setPassword(c.pwd); }}
            style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', fontSize: 12, color: 'var(--teal)', padding: '3px 0', cursor: 'pointer', fontWeight: 600 }}
          >
            {c.label}: {c.email}
          </button>
        ))}
      </div>
    </div>
  );
}

const labelStyle = { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 6 };
const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid var(--border)',
  borderRadius: 10,
  fontSize: 14,
  outline: 'none',
  fontFamily: 'var(--font)',
  color: 'var(--text-primary)',
  background: '#fff',
};
