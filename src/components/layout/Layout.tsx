import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import './Layout.css';

const Layout = () => {
  return (

    <div className="layout-container">
      <Navigation />
      <div className="layout-right">
        <header className="top-bar">
          <div className="top-bar-left">
            <span className="mobile-menu-trigger">☰</span>
          </div>
          <div className="top-bar-right">
            <button className="notification-btn" aria-label="Notifications">
              <span className="notif-icon">🔔</span>
              <span className="notif-badge">3</span>
            </button>
            <div className="profile-section">
              <div className="profile-avatar">👤</div>
              <span className="profile-name">English</span>
            </div>
          </div>
        </header>
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
   
  );
};

export default Layout;
