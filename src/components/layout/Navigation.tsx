import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';
import logoSvg from '../../assets/icons/logo.svg';
import logoFullSvg from '../../assets/icons/logo-full.svg';
import dashboardSvg from '../../assets/icons/dashboard.svg';
import linkAccountsSvg from '../../assets/icons/link-accounts.svg';
import transactionsSvg from '../../assets/icons/transactions.svg';
import analyticsSvg from '../../assets/icons/analytics.svg';
import payBillsSvg from '../../assets/icons/pay-bills.svg';
import helpSupportSvg from '../../assets/icons/help-support.svg';
import settingsSvg from '../../assets/icons/settings.svg';
import sidebarBgSvg from '../../assets/icons/sidebar-bg.svg';

const NAV_LINKS = [
  { to: '/', end: true, icon: dashboardSvg, label: 'Dashboard' },
  { to: '/link-accounts', icon: linkAccountsSvg, label: 'Link Accounts' },
  { to: '/transactions', icon: transactionsSvg, label: 'Transactions' },
  { to: '/analytics', icon: analyticsSvg, label: 'Analytics' },
  { to: '/pay-bills', icon: payBillsSvg, label: 'Pay Bills' },
  { to: '/help-support', icon: helpSupportSvg, label: 'Help and support' },
  { to: '/settings', icon: settingsSvg, label: 'Settings' },
];

const Navigation = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-brand">
          <img src={logoFullSvg} alt="PocketSync" />
        </div>
        <button
          className={`hamburger-btn ${drawerOpen ? 'open' : ''}`}
          onClick={() => setDrawerOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`nav-overlay ${drawerOpen ? 'open' : ''}`} onClick={closeDrawer} />

      <nav ref={drawerRef} className={`navigation ${drawerOpen ? 'drawer-open' : ''}`}>
        <div className="sidebar-bg" aria-hidden="true">
          <img src={sidebarBgSvg} alt="" />
        </div>
        <div className="nav-brand">
          <span className="brand-icon">
            <img src={logoSvg} alt="PocketSync" width="36" height="38" />
          </span>
        </div>

        <div className="nav-links-container">
          <div className="nav-group">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                onClick={closeDrawer}
              >
                <span className="nav-icon">
                  <img src={link.icon} alt="" width="18" height="18" />
                </span>
                <span className="nav-text">{link.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
