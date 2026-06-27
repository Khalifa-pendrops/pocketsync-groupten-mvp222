import './accounts-row.css';
import zenithLogo from '../../assets/images/zenith.png';
import accessLogo from '../../assets/images/access.png';
import opayLogo from '../../assets/images/opay.png';
import gtbankLogo from '../../assets/images/gtbank.png';

interface BankAccount {
  id: string;
  bankName: string;
  maskAccount: string;
  balance: number;
  accountType: string;
  status: 'Active' | 'Inactive';
}

const bankLogos: Record<string, string> = {
  'Zenith Bank': zenithLogo,
  'Access Bank': accessLogo,
  'Opay': opayLogo,
  'GTBank': gtbankLogo,
};

const logoColors: Record<string, string> = {
  'Zenith Bank': '#1a3a6b',
  'Access Bank': '#e30613',
  'Opay': '#00a85d',
  'GTBank': '#6b3fa0',
};

const mockAccounts: BankAccount[] = [
  { id: '1', bankName: 'Zenith Bank', maskAccount: '**** 1234', balance: 30_000_000, accountType: 'Savings Account', status: 'Active' },
  { id: '2', bankName: 'Access Bank', maskAccount: '**** 5678', balance: 100_000_000, accountType: 'Current Account', status: 'Active' },
  { id: '3', bankName: 'Opay', maskAccount: '**** 9012', balance: 100_000, accountType: 'Opay Wallet', status: 'Active' },
  { id: '4', bankName: 'GTBank', maskAccount: '**** 3456', balance: 50_000, accountType: 'Savings Account', status: 'Active' },
];

function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface AccountCardProps {
  account: BankAccount;
}

function AccountCard({ account }: AccountCardProps) {
  const logo = bankLogos[account.bankName];
  const color = logoColors[account.bankName] || '#6b7280';

  return (
    <div className="account-card">
      <div className="account-card-top">
        <div className="account-logo" style={{ backgroundColor: color }}>
          {logo && <img src={logo} alt={account.bankName} width="24" height="24" />}
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
