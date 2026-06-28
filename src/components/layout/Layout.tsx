import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Notifications from './Notifications';
import UserMenu from './UserMenu';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-container">
      <Navigation />
      <div className="layout-right">
        <main className="layout-content">
          <div className="top-right-container">
            <Notifications />
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