import { useState } from 'react';
import './Transactions.css';
import lightningSvg from '../assets/icons/lightning.svg';

const filters = ['All', 'Income', 'Expense', 'Transfer', 'Bills', 'Airtime'];

const allTransactions = [
  { id: 1, name: 'Chiamaka Opal', desc: 'Transfer to 0024561190', amount: -150000, date: 'Today, 9:41 AM', type: 'transfer' },
  { id: 2, name: 'Electricity Bill', desc: 'EEDC Enugu', amount: -75000, date: 'Yesterday, 10:05 AM', type: 'bills' },
  { id: 3, name: 'Adaeze Okeke', desc: 'Transfer to 0034567890', amount: -200000, date: 'Jun 20, 10:30 AM', type: 'transfer' },
  { id: 4, name: 'Ifeanyi Uche', desc: 'Transfer from 0045678901', amount: 50000, date: 'Jun 18, 11:15 AM', type: 'receive' },
  { id: 5, name: 'Airtime Purchase', desc: 'MTN NG', amount: -120000, date: 'Apr 24, 11:45 AM', type: 'airtime' },
  { id: 6, name: 'NEPA Bill', desc: 'Ikeja Electric', amount: -45000, date: 'Apr 22, 2:30 PM', type: 'bills' },
  { id: 7, name: 'John Obi', desc: 'Transfer from 0098765432', amount: 150000, date: 'Apr 20, 8:15 AM', type: 'receive' },
  { id: 8, name: 'Data Bundle', desc: 'Glo NG', amount: -15000, date: 'Apr 19, 6:45 PM', type: 'airtime' },
];

const typeIcon: Record<string, string> = {
  transfer: '↗',
  receive: '↙',
  bills: '⚡',
  airtime: '📱',
};

const Transactions = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? allTransactions
    : allTransactions.filter((t) => t.type.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="transactions-container">
      <header className="transactions-header">
        <h1>Transactions</h1>
        <p>View your transaction history.</p>
      </header>

      <div className="filter-bar">
        {filters.map((f) => (
          <button
            key={f}
            className={`filter-btn${activeFilter === f ? ' active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="transactions-search">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Search transactions..." />
      </div>

      <div className="transactions-list">
        {filtered.map((tx) => (
          <div key={tx.id} className="transaction-row">
            <div className={`tx-badge ${tx.type}`}>
              {tx.type === 'bills' ? (
                <img src={lightningSvg} alt="" width="16" height="16" />
              ) : (
                typeIcon[tx.type] || '💳'
              )}
            </div>
            <div className="tx-row-info">
              <p className="tx-row-name">{tx.name}</p>
              <p className="tx-row-desc">{tx.desc}</p>
            </div>
            <div className="tx-row-right">
              <p className={`tx-row-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                {tx.amount > 0 ? '+' : '-'}₦{Math.abs(tx.amount).toLocaleString()}
              </p>
              <p className="tx-row-date">{tx.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;
