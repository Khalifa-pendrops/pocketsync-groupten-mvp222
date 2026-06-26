import './accounts-row.css';

export interface BankAccount {
  id: string;
  bankName: string;
  maskAccount: string;
  balance: number;
  accountType: string;
  status: 'Active' | 'Inactive';
  logoUrl?: string;
}

const mockAccounts: BankAccount[] = [
  { id: '1', bankName: 'Zenith Bank', maskAccount: '**** 1234', balance: 30_000_000, accountType: 'Savings', status: 'Active' },
  { id: '2', bankName: 'Access Bank', maskAccount: '**** 5678', balance: 100_000_000, accountType: 'Current', status: 'Active' },
  { id: '3', bankName: 'Opay', maskAccount: '**** 9012', balance: 100_000, accountType: 'Opay Wallet', status: 'Active' },
  { id: '4', bankName: 'GTBank', maskAccount: '**** 3456', balance: 50_000, accountType: 'Savings', status: 'Active' },
];

const bankLogos: Record<string, string> = {
  'Zenith Bank': 'Z',
  'Access Bank': 'A',
  'Opay': 'O',
  'GTBank': 'G',
};

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
  const initial = bankLogos[account.bankName] || account.bankName.charAt(0);
  const color = logoColors[account.bankName] || '#6b7280';

  return (
    <div className="account-card">
      <div className="account-card-top">
        <div className="account-logo" style={{ backgroundColor: color }}>
          <span>{initial}</span>
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

function AddAccountCard() {
  return (
    <div className="add-account-dashed">
      <span className="add-icon-dashed">+</span>
      <p className="add-label-dashed">Add Account</p>
    </div>
  );
}

export default function ConnectedAccounts() {
  return (
    <section className="dashboard-section">
      <div className="accounts-inner">
        <div className="section-header">
          <h2>Connected Accounts</h2>
          <a href="#" className="view-all">View all</a>
        </div>
        <div className="accounts-row">
          {mockAccounts.map((acc) => (
            <AccountCard key={acc.id} account={acc} />
          ))}
          <AddAccountCard />
        </div>
      </div>
    </section>
  );
}
