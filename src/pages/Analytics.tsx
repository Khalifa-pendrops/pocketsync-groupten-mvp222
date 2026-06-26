import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './Analytics.css';

const monthlyData = [
  { name: 'Jan', income: 400, expenses: 240 },
  { name: 'Feb', income: 300, expenses: 220 },
  { name: 'Mar', income: 500, expenses: 310 },
  { name: 'Apr', income: 450, expenses: 280 },
  { name: 'May', income: 470, expenses: 260 },
  { name: 'Jun', income: 520, expenses: 340 },
];

const categoryData = [
  { name: 'Transfer', amount: 425000, percent: 42, color: '#ef4444' },
  { name: 'Bills', amount: 195000, percent: 19, color: '#9333ea' },
  { name: 'Receive', amount: 180000, percent: 18, color: '#10b981' },
  { name: 'Airtime', amount: 120000, percent: 12, color: '#f59e0b' },
  { name: 'Others', amount: 90000, percent: 9, color: '#6b7280' },
];

const Analytics = () => {
  return (
    <div className="analytics-container">
      <header className="analytics-header">
        <h1>Analytics</h1>
        <p>Deep dive into your spending habits.</p>
      </header>

      <div className="analytics-summary-grid">
        <div className="summary-card">
          <p className="summary-label">Total Income</p>
          <p className="summary-value">₦2,640,000</p>
          <p className="summary-change positive">↑ 12.5% from last month</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Total Expenses</p>
          <p className="summary-value">₦1,650,000</p>
          <p className="summary-change negative">↓ 3.2% from last month</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Savings</p>
          <p className="summary-value">₦990,000</p>
          <p className="summary-change positive">↑ 8.7% from last month</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Avg. Daily Spend</p>
          <p className="summary-value">₦13,750</p>
          <p className="summary-change negative">↓ 1.1% from last month</p>
        </div>
      </div>

      <div className="analytics-chart-section">
        <h2>Income vs Expenses</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="income" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="expenses" fill="#9333ea" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analytics-breakdown">
        <h2>Spending Breakdown</h2>
        <div className="category-list">
          {categoryData.map((cat) => (
            <div key={cat.name} className="category-item">
              <span className="category-dot" style={{ backgroundColor: cat.color }} />
              <div className="category-info">
                <p className="category-name">{cat.name}</p>
                <div className="category-bar-track">
                  <div className="category-bar-fill" style={{ width: `${cat.percent}%`, backgroundColor: cat.color }} />
                </div>
              </div>
              <div className="category-amount">
                <p className="amount">₦{cat.amount.toLocaleString()}</p>
                <p className="percent">{cat.percent}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
