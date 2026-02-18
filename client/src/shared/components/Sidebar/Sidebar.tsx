import { Link, useLocation } from "react-router-dom";
import './Sidebar.css'


export default function Sidebar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const avatarUrl = user.avatar ? `/uploads/avatars/${user.avatar}` : undefined;

  const navItems = [
    { label: 'Feed', path: '/' },
    { label: 'Groups', path: '/groups', isMock: true },
    { label: 'Messages', path: '/messages', isMock: true },
    { label: 'Settings', path: '/settings', isMock: true },
  ];

  return (
    <aside className="sidebar">
    {/* Блок Логотипа */}
    <div className="sidebar-logo-container">
        <h1 className="sidebar-logo">EventHub <span className="logo-emoji">⚡</span></h1>
    </div>

    <hr className="sidebar-divider" />

    {/* Блок Профиля */}
    <div className="sidebar-profile">
        <div className="sidebar-avatar-wrapper">
        <img src={avatarUrl} alt="Avatar" className="sidebar-avatar-img" />
        </div>
        <div className="sidebar-user-info">
        <div className="sidebar-username">{user.username}</div>
        <div className="sidebar-status">ONLINE</div>
        </div>
    </div>

    <hr className="sidebar-divider" />

    {/* Навигация (теперь она прижата выше) */}
    <nav className="sidebar-nav">
        {navItems.map((item) => (
        <Link
            key={item.label}
            to={item.isMock ? '#' : item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
        >
            {item.label}
            {item.isMock && <span className="soon-tag">Soon</span>}
        </Link>
        ))}
    </nav>

    {/* Кнопка выхода в самом низу */}
    <div className="sidebar-footer">
        <button className="sidebar-logout">Log out</button>
    </div>
    </aside>
  );
}