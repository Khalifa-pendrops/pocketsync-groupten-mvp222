import { useNavigate, Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import './Layout.css';
import notifSvg from '../../assets/icons/notification.svg';
import profilePic from '../../assets/images/profile-pic.jpg';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { tearDownSession } from '../../lib/authFlow';
import { authService } from '../../services/authService';

const Layout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  async function handleLogout() {
    try {
      await authService.logout();
    } catch {
      // Session may already be expired — still clear local state.
    } finally {
      tearDownSession(dispatch);
      navigate('/login', { replace: true });
    }
  }

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
              <button type="button" className="profile-button" onClick={handleLogout}>
                <div className="profile-avatar">
                  <img src={profilePic} alt="profile" height="30" width="30" />
                </div>
                <span className="profile-name">{user?.fullName ?? user?.email ?? 'Account'}</span>
              </button>
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;