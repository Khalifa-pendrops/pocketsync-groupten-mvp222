import { useState, useRef, useEffect } from 'react';
import './SecurityConsentModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

const ShieldIcon = () => (
  <svg width="26" height="30" viewBox="0 0 26 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 0L0 6v7c0 7.55 5.2 14.58 13 16 7.8-1.42 13-8.45 13-16V6L13 0z" fill="white" />
    <rect x="10" y="11" width="6" height="8" rx="1" fill="#7c3aed" />
    <path d="M13 13v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="13" cy="18" r="1" fill="white" />
  </svg>
);

const ShieldOutlineIcon = () => (
  <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 1L2 5v5c0 5.25 3.6 10.15 8 11 4.4-0.85 8-5.75 8-11V5l-8-4z" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M7 10.5l2 2 4-4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BankIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="8" width="18" height="3" rx="0.5" stroke="#7c3aed" strokeWidth="1.5" />
    <path d="M3 11v5h14v-5" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 1L1 6h18L10 1z" stroke="#7c3aed" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    <rect x="8" y="8" width="4" height="3" fill="#7c3aed" rx="0.5" />
    <path d="M6 16v-3h8v3" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const UnlockIcon = () => (
  <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="10" width="14" height="11" rx="2" stroke="#7c3aed" strokeWidth="1.5" fill="none" />
    <path d="M6 10V6a4 4 0 0 1 8 0" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="15" r="1.5" fill="#7c3aed" />
    <path d="M10 15v2" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ShieldEyeOffIcon = () => (
  <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 1L2 5v5c0 5.25 3.6 10.15 8 11 4.4-0.85 8-5.75 8-11V5l-8-4z" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M3 3l14 16" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 11c0.6-1.2 1.8-2 3-2s2.4 0.8 3 2" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="11" r="1.2" fill="#7c3aed" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FEATURES = [
  {
    icon: <ShieldOutlineIcon />,
    title: 'NDPR Compliant',
    desc: 'We comply with the Nigeria Data Protection Regulation (NDPR) to ensure your personal data is protected.',
  },
  {
    icon: <BankIcon />,
    title: 'CBN Guidelines',
    desc: 'We adhere to the CBN open banking and data sharing standards.',
  },
  {
    icon: <UnlockIcon />,
    title: 'Secure & Encrypted',
    desc: 'Your data is encrypted in transit and at rest using industry-standards encryption (256-bit SSL).',
  },
  {
    icon: <ShieldEyeOffIcon />,
    title: 'Secure & Encrypted',
    desc: 'We do not sell or share your personal or financial data with third parties without your consent.',
  },
];

const SecurityConsentModal = ({ isOpen, onClose, onProceed }: Props) => {
  const [checked, setChecked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="security-modal-overlay" onClick={onClose}>
      <div
        className="security-modal-card"
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="security-modal-icon-wrapper">
          <div className="security-modal-icon-ring">
            <div className="security-modal-icon-inner">
              <ShieldIcon />
            </div>
          </div>
        </div>

        <h2 className="security-modal-title">Your Security is Our Priority</h2>
        <p className="security-modal-intro">
          At PocketSync, we are committed to protecting your data and your privacy.
          Before you connect your account, please review how we handle your information.
        </p>

        <div className="security-feature-list">
          {FEATURES.map((f, i) => (
            <div className="security-feature" key={i}>
              <div className="security-feature-icon">{f.icon}</div>
              <div className="security-feature-body">
                <p className="security-feature-title">{f.title}</p>
                <p className="security-feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="security-checkbox-row">
          <input
            type="checkbox"
            id="consent-checkbox"
            className="security-checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <label htmlFor="consent-checkbox" className="security-checkbox-label">
            I understand how my data is handled and agree to connect my account.
          </label>
        </div>

        <div className="security-modal-actions">
          <button className="security-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`security-btn-proceed${!checked ? ' disabled' : ''}`}
            disabled={!checked}
            onClick={onProceed}
          >
            Proceed to connect <ArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityConsentModal;
