import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-container">
      <Navigation />
      <div className="layout-right">
        <main className="layout-content">
          <div className="top-right-container">
            <button className="notification-btn" aria-label="Notifications">
              <span className="notif-icon">🔔</span>
              <span className="notif-badge">3</span>
            </button>
            <div className="profile-section">
              <div className="profile-avatar">👤</div>
              <span className="profile-name">Johnny English</span>
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
