import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ApiError } from '../api/errors';
import {
  buildCategoryBreakdown,
  buildMonthlyIncomeExpenses,
  buildSummaryCards,
} from '../lib/analytics';
import { dashboardService } from '../services/dashboardService';
import { transactionService } from '../services/transactionService';
import type { CategoryBreakdown, MonthlyData, TransactionRow } from '../types';
import { formatNgn } from '../utils/format';
import './Analytics.css';

const MAX_TRANSACTION_PAGES = 5;

async function fetchTransactionsForAnalytics(): Promise<TransactionRow[]> {
  const collected: TransactionRow[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= MAX_TRANSACTION_PAGES) {
    const result = await transactionService.getPage({ page, limit: 30 });
    collected.push(...result.transactions);
    totalPages = result.pages;
    page += 1;
  }

  return collected;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="analytics-tooltip">
      <p className="analytics-tooltip-label">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.dataKey === 'income' ? 'Income' : 'Expenses'}: {formatNgn(entry.value)}
        </p>
      ))}
    </div>
  );
}

const Analytics = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([]);
  const [cards, setCards] = useState<ReturnType<typeof buildSummaryCards> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [summary, balanceTrend, transactions] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getBalanceTrend(),
        fetchTransactionsForAnalytics(),
      ]);

      const monthly = buildMonthlyIncomeExpenses(transactions, balanceTrend.labels);
      setMonthlyData(monthly);
      setCategoryData(buildCategoryBreakdown(summary.expenseBreakdown));
      setCards(buildSummaryCards(summary, monthly));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load analytics.';
      setError(message);
      setMonthlyData([]);
      setCategoryData([]);
      setCards(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const hasMonthlyData = useMemo(
    () => monthlyData.some((month) => month.income > 0 || month.expenses > 0),
    [monthlyData],
  );

  return (
    <div className="analytics-container">
      <header className="analytics-header">
        <h1>Analytics</h1>
        <p>Deep dive into your spending habits.</p>
        <p className="analytics-period">Based on your last 30 days of activity</p>
      </header>

      {loading && <p className="analytics-status">Loading analytics…</p>}

      {error && (
        <div className="analytics-error">
          <p>{error}</p>
          <button type="button" className="analytics-retry-btn" onClick={loadAnalytics}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && cards && (
        <div className="analytics-summary-grid">
          <div className="summary-card">
            <p className="summary-label">Total Income</p>
            <p className="summary-value">{formatNgn(cards.totalIncome)}</p>
            {cards.incomeChange && (
              <p className="summary-change positive">{cards.incomeChange}</p>
            )}
          </div>
          <div className="summary-card">
            <p className="summary-label">Total Expenses</p>
            <p className="summary-value">{formatNgn(cards.totalExpenses)}</p>
            {cards.expenseChange && (
              <p className="summary-change negative">{cards.expenseChange}</p>
            )}
          </div>
          <div className="summary-card">
            <p className="summary-label">Net Cash Flow</p>
            <p className="summary-value">{formatNgn(cards.netCashFlow)}</p>
            {cards.savingsChange && (
              <p
                className={`summary-change ${cards.netCashFlow >= 0 ? 'positive' : 'negative'}`}
              >
                {cards.savingsChange}
              </p>
            )}
          </div>
          <div className="summary-card">
            <p className="summary-label">Avg. Daily Spend</p>
            <p className="summary-value">{formatNgn(cards.avgDailySpend)}</p>
            {cards.spendChange && (
              <p className="summary-change negative">{cards.spendChange}</p>
            )}
          </div>
        </div>
      )}

      <div className="analytics-chart-section">
        <h2>Income vs Expenses</h2>
        {loading && <p className="analytics-status">Loading chart…</p>}
        {!loading && !hasMonthlyData && (
          <p className="analytics-status">Not enough transaction data for this chart yet.</p>
        )}
        {!loading && hasMonthlyData && (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₦${Number(value).toLocaleString()}`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="income" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expenses" fill="#9333ea" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="analytics-breakdown">
        <h2>Spending Breakdown</h2>
        {loading && <p className="analytics-status">Loading breakdown…</p>}
        {!loading && categoryData.length === 0 && (
          <p className="analytics-status">No expense categories to show yet.</p>
        )}
        <div className="category-list">
          {categoryData.map((cat) => (
            <div key={cat.name} className="category-item">
              <span className="category-dot" style={{ backgroundColor: cat.color }} />
              <div className="category-info">
                <p className="category-name">{cat.name}</p>
                <div className="category-bar-track">
                  <div
                    className="category-bar-fill"
                    style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
              <div className="category-amount">
                <p className="amount">{formatNgn(cat.amount)}</p>
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