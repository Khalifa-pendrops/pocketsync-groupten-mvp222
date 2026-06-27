import { useState, useEffect } from 'react';
import './Transactions.css';
import lightningSvg from '../assets/icons/lightning.svg';
import { transactionService } from '../services';
import type { Transaction } from '../types';

const filters = ['All', 'Income', 'Expense', 'Transfer', 'Bills', 'Airtime'];

const typeIcon: Record<string, string> = {
  transfer: '↗',
  receive: '↙',
  bills: '⚡',
  airtime: '📱',
};

const getTxIcon = (type: string) => {
  if (type === 'bills') return <img src={lightningSvg} alt="" width="16" height="16" />;
  return typeIcon[type] || '💳';
};

const Transactions = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionService.getAll().then((data) => {
      setAllTransactions(data);
      setLoading(false);
    });
  }, []);

  const filtered = activeFilter === 'All'
    ? allTransactions
    : allTransactions.filter((t) => t.type.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="transactions-container">
      <header className="transactions-header">
        <h1>Transactions</h1>
        <p>View your transaction history.</p>
      </header>

      <div className="filter-bar" role="tablist" aria-label="Transaction filters">
        {filters.map((f) => (
          <button
            key={f}
            className={`filter-btn${activeFilter === f ? ' active' : ''}`}
            onClick={() => setActiveFilter(f)}
            role="tab"
            aria-selected={activeFilter === f}
            aria-controls={`panel-${f.toLowerCase()}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="transactions-search">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          placeholder="Search transactions..."
          aria-label="Search transactions"
        />
      </div>

      <div className="transactions-list" role="tabpanel" id={`panel-${activeFilter.toLowerCase()}`} aria-label={`${activeFilter} transactions`}>
        {loading ? (
          <p className="state-message loading">Loading transactions...</p>
        ) : filtered.length === 0 ? (
          <p className="state-message empty">No transactions found</p>
        ) : filtered.map((tx) => (
          <div key={tx.id} className="transaction-row">
            <div className={`tx-badge ${tx.type}`}>
              {getTxIcon(tx.type)}
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
