import { useState, useEffect } from 'react';
import './PayBills.css';
import lightningSvg from '../assets/icons/lightning.svg';
import { budgetService } from '../services';
import type { BillCategory, Bill } from '../types';

const PayBills = () => {
  const [categories, setCategories] = useState<BillCategory[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [billsLoading, setBillsLoading] = useState(true);

  useEffect(() => {
    budgetService.getCategories().then((data) => {
      setCategories(data);
      setCatLoading(false);
    });
    budgetService.getBills().then((data) => {
      setBills(data);
      setBillsLoading(false);
    });
  }, []);

  const totalDue = bills.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="pay-bills-container">
      <header className="pay-bills-header">
        <h1>Pay Bills</h1>
        <p>Settle your bills directly from PocketSync.</p>
      </header>

      <div className="bills-balance-card">
        <p className="bills-balance-label">Wallet Balance</p>
        <p className="bills-balance-amount">₦{totalDue.toLocaleString()}.00</p>
        <p className="bills-balance-sub">Sufficient for all upcoming bills</p>
      </div>

      <div className="bills-category-grid">
        {catLoading ? (
          <p className="state-message loading" style={{ gridColumn: '1 / -1' }}>Loading categories...</p>
        ) : categories.map((cat) => (
          <div key={cat.name} className="bill-category-card">
            <div className="bill-cat-icon">
              {cat.name === 'Electricity' ? (
                <img src={lightningSvg} alt="" width="24" height="24" />
              ) : (
                cat.icon
              )}
            </div>
            <p className="bill-cat-name">{cat.name}</p>
            <p className="bill-cat-count">{cat.count} bill{cat.count > 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>

      <section className="upcoming-bills">
        <h2>Upcoming Bills</h2>
        {billsLoading ? (
          <p className="state-message loading">Loading bills...</p>
        ) : bills.length === 0 ? (
          <p className="state-message empty">No upcoming bills</p>
        ) : bills.map((bill, i) => (
          <div key={i} className="bill-item">
            <div className="bill-icon">
              {bill.category === 'Electricity' ? (
                <img src={lightningSvg} alt="" width="20" height="20" />
              ) : bill.category === 'Airtime' ? (
                '📱'
              ) : (
                '📺'
              )}
            </div>
            <div className="bill-info">
              <p className="bill-name">{bill.name}</p>
              <p className={`bill-due${bill.overdue ? ' overdue' : ''}`}>
                {bill.overdue ? '⚠ Overdue — ' : 'Due '}{bill.due}
              </p>
            </div>
            <div className="bill-right">
              <p className="bill-amount">₦{bill.amount.toLocaleString()}</p>
              <button className="pay-now-btn">Pay Now</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default PayBills;
