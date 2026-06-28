import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import linkAccountsSvg from '../../assets/icons/link-accounts.svg';
import transactionsSvg from '../../assets/icons/transactions.svg';
import helpSupportSvg from '../../assets/icons/help-support.svg';
import settingsSvg from '../../assets/icons/settings.svg';
import './DashboardModal.css';
import './MoreActionsModal.css';

const MORE_ACTIONS = [
  {
    to: '/transfer',
    label: 'Transfer',
    icon: transactionsSvg,
  },
  {
    to: '/link-accounts',
    label: 'Link Accounts',
    icon: linkAccountsSvg,
  },
  {
    to: '/help-support',
    label: 'Help & Support',
    icon: helpSupportSvg,
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: settingsSvg,
  },
] as const;

interface MoreActionsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MoreActionsModal({ open, onClose }: MoreActionsModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="dashboard-modal-backdrop" onClick={onClose}>
      <div
        className="dashboard-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="more-actions-title"
      >
        <h3 id="more-actions-title">More actions</h3>
        <p className="dashboard-modal-sub">Other PocketSync pages.</p>

        <div className="more-actions-grid">
          {MORE_ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="more-action-item"
              onClick={onClose}
            >
              <div className="more-action-icon">
                <img src={action.icon} alt="" width="22" height="22" />
              </div>
              <span>{action.label}</span>
            </Link>
          ))}
        </div>

        <div className="dashboard-modal-actions">
          <button
            type="button"
            className="dashboard-modal-btn dashboard-modal-btn--ghost"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}