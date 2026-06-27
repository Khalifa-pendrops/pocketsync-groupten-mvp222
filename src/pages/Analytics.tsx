import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './Analytics.css';
import { dashboardService } from '../services';
import type { MonthlyData, CategoryBreakdown } from '../types';

const Analytics = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);

  useEffect(() => {
    dashboardService.getMonthlyData().then((data) => {
      setMonthlyData(data);
      setMonthlyLoading(false);
    });
    dashboardService.getCategoryBreakdown().then((data) => {
      setCategoryData(data);
      setCategoryLoading(false);
    });
  }, []);

  const totalIncome = monthlyData.reduce((s, m) => s + m.income, 0);
  const totalExpenses = monthlyData.reduce((s, m) => s + m.expenses, 0);
  const savings = totalIncome - totalExpenses;
  const avgDaily = monthlyData.length > 0 ? Math.round(totalExpenses / monthlyData.length / 30) : 0;

  return (
    <div className="analytics-container">
      <header className="analytics-header">
        <h1>Analytics</h1>
        <p>Deep dive into your spending habits.</p>
      </header>

      <div className="analytics-summary-grid">
        <div className="summary-card">
          <p className="summary-label">Total Income</p>
          <p className="summary-value">₦{totalIncome.toLocaleString()}</p>
          <p className="summary-change positive">↑ 12.5% from last month</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Total Expenses</p>
          <p className="summary-value">₦{totalExpenses.toLocaleString()}</p>
          <p className="summary-change negative">↓ 3.2% from last month</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Savings</p>
          <p className="summary-value">₦{savings.toLocaleString()}</p>
          <p className="summary-change positive">↑ 8.7% from last month</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Avg. Daily Spend</p>
          <p className="summary-value">₦{avgDaily.toLocaleString()}</p>
          <p className="summary-change negative">↓ 1.1% from last month</p>
        </div>
      </div>

      <div className="analytics-chart-section">
        <h2>Income vs Expenses</h2>
        {monthlyLoading ? (
          <p className="state-message loading">Loading chart data...</p>
        ) : (
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
        )}
      </div>

      <div className="analytics-breakdown">
        <h2>Spending Breakdown</h2>
        {categoryLoading ? (
          <p className="state-message loading">Loading breakdown...</p>
        ) : categoryData.length === 0 ? (
          <p className="state-message empty">No spending data available</p>
        ) : (
          <div className="category-list">
            {categoryData.map((cat) => (
              <div key={cat.name} className="category-item">
                <span className="category-dot" style={{ backgroundColor: cat.color }} aria-hidden="true" />
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
        )}
      </div>
    </div>
  );
};

export default Analytics;
