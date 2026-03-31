import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          TicketMoa<small>티켓모아</small>
        </Link>
        <div className="header-actions">
          <button
            className="header-search-btn"
            onClick={() => navigate('/performances')}
            aria-label="검색"
          >
            &#128269;
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
