import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import UserMenu from './UserMenu';
import './Layout.css';
import notifSvg from '../../assets/icons/notification.svg';

const Layout = () => {
  return (
    <div className="layout-container">
      <Navigation />
      <div className="layout-right">
        <main className="layout-content">
          <div className="top-right-container">
            <button className="notification-btn" aria-label="Notifications">
              <span className="notif-icon">
                <img src={notifSvg} alt="" width="24" height="24" />
              </span>
              <span className="notif-badge">3</span>
            </button>
            <UserMenu />
          </div>
          <div className="layout-page">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;