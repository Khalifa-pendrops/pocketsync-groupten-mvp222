import { useState, useEffect } from 'react';
import './LinkAccounts.css';
import shieldCheckSvg from '../assets/icons/shield-check.svg';
import buildingSvg from '../assets/icons/building.svg';
import linkSvg from '../assets/icons/link.svg';
import shieldLockSvg from '../assets/icons/shield-lock.svg';
import checkCircleSvg from '../assets/icons/check-circle.svg';
import lockSvg from '../assets/icons/lock.svg';
import SecurityConsentModal from '../components/modals/SecurityConsentModal';
import { institutionService } from '../services';
import type { Institution } from '../types';

type Category = 'All' | 'Banks' | 'Fintechs' | 'Microfinance Banks';

const TABS: Category[] = ['All', 'Banks', 'Fintechs', 'Microfinance Banks'];

interface BankLogoProps {
  src?: string;
  initial: string;
  color: string;
  size?: number;
}
function BankLogo({ src, initial, color, size = 48 }: BankLogoProps) {
  return src ? (
    <img
      src={src}
      alt={initial}
      width={size}
      height={size}
      style={{ objectFit: 'contain', borderRadius: 8 }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }}
    />
  ) : (
    <div
      className="bank-logo-fallback"
      style={{ width: size, height: size, backgroundColor: color }}
    >
      {initial}
    </div>
  );
}

const LinkAccounts = () => {
  const [activeTab, setActiveTab] = useState<Category>('All');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);

  useEffect(() => {
    institutionService.getAll().then((data) => {
      setInstitutions(data);
      setLoading(false);
    });
  }, []);

  const filtered =
    activeTab === 'All'
      ? institutions
      : institutions.filter((i) => i.category === activeTab);

  return (
    <div className="la-container">

      {/* Search bar - top */}
      <div className="la-search">
        <span className="la-search-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          className="la-search-input"
          placeholder="Search for your bank or fintech"
          aria-label="Search banks and fintechs"
        />
      </div>

      {/* Page title row */}
      <div className="la-title-row">
        <div>
          <h1 className="la-title">Connect an Account</h1>
          <p className="la-subtitle">
            Securely connect your bank or fintech account to get started with PocketSync.
          </p>
        </div>
        <div className="la-secure-badge">
          <span className="la-secure-icon">
            <img src={shieldCheckSvg} alt="" width="24" height="24" />
          </span>
          <div>
            <p className="la-secure-title">Secure Connection</p>
            <p className="la-secure-desc">256-bit SSL encryption</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="la-tabs" role="tablist" aria-label="Institution categories">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`la-tab${activeTab === tab ? ' la-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`panel-${tab.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {tab}
          </button>
        ))}
      </div>

{/* Grid section */}
      <section className="la-section">
        <h2 className="la-section-title">Accounts linked to BVN</h2>
        {loading ? (
          <p className="state-message loading">Loading institutions...</p>
        ) : (
          <div className="la-grid">
            {filtered.map((inst) => (
              <div key={inst.id} className="la-card">
                <div className="la-card-header">
                  <BankLogo
                    src={inst.logoSrc}
                    initial={inst.initial}
                    color={inst.logoColor}
                    size={48}
                  />
                  <div className="la-card-info">
                    <p className="la-card-name">{inst.name}</p>
                    <p className="la-card-masked">{inst.masked}</p>
                  </div>
                </div>
                <button
                  className="la-add-btn"
                  onClick={() => setSelectedInstitution(inst)}
                  aria-label={`Add ${inst.name} account`}
                >
                  Add Account
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Can't find your bank */}
      <div className="la-manual-bar">
        <div className="la-manual-left">
          <span className="la-manual-icon">
            <img src={buildingSvg} alt="" width="24" height="24" />
          </span>
          <div>
            <p className="la-manual-title">Can't find your bank?</p>
            <p className="la-manual-desc">Connect using your account details</p>
          </div>
        </div>
        <button className="la-manual-btn">
          Enter Details Manually <span aria-hidden="true">›</span>
        </button>
      </div>

      {/* How it works */}
      <section className="la-section la-how-section">
        <h2 className="la-section-title">How it works</h2>
        <div className="la-steps">
          <div className="la-step">
            <div className="la-step-icon">
              <img src={linkSvg} alt="" width="34" height="34" />
            </div>
            <div className="la-step-body">
              <p className="la-step-num">1. Select your bank</p>
              <p className="la-step-desc">
                Choose your bank or fintech from the list above.
              </p>
            </div>
          </div>
          <div className="la-step">
            <div className="la-step-icon">
              <img src={shieldLockSvg} alt="" width="24" height="24" />
            </div>
            <div className="la-step-body">
              <p className="la-step-num">2. Secure login</p>
              <p className="la-step-desc">
                You'll be redirected to your bank to securely log in.
              </p>
            </div>
          </div>
          <div className="la-step">
            <div className="la-step-icon">
              <img src={checkCircleSvg} alt="" width="24" height="24" />
            </div>
            <div className="la-step-body">
              <p className="la-step-num">3. Connection successful</p>
              <p className="la-step-desc">
                Your account will be connected and ready to use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy note */}
      <div className="la-privacy">
        <span className="la-privacy-icon">
          <img src={lockSvg} alt="" width="16" height="16" />
        </span>
        We never store your login details. Your data is encrypted and secure.
      </div>

      <SecurityConsentModal
        isOpen={selectedInstitution !== null}
        onClose={() => setSelectedInstitution(null)}
        onProceed={() => {
          setSelectedInstitution(null);
        }}
      />
    </div>
  );
};

export default LinkAccounts;
