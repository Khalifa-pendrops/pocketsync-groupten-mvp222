import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <span className="brand-icon">🅿️</span> PocketSync
      </div>

      {/* Main nav links */}
      <div className="nav-links-container">
        <div className="nav-group">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Dashboard</span>
          </NavLink>
          <NavLink to="/link-accounts" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span className="nav-icon">🔗</span>
            <span className="nav-text">Link Accounts</span>
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span className="nav-icon">💸</span>
            <span className="nav-text">Transactions</span>
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span className="nav-icon">📊</span>
            <span className="nav-text">Analytics</span>
          </NavLink>
          <NavLink to="/pay-bills" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span className="nav-icon">✈️</span>
            <span className="nav-text">Pay Bills</span>
          </NavLink>
          <NavLink to="/help-support" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span className="nav-icon">💬</span>
            <span className="nav-text">Help and support</span>
          </NavLink>
        </div>
      </div>

      {/* Settings pinned to bottom */}
      <div className="nav-bottom">
        <NavLink to="/settings" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <span className="nav-icon">⚙️</span>
          <span className="nav-text">Settings</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
