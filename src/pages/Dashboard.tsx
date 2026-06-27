import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ApiError } from '../api/errors';
import type { ApiTransaction, DashboardSummaryResponse } from '../api/types';
import { mapLinkedAccount } from '../api/mappers';
import ConnectedAccounts from '../components/accounts/ConnectedAccounts';
import { CATEGORY_COLORS } from '../constants/institutions';
import { useAppSelector } from '../hooks/redux';
import { dashboardService } from '../services/dashboardService';
import { formatNgn, formatSignedNgn, formatTransactionDate } from '../utils/format';
import './Dashboard.css';
import transactionHistorySvg from '../assets/icons/transaction-history.svg';
import accountAnalysisSvg from '../assets/icons/account-analysis.svg';
import accountStatementSvg from '../assets/icons/account-statement.svg';
import quickPayBillsSvg from '../assets/icons/quick-pay-bills.svg';
import scanQrSvg from '../assets/icons/scan-qr.svg';
import lightningSvg from '../assets/icons/lightning.svg';
import phoneSvg from '../assets/icons/phone.svg';

interface SpendingSlice {
  name: string;
  value: number;
  amount: number;
  color: string;
}

function buildSpendingData(breakdown: DashboardSummaryResponse['expenseBreakdown']): SpendingSlice[] {
  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

  if (total <= 0) {
    return [];
  }

  return breakdown.map((item) => ({
    name: item.category,
    amount: item.amount,
    value: Math.round((item.amount / total) * 100),
    color: CATEGORY_COLORS[item.category] ?? '#6b7280',
  }));
}

function buildRecommendation(summary: DashboardSummaryResponse): string | null {
  const wallet = summary.accounts
    .filter((account) => account.accountType === 'wallet' && account.balance > 0)
    .sort((a, b) => b.balance - a.balance)[0];

  if (!wallet) {
    return null;
  }

  return `Use ${wallet.institution} (${formatNgn(wallet.balance)}) for airtime and paying bills — it has available funds and lower applicable charges.`;
}

function transactionIcon(category: string, type: ApiTransaction['type']) {
  if (category === 'Bills') {
    return (
      <div className="tx-icon tx-bills">
        <img src={lightningSvg} alt="" width="16" height="16" />
      </div>
    );
  }

  if (category === 'Food' || category === 'Entertainment') {
    return (
      <div className="tx-icon tx-mobile">
        <img src={phoneSvg} alt="" width="32" height="32" />
      </div>
    );
  }

  return (
    <div className={`tx-icon ${type === 'credit' ? 'tx-receive' : 'tx-transfer'}`}>
      {type === 'credit' ? '↙' : '↗'}
    </div>
  );
}

const Dashboard = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load dashboard data.';
      setError(message);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const accounts = useMemo(
    () => (summary ? summary.accounts.map(mapLinkedAccount) : []),
    [summary],
  );

  const spendingData = useMemo(
    () => (summary ? buildSpendingData(summary.expenseBreakdown) : []),
    [summary],
  );

  const recommendation = useMemo(
    () => (summary ? buildRecommendation(summary) : null),
    [summary],
  );

  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="greeting">Good day, {firstName} 👋</h1>
        <p className="subtitle">Here&apos;s what&apos;s happening to your money today.</p>
        {summary && (
          <p className="dashboard-balance-line">
            Total balance: <strong>{formatNgn(summary.totalBalance)}</strong>
          </p>
        )}
      </header>

      <ConnectedAccounts
        accounts={accounts}
        loading={loading}
        error={error}
        onRetry={loadSummary}
      />

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="quick-actions-grid">
          <Link to="/transactions" className="action-card">
            <div className="action-icon">
              <img src={transactionHistorySvg} alt="" width="24" height="24" />
            </div>
            <p>Transaction History</p>
          </Link>
          <Link to="/analytics" className="action-card">
            <div className="action-icon">
              <img src={accountAnalysisSvg} alt="" width="24" height="24" />
            </div>
            <p>Account Analysis</p>
          </Link>
          <div className="action-card">
            <div className="action-icon">
              <img src={accountStatementSvg} alt="" width="24" height="24" />
            </div>
            <p>Account Statement</p>
          </div>
          <Link to="/pay-bills" className="action-card">
            <div className="action-icon">
              <img src={quickPayBillsSvg} alt="" width="24" height="24" />
            </div>
            <p>Pay Bills</p>
          </Link>
          <div className="action-card">
            <div className="action-icon">
              <img src={scanQrSvg} alt="" width="24" height="24" />
            </div>
            <p>Scan QR code</p>
          </div>
          <div className="action-card">
            <div className="action-icon">⋯</div>
            <p>More</p>
          </div>
        </div>
      </section>

      <div className="dashboard-main-grid">
        <section className="dashboard-section transactions-section">
          <div className="section-header">
            <h2>Recent Transaction</h2>
            <Link to="/transactions" className="view-all">
              View all
            </Link>
          </div>

          <div className="transactions-card">
            {loading && <p className="dashboard-status">Loading transactions…</p>}

            {!loading && error && (
              <div className="dashboard-error">
                <p>{error}</p>
                <button type="button" className="dashboard-retry-btn" onClick={loadSummary}>
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && summary?.recentTransactions.length === 0 && (
              <p className="dashboard-status">No recent transactions yet.</p>
            )}

            {!loading &&
              !error &&
              summary?.recentTransactions.map((tx) => (
                <div key={tx.id} className="transaction-item">
                  {transactionIcon(tx.category, tx.type)}
                  <div className="tx-details">
                    <p className="tx-name">{tx.description}</p>
                    <p className="tx-desc">
                      {tx.institution} · {tx.category}
                    </p>
                  </div>
                  <div className="tx-amount-time">
                    <p
                      className={`tx-amount ${tx.type === 'credit' ? 'tx-positive' : 'tx-negative'}`}
                    >
                      {formatSignedNgn(tx.amount, tx.type)}
                    </p>
                    <p className="tx-time">{formatTransactionDate(tx.date)}</p>
                  </div>
                </div>
              ))}
          </div>
        </section>

        <div className="dashboard-right-col">
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Spending Overview</h2>
              <span className="date-dropdown">Last 30 days</span>
            </div>
            <div className="spending-card">
              {loading && <p className="dashboard-status">Loading spending data…</p>}

              {!loading && spendingData.length === 0 && (
                <p className="dashboard-status">No spending data for this period.</p>
              )}

              {!loading && spendingData.length > 0 && (
                <div className="chart-container">
                  <div className="chart-area">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={spendingData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={55}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="none"
                        >
                          {spendingData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-legend">
                    {spendingData.map((item) => (
                      <div key={item.name} className="legend-item">
                        <div className="legend-color-label">
                          <span className="color-dot" style={{ backgroundColor: item.color }} />
                          <span className="legend-name">{item.name}</span>
                        </div>
                        <span className="legend-value">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {recommendation && (
            <section className="dashboard-section recommendation-section">
              <div className="recommendation-card">
                <h3>Recommendation</h3>
                <p>{recommendation}</p>
                <button type="button" className="got-it-btn">
                  Got it
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;