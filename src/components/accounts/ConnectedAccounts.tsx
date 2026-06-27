import { useState, useEffect } from 'react';
import './accounts-row.css';
import type { BankAccount } from '../../types';
import { accountService } from '../../services';

const logoColors: Record<string, string> = {
  'Zenith Bank': '#1a3a6b',
  'Access Bank': '#e30613',
  'Opay': '#00a85d',
  'GTBank': '#6b3fa0',
};

function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface AccountCardProps {
  account: BankAccount;
}

function AccountCard({ account }: AccountCardProps) {
  const bgColor = logoColors[account.bankName] || '#6b7280';
  const initial = account.bankName.charAt(0);

  return (
    <div className="account-card">
      <div className="account-card-top">
        <div className="account-logo" style={{ backgroundColor: bgColor, color: '#ffffff', fontWeight: 700, fontSize: '1.125rem' }}>
          {initial}
        </div>
        <div className="account-info">
          <p className="account-bank-name">{account.bankName}</p>
          <p className="account-mask">{account.maskAccount}</p>
        </div>
      </div>
      <p className="account-balance">{formatCurrency(account.balance)}</p>
      <div className="account-footer">
        <span className="account-type">{account.accountType}</span>
        <span className={`status-pill status-${account.status.toLowerCase()}`}>
          {account.status}
        </span>
      </div>
    </div>
  );
}

function AddAccountCard({ onClick }: { onClick: () => void }) {
  return (
    <div className="add-account-dashed" onClick={onClick}>
      <span className="add-icon-dashed">+</span>
      <p className="add-label-dashed">Add Account</p>
    </div>
  );
}

export default function ConnectedAccounts({ onAddAccount }: { onAddAccount?: () => void }) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    accountService.getAll().then((data) => {
      setAccounts(data);
      setLoading(false);
    });
  }, []);

  return (
    <section className="dashboard-section">
      <div className="accounts-inner">
        <div className="section-header">
          <h2>Connected Accounts</h2>
          <a href="#" className="view-all">View all</a>
        </div>
        {loading ? (
          <p className="state-message">Loading accounts...</p>
        ) : (
          <div className="accounts-row">
            {accounts.map((acc) => (
              <AccountCard key={acc.id} account={acc} />
            ))}
            <AddAccountCard onClick={() => onAddAccount?.()} />
          </div>
        )}
      </div>
    </section>
  );
}
