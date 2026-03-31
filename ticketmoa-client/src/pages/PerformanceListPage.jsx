import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PerformanceCard from '../components/PerformanceCard';

const categoryList = [
  { id: '', name: '전체' },
  { id: 'musical', name: '뮤지컬' },
  { id: 'concert', name: '콘서트' },
  { id: 'theater', name: '연극' },
  { id: 'classic', name: '클래식' },
];

function PerformanceListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (sort) params.set('sort', sort);

    fetch(`/api/performances?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setPerformances(data);
        setLoading(false);
      });
  }, [category, search, status, sort]);

  const updateFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);
    else p.delete(key);
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim());
  };

  return (
    <>
      {/* Search bar */}
      <div style={{ padding: '12px 16px', background: 'white', borderBottom: '1px solid var(--border)' }}>
        <form className="search-bar" onSubmit={handleSearch} style={{ boxShadow: 'none', border: '1.5px solid var(--border)', borderRadius: '10px' }}>
          <input
            type="text"
            placeholder="공연명, 아티스트 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit">&#128269;</button>
        </form>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        {categoryList.map((cat) => (
          <button
            key={cat.id}
            className={`filter-chip ${category === cat.id ? 'active' : ''}`}
            onClick={() => updateFilter('category', cat.id)}
          >
            {cat.name}
          </button>
        ))}
        <select
          className="sort-chip"
          value={sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
        >
          <option value="">정렬</option>
          <option value="date">날짜순</option>
          <option value="rating">평점순</option>
          <option value="popularity">인기순</option>
        </select>
      </div>

      {/* Results */}
      <div className="section">
        {search && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: 14 }}>
            &quot;{search}&quot; 검색 결과 {performances.length}건
          </p>
        )}

        {loading ? (
          <div className="loading">불러오는 중...</div>
        ) : performances.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">&#128270;</div>
            <p>검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="perf-list">
            {performances.map((p) => (
              <PerformanceCard key={p.id} performance={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default PerformanceListPage;
