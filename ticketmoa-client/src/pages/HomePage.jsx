import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PerformanceCard from '../components/PerformanceCard';

function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [onSale, setOnSale] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartLeft = useRef(0);
  const hasMoved = useRef(false);
  const lastPageX = useRef(0);
  const velocity = useRef(0);
  const momentumId = useRef(null);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories);
    fetch('/api/performances?status=on_sale&sort=date&limit=10').then((r) => r.json()).then(setOnSale);
    fetch('/api/performances?status=upcoming&sort=date&limit=10').then((r) => r.json()).then(setUpcoming);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/performances?search=${encodeURIComponent(search.trim())}`);
    }
  };

  // 화살표: 카드 1개 너비만큼 스크롤
  const scrollBy = useCallback((direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector('.hot-card');
    if (!card) return;
    const cardWidth = card.offsetWidth + 12; // gap 포함
    el.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  }, []);

  // 마우스 드래그 스크롤
  const stopMomentum = () => {
    if (momentumId.current) {
      cancelAnimationFrame(momentumId.current);
      momentumId.current = null;
    }
  };

  const startMomentum = () => {
    const el = scrollRef.current;
    if (!el || Math.abs(velocity.current) < 0.5) return;

    const step = () => {
      velocity.current *= 0.95; // 감속
      el.scrollLeft += velocity.current;
      if (Math.abs(velocity.current) > 0.5) {
        momentumId.current = requestAnimationFrame(step);
      }
    };
    momentumId.current = requestAnimationFrame(step);
  };

  const onMouseDown = (e) => {
    stopMomentum();
    isDragging.current = true;
    hasMoved.current = false;
    dragStartX.current = e.pageX;
    lastPageX.current = e.pageX;
    scrollStartLeft.current = scrollRef.current.scrollLeft;
    velocity.current = 0;
    scrollRef.current.style.cursor = 'grabbing';
  };

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const dx = e.pageX - dragStartX.current;
    if (Math.abs(dx) > 5) hasMoved.current = true;
    velocity.current = lastPageX.current - e.pageX;
    lastPageX.current = e.pageX;
    scrollRef.current.scrollLeft = scrollStartLeft.current - dx;
  };

  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
    startMomentum();
  };

  useEffect(() => {
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
      stopMomentum();
    };
  }, []);

  const handleCardClick = (title) => {
    // 드래그 중이면 클릭 무시
    if (hasMoved.current) return;
    navigate(`/performances?search=${encodeURIComponent(title)}`);
  };

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

      {/* 오픈 예정 */}
      {upcoming.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">오픈 예정</h2>
            <Link to="/performances?status=upcoming" className="section-more">
              전체보기 &rsaquo;
            </Link>
          </div>
          <div className="upcoming-carousel">
            <button
              className="carousel-arrow carousel-arrow-left"
              onClick={() => scrollBy(-1)}
            >
              &#8249;
            </button>
            <div
              className="upcoming-grid"
              ref={scrollRef}
              onMouseDown={onMouseDown}
              style={{ cursor: 'grab' }}
            >
              {upcoming.map((p) => (
                <div
                  key={p.id}
                  className="hot-card"
                  onClick={() => handleCardClick(p.title)}
                >
                  <div className="img-wrap">
                    <img className="hot-card-img" src={p.thumbnail} alt={p.title} draggable={false} />
                    <span className="hot-card-badge">오픈예정</span>
                  </div>
                  <p className="hot-card-title">{p.title}</p>
                  <p className="hot-card-sub">{p.venue}</p>
                  <p className="hot-card-date">{p.startDate}~</p>
                </div>
              ))}
            </div>
            <button
              className="carousel-arrow carousel-arrow-right"
              onClick={() => scrollBy(1)}
            >
              &#8250;
            </button>
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
          <div className="perf-list home-perf-list">
            {onSale.slice(0, 10).map((p) => (
              <PerformanceCard key={p.id} performance={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default HomePage;
