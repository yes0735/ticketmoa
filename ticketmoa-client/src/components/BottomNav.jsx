import { Link, useLocation } from 'react-router-dom';

function BottomNav() {
  const { pathname } = useLocation();

  const items = [
    { path: '/', icon: '\u2302', label: '홈' },
    { path: '/performances', icon: '\u{1F3AD}', label: '공연' },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${pathname === item.path ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default BottomNav;
