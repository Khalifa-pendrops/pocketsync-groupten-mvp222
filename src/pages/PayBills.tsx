import './PayBills.css';

const categories = [
  { name: 'Electricity', icon: '💡', count: 2 },
  { name: 'Internet', icon: '🌐', count: 1 },
  { name: 'Airtime', icon: '📱', count: 3 },
  { name: 'TV Subscription', icon: '📺', count: 1 },
];

const bills = [
  { name: 'EEDC Enugu', category: 'Electricity', amount: 75000, due: 'Jun 30, 2026', overdue: false },
  { name: 'Ikeja Electric', category: 'Electricity', amount: 45000, due: 'Jun 25, 2026', overdue: true },
  { name: 'MTN Data Plan', category: 'Airtime', amount: 15000, due: 'Jul 5, 2026', overdue: false },
  { name: 'GOtv Subscription', category: 'TV Subscription', amount: 8500, due: 'Jul 10, 2026', overdue: false },
];

const PayBills = () => {
  return (
    <div className="pay-bills-container">
      <header className="pay-bills-header">
        <h1>Pay Bills</h1>
        <p>Settle your bills directly from PocketSync.</p>
      </header>

      <div className="bills-balance-card">
        <p className="bills-balance-label">Wallet Balance</p>
        <p className="bills-balance-amount">₦245,000.00</p>
        <p className="bills-balance-sub">Sufficient for all upcoming bills</p>
      </div>

      <div className="bills-category-grid">
        {categories.map((cat) => (
          <div key={cat.name} className="bill-category-card">
            <div className="bill-cat-icon">{cat.icon}</div>
            <p className="bill-cat-name">{cat.name}</p>
            <p className="bill-cat-count">{cat.count} bill{cat.count > 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>

      <section className="upcoming-bills">
        <h2>Upcoming Bills</h2>
        {bills.map((bill, i) => (
          <div key={i} className="bill-item">
            <div className="bill-icon">
              {bill.category === 'Electricity' ? '💡' : bill.category === 'Airtime' ? '📱' : '📺'}
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
