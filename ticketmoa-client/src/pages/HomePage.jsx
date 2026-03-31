import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PerformanceCard from '../components/PerformanceCard';

function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [performances, setPerformances] = useState([]);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories);
    fetch('/api/performances?sort=date').then((r) => r.json()).then(setPerformances);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/performances?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const onSale = performances.filter((p) => p.status === 'on_sale');
  const upcoming = performances.filter((p) => p.status === 'upcoming');

  return (
    <>
      {/* Hero + Search */}
      <section className="hero-compact">
        <h1>모든 공연, 한눈에</h1>
        <p>뮤지컬 · 콘서트 · 연극 · 클래식 예매 정보를 모았습니다</p>
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="공연명, 아티스트 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">&#128269;</button>
        </form>
      </section>

      {/* Categories */}
      <div className="category-scroll">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="cat-chip"
            onClick={() => navigate(`/performances?category=${cat.id}`)}
          >
            <span className="chip-icon">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* 오픈 예정 - 가로 스크롤 */}
      {upcoming.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">오픈 예정</h2>
            <Link to="/performances?status=upcoming" className="section-more">
              전체보기 &rsaquo;
            </Link>
          </div>
          <div className="hot-scroll">
            {upcoming.map((p) => (
              <div
                key={p.id}
                className="hot-card"
                onClick={() => navigate(`/performances?search=${encodeURIComponent(p.title)}`)}
              >
                <div className="img-wrap">
                  <img className="hot-card-img" src={p.thumbnail} alt={p.title} />
                  <span className="hot-card-badge">오픈예정</span>
                </div>
                <p className="hot-card-title">{p.title}</p>
                <p className="hot-card-sub">{p.venue}</p>
                <p className="hot-card-date">{p.startDate}~</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 예매 가능 */}
      {onSale.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">예매 가능</h2>
            <Link to="/performances?status=on_sale" className="section-more">
              전체보기 &rsaquo;
            </Link>
          </div>
          <div className="perf-list">
            {onSale.slice(0, 4).map((p) => (
              <PerformanceCard key={p.id} performance={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default HomePage;
