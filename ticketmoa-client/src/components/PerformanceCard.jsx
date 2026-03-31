import { useState } from 'react';

const categoryNames = {
  musical: '뮤지컬',
  concert: '콘서트',
  theater: '연극',
  classic: '클래식',
  dance: '무용',
  etc: '기타',
};

const statusLabels = {
  on_sale: '공연중',
  upcoming: '공연예정',
  sold_out: '매진',
  completed: '공연완료',
};

function PerformanceCard({ performance: p }) {
  const [expanded, setExpanded] = useState(false);

  // price: 샘플데이터는 객체, DB데이터는 문자열
  const priceDisplay = typeof p.price === 'object' && p.price !== null
    ? `${Math.min(...Object.values(p.price)).toLocaleString()}원~`
    : p.lowestPrice
      ? `${p.lowestPrice.toLocaleString()}원~`
      : p.price || '';

  const castDisplay = Array.isArray(p.cast) ? p.cast.join(', ') : (p.cast || '');

  return (
    <div className="perf-card">
      {/* 상단: 포스터 + 기본 정보 */}
      <div className="perf-card-top">
        <img className="perf-thumb" src={p.thumbnail || p.poster} alt={p.title} />
        <div className="perf-info">
          <div className="perf-badges">
            <span className={`badge badge-${p.category}`}>
              {categoryNames[p.category] || p.genre || p.category}
            </span>
            <span className={`badge-status badge-${p.status}`}>
              {statusLabels[p.status] || p.status}
            </span>
          </div>
          <h3 className="perf-title">{p.title}</h3>
          <p className="perf-venue">{p.venue}</p>
          <p className="perf-date">{p.startDate} ~ {p.endDate}</p>
          <div className="perf-meta">
            {priceDisplay && <span className="perf-price">{priceDisplay}</span>}
            {p.rating && <span className="perf-rating">★ {p.rating}</span>}
          </div>
        </div>
      </div>

      {/* 펼침 상세 */}
      {expanded && (
        <div className="perf-card-detail">
          {castDisplay && (
            <div className="detail-row">
              <span className="detail-label">출연</span>
              <span className="detail-value">{castDisplay}</span>
            </div>
          )}
          {p.time && (
            <div className="detail-row">
              <span className="detail-label">시간</span>
              <span className="detail-value">{p.time}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">장소</span>
            <span className="detail-value">{p.venue}{p.location ? ` (${p.location})` : ''}</span>
          </div>
          {p.runtime && (
            <div className="detail-row">
              <span className="detail-label">러닝타임</span>
              <span className="detail-value">{p.runtime}</span>
            </div>
          )}
          {p.age && (
            <div className="detail-row">
              <span className="detail-label">관람연령</span>
              <span className="detail-value">{p.age}</span>
            </div>
          )}
          {typeof p.price === 'string' && p.price && (
            <div className="detail-row">
              <span className="detail-label">가격</span>
              <span className="detail-value">{p.price}</span>
            </div>
          )}
          {typeof p.price === 'object' && p.price !== null && (
            <div className="detail-row">
              <span className="detail-label">가격</span>
              <span className="detail-value">
                <div className="price-grades">
                  {Object.entries(p.price).map(([grade, price]) => (
                    <span key={grade} className="price-grade">
                      {grade.toUpperCase()} {price.toLocaleString()}원
                    </span>
                  ))}
                </div>
              </span>
            </div>
          )}
        </div>
      )}

      {/* 하단: 예매처 바로가기 */}
      {p.ticketSources && p.ticketSources.length > 0 && (
        <div className="perf-card-bottom">
          {p.ticketSources.map((src) => (
            <a
              key={src.name}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ticket-btn"
              onClick={(e) => e.stopPropagation()}
            >
              {src.name}
              <span className="arrow">&#8599;</span>
            </a>
          ))}
        </div>
      )}

      {/* 상세 토글 */}
      <button
        className="toggle-detail-btn"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? '접기 ▲' : '상세정보 ▼'}
      </button>
    </div>
  );
}

export default PerformanceCard;
