import { Link } from 'react-router-dom';
import type { BankAccount } from '../../types';
import { INSTITUTION_META } from '../../constants/institutions';
import { formatAccountType, formatNgn } from '../../utils/format';
import './accounts-row.css';

interface AccountCardProps {
  account: BankAccount;
}

function AccountCard({ account }: AccountCardProps) {
  const meta = INSTITUTION_META[account.bankName] ?? {
    color: '#6b7280',
    initial: account.bankName.charAt(0),
  };

  return (
    <div className="account-card">
      <div className="account-card-top">
        <div className="account-logo" style={{ backgroundColor: meta.color }}>
          {meta.logo ? (
            <img src={meta.logo} alt={account.bankName} width="24" height="24" />
          ) : (
            <span className="account-logo-initial">{meta.initial}</span>
          )}
        </div>
        <div className="account-info">
          <p className="account-bank-name">{account.bankName}</p>
          <p className="account-mask">{account.maskAccount}</p>
        </div>
      </div>
      <p className="account-balance">{formatNgn(account.balance)}</p>
      <div className="account-footer">
        <span className="account-type">{formatAccountType(account.accountType)}</span>
        <span className={`status-pill status-${account.status.toLowerCase()}`}>
          {account.status}
        </span>
      </div>
    </div>
  );
}

function AddAccountCard() {
  return (
    <Link to="/link-accounts" className="add-account-dashed">
      <span className="add-icon-dashed">+</span>
      <p className="add-label-dashed">Add Account</p>
    </Link>
  );
}

interface ConnectedAccountsProps {
  accounts: BankAccount[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function ConnectedAccounts({
  accounts,
  loading = false,
  error = null,
  onRetry,
}: ConnectedAccountsProps) {
  return (
    <section className="dashboard-section">
      <div className="accounts-inner">
        <div className="section-header">
          <h2>Connected Accounts</h2>
          <Link to="/link-accounts" className="view-all">
            View all
          </Link>
        </div>

        {loading && <p className="dashboard-status">Loading accounts…</p>}

        {error && (
          <div className="dashboard-error">
            <p>{error}</p>
            {onRetry && (
              <button type="button" className="dashboard-retry-btn" onClick={onRetry}>
                Try again
              </button>
            )}
          </div>
        )}

        {!loading && !error && (
          <>
            {accounts.length === 0 && (
              <p className="dashboard-status">No accounts linked yet.</p>
            )}
            <div className="accounts-row">
              {accounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
              <AddAccountCard />
            </div>
          </>
        )}
      </div>
    </section>
  );
}