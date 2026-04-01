import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import PerformanceCard from '../components/PerformanceCard';

const categoryList = [
  { id: 'musical', name: '뮤지컬' },
  { id: 'concert', name: '대중음악' },
  { id: 'theater', name: '연극' },
  { id: 'classic', name: '클래식' },
  { id: 'dance', name: '무용' },
  { id: 'etc', name: '서커스/복합' },
];

const PAGE_SIZE = 10;

function toggleMulti(current, value) {
  const arr = current ? current.split(',') : [];
  const idx = arr.indexOf(value);
  if (idx >= 0) {
    arr.splice(idx, 1);
  } else {
    arr.push(value);
  }
  return arr.join(',');
}

function isSelected(current, value) {
  if (!current) return false;
  return current.split(',').includes(value);
}

function PerformanceListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [ticketSources, setTicketSources] = useState([]);
  const observerRef = useRef(null);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || '';
  const ticketSource = searchParams.get('ticketSource') || '';

  const buildUrl = useCallback((pageNum) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (sort) params.set('sort', sort);
    if (ticketSource) params.set('ticketSource', ticketSource);
    params.set('page', pageNum);
    params.set('limit', PAGE_SIZE);
    return `/api/performances?${params}`;
  }, [category, search, status, sort, ticketSource]);

  useEffect(() => {
    fetch('/api/ticket-sources').then((r) => r.json()).then(setTicketSources);
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setHasMore(true);

    fetch(buildUrl(1))
      .then((r) => r.json())
      .then((data) => {
        setPerformances(data);
        setHasMore(data.length >= PAGE_SIZE);
        setLoading(false);
      });
  }, [category, search, status, sort, ticketSource, buildUrl]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    fetch(buildUrl(nextPage))
      .then((r) => r.json())
      .then((data) => {
        setPerformances((prev) => [...prev, ...data]);
        setHasMore(data.length >= PAGE_SIZE);
        setPage(nextPage);
        setLoadingMore(false);
      });
  }, [page, loadingMore, hasMore, buildUrl]);

  const lastCardRef = useCallback((node) => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore, loadMore]);

  const updateFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);
    else p.delete(key);
    setSearchParams(p);
  };

  const toggleCategory = (id) => {
    updateFilter('category', toggleMulti(category, id));
  };

  const toggleTicketSource = (id) => {
    updateFilter('ticketSource', toggleMulti(ticketSource, id));
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

      {/* Category Filters (multi-select) */}
      <div className="filters-bar">
        <span className="filter-label">장르</span>
        {categoryList.map((cat) => (
          <button
            key={cat.id}
            className={`filter-chip ${isSelected(category, cat.id) ? 'active' : ''}`}
            onClick={() => toggleCategory(cat.id)}
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
          <option value="popularity">인기순</option>
        </select>
      </div>

      {/* Status Filters */}
      <div className="filters-bar filters-bar-sub">
        <span className="filter-label">상태</span>
        <button
          className={`filter-chip ${!status ? 'active' : ''}`}
          onClick={() => updateFilter('status', '')}
        >
          전체
        </button>
        <button
          className={`filter-chip ${status === 'upcoming' ? 'active' : ''}`}
          onClick={() => updateFilter('status', status === 'upcoming' ? '' : 'upcoming')}
        >
          공연예정
        </button>
        <button
          className={`filter-chip ${status === 'on_sale' ? 'active' : ''}`}
          onClick={() => updateFilter('status', status === 'on_sale' ? '' : 'on_sale')}
        >
          공연중
        </button>
      </div>

      {/* Ticket Source Filters (multi-select) */}
      <div className="filters-bar filters-bar-sub">
        <span className="filter-label">예매처</span>
        {ticketSources.map((src) => (
          <button
            key={src.id}
            className={`filter-chip ${isSelected(ticketSource, src.id) ? 'active' : ''}`}
            onClick={() => toggleTicketSource(src.id)}
          >
            {src.name}
          </button>
        ))}
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
            {performances.map((p, idx) => (
              <div
                key={p.id}
                ref={idx === performances.length - 1 ? lastCardRef : null}
              >
                <PerformanceCard performance={p} />
              </div>
            ))}
          </div>
        )}

        {loadingMore && (
          <div className="loading">더 불러오는 중...</div>
        )}
      </div>
    </>
  );
}

export default PerformanceListPage;
