import { NavLink } from 'react-router-dom';
import './Navigation.css';
import logoSvg from '../../assets/icons/logo.svg';
import dashboardSvg from '../../assets/icons/dashboard.svg';
import linkAccountsSvg from '../../assets/icons/link-accounts.svg';
import transactionsSvg from '../../assets/icons/transactions.svg';
import analyticsSvg from '../../assets/icons/analytics.svg';
import payBillsSvg from '../../assets/icons/pay-bills.svg';
import helpSupportSvg from '../../assets/icons/help-support.svg';
import settingsSvg from '../../assets/icons/settings.svg';

const Navigation = () => {
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <span className="brand-icon">
          <img src={logoSvg} alt="PocketSync" width="36" height="38" />
        </span>
      </div>

      <div className="nav-links-container">
        <div className="nav-group">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span className="nav-icon"><img src={dashboardSvg} alt="" width="18" height="18" /></span>
            <span className="nav-text">Dashboard</span>
          </NavLink>
          <NavLink to="/link-accounts" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span className="nav-icon"><img src={linkAccountsSvg} alt="" width="18" height="18" /></span>
            <span className="nav-text">Link Accounts</span>
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span className="nav-icon"><img src={transactionsSvg} alt="" width="18" height="18" /></span>
            <span className="nav-text">Transactions</span>
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span className="nav-icon"><img src={analyticsSvg} alt="" width="18" height="18" /></span>
            <span className="nav-text">Analytics</span>
          </NavLink>
          <NavLink to="/pay-bills" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span className="nav-icon"><img src={payBillsSvg} alt="" width="18" height="18" /></span>
            <span className="nav-text">Pay Bills</span>
          </NavLink>
          <NavLink to="/help-support" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span className="nav-icon"><img src={helpSupportSvg} alt="" width="18" height="18" /></span>
            <span className="nav-text">Help and support</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span className="nav-icon"><img src={settingsSvg} alt="" width="18" height="18" /></span>
            <span className="nav-text">Settings</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
