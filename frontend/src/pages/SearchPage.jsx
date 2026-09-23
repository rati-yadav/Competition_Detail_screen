import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { competitionService } from '../services/competitionService';
import StatusBadge from '../components/StatusBadge';
import BottomNav from '../components/BottomNav';

const CATEGORIES = ['All', 'Dance', 'Music', 'Photography', 'Art', 'Sports', 'Writing'];
const STATUSES   = ['All', 'registration_open', 'upcoming', 'ongoing', 'completed'];

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery]           = useState('');
  const [category, setCategory]     = useState('All');
  const [status, setStatus]         = useState('All');
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searched, setSearched]     = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = { limit: 20 };
      if (category !== 'All') params.category = category;
      if (status !== 'All')   params.status    = status;
      const data = await competitionService.getAll(params);
      let list = data.data || [];
      // Client-side filter by title query
      if (query.trim()) {
        const q = query.toLowerCase();
        list = list.filter(c => c.title.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q));
      }
      setResults(list);
    } catch (_) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, category, status]);

  // Auto-search when filters change
  useEffect(() => { search(); }, [category, status]);

  return (
    <div className="page-wrapper">
      {/* Search bar */}
      <div style={{ padding: '14px 16px', background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Search competitions..."
            style={{
              flex: 1, padding: '10px 14px',
              border: '1.5px solid var(--border)', borderRadius: 10,
              fontSize: 14, outline: 'none', fontFamily: 'var(--font)',
            }}
          />
          <button
            onClick={search}
            style={{ padding: '10px 16px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ padding: '10px 16px', overflowX: 'auto', display: 'flex', gap: 8, scrollbarWidth: 'none', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              whiteSpace: 'nowrap', cursor: 'pointer', border: '1.5px solid',
              borderColor: category === c ? 'var(--teal)' : 'var(--border)',
              background: category === c ? 'var(--teal)' : '#fff',
              color: category === c ? '#fff' : 'var(--text-secondary)',
            }}
          >{c}</button>
        ))}
      </div>

      {/* Status filter */}
      <div style={{ padding: '8px 16px', overflowX: 'auto', display: 'flex', gap: 8, scrollbarWidth: 'none', background: '#fafafa', borderBottom: '1px solid var(--border)' }}>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              whiteSpace: 'nowrap', cursor: 'pointer', border: '1.5px solid',
              borderColor: status === s ? 'var(--teal)' : 'var(--border)',
              background: status === s ? 'var(--teal-light)' : '#fff',
              color: status === s ? 'var(--teal-dark)' : 'var(--text-secondary)',
            }}
          >{s === 'All' ? 'All Status' : s.replace('_', ' ')}</button>
        ))}
      </div>

      {/* Results */}
      <div style={{ padding: '14px 16px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading && [1,2,3].map(i => (
          <div key={i} style={{ height: 80, background: '#eee', borderRadius: 12 }} />
        ))}

        {!loading && searched && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-hint)' }}>
            <div style={{ fontSize: 40 }}>🔍</div>
            <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>No competitions found</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Try different keywords or filters</div>
          </div>
        )}

        {!loading && !searched && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-hint)' }}>
            <div style={{ fontSize: 40 }}>🎯</div>
            <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>Search competitions</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Type a name or select a category</div>
          </div>
        )}

        {!loading && results.map(comp => {
          const price = comp.discountedFee ?? comp.entryFee;
          return (
            <div
              key={comp._id}
              onClick={() => navigate(`/competitions/${comp.slug || comp._id}`)}
              style={{
                background: '#fff', borderRadius: 12, padding: '14px',
                border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
                display: 'flex', gap: 12, alignItems: 'center',
              }}
            >
              {comp.thumbnailImage && (
                <img src={comp.thumbnailImage} alt={comp.title}
                  style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{comp.title}</div>
                  <StatusBadge status={comp.status} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{comp.category}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--teal-dark)', marginTop: 4 }}>
                  {comp.isFree ? 'FREE' : `₹${price?.toLocaleString('en-IN')}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
