import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import './Layout.css';
import notifSvg from '../../assets/icons/notification.svg';
import profilePic from '../../assets/images/profile-pic.jpg';

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
            <div className="profile-section">
              <div className="profile-avatar">
                <img src={profilePic} alt="profile" height="30" width="30" />
              </div>
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
