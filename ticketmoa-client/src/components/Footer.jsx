import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo">TicketMoa</span>
            <p className="footer-desc">모든 공연 정보를 한곳에서</p>
          </div>
          <nav className="footer-links">
            <Link to="/">홈</Link>
            <Link to="/performances">공연 목록</Link>
            <Link to="/performances?status=upcoming">오픈 예정</Link>
            <Link to="/performances?status=on_sale">예매 가능</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>공연 데이터 출처: KOPIS(공연예술통합전산망)</p>
          <p>&copy; {new Date().getFullYear()} TicketMoa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
