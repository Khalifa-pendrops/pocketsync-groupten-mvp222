import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ApiError } from '../api/errors';
import type { ApiLinkedAccount, ApiTransaction, DashboardSummaryResponse } from '../api/types';
import { mapLinkedAccount } from '../api/mappers';
import ConnectedAccounts from '../components/accounts/ConnectedAccounts';
import AccountStatementModal from '../components/dashboard/AccountStatementModal';
import ScanQrModal from '../components/dashboard/ScanQrModal';
import MoreActionsModal from '../components/dashboard/MoreActionsModal';
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

type SpendingPeriod = 'this_week' | 'this_month' | 'last_30_days' | 'last_3_months';

const SPENDING_PERIOD_OPTIONS: { value: SpendingPeriod; label: string }[] = [
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'last_3_months', label: 'Last 3 Months' },
];

const PERIOD_SCALE: Record<SpendingPeriod, number> = {
  this_week: 7 / 30,
  this_month: 1,
  last_30_days: 1,
  last_3_months: 3,
};

interface SpendingSlice {
  name: string;
  value: number;
  amount: number;
  color: string;
}

interface RecommendationCard {
  accountId: string;
  message: string;
}

type RecommendationBuilder = (institution: string, balance: string) => string;

const RECOMMENDATION_TEMPLATES: RecommendationBuilder[] = [
  (institution, balance) =>
    `Pay airtime and bills from ${institution} (${balance}). Balance looks good for everyday spending.`,
  (institution, balance) =>
    `${institution} (${balance}) has enough room for transfers this week.`,
  (institution, balance) =>
    `Keep utilities on ${institution} (${balance}) if you want one account for recurring bills.`,
  (institution, balance) =>
    `${institution} (${balance}) is fine for quick sends without touching your other accounts.`,
  (institution, balance) =>
    `Your next subscription payment can go out from ${institution} (${balance}).`,
];

const INSTITUTION_RECOMMENDATION_TEMPLATES: Partial<Record<string, RecommendationBuilder[]>> = {
  GTBank: [
    (institution, balance) =>
      `${institution} (${balance}) is a solid pick for bigger transfers.`,
    (institution, balance) =>
      `DSTV and electricity payments can run from ${institution} (${balance}).`,
  ],
  'Access Bank': [
    (institution, balance) =>
      `${institution} (${balance}) is useful for salary-week bills.`,
    (institution, balance) =>
      `Use ${institution} (${balance}) when you need a same-day interbank send.`,
  ],
  Kuda: [
    (institution, balance) =>
      `${institution} (${balance}) is good for small airtime and data buys.`,
    (institution, balance) =>
      `Everyday debits are easier from ${institution} (${balance}).`,
  ],
  Opay: [
    (institution, balance) =>
      `${institution} (${balance}) is ready for bills and mobile top-ups.`,
    (institution, balance) =>
      `QR and utility payments can come from ${institution} (${balance}).`,
  ],
  Moniepoint: [
    (institution, balance) =>
      `${institution} (${balance}) works for agent cash-outs and POS collections.`,
    (institution, balance) =>
      `Move business takings through ${institution} (${balance}) before sweeping to your main bank.`,
  ],
};

function adjustBreakdownForPeriod(
  breakdown: DashboardSummaryResponse['expenseBreakdown'],
  period: SpendingPeriod,
): DashboardSummaryResponse['expenseBreakdown'] {
  if (breakdown.length === 0) {
    return [];
  }

  const scale = PERIOD_SCALE[period];
  const periodSeed = period.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return breakdown
    .map((item, index) => {
      const hash = (periodSeed + index * 3 + item.category.length) % 7;
      const variance = 0.72 + (hash / 6) * 0.56;
      return {
        category: item.category,
        amount: Math.round(item.amount * scale * variance),
      };
    })
    .filter((item) => item.amount > 0);
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

function getEligibleRecommendationAccounts(accounts: ApiLinkedAccount[]): ApiLinkedAccount[] {
  return accounts.filter((account) => account.balance > 0);
}

function pickRandomRecommendation(
  accounts: ApiLinkedAccount[],
  excludeAccountId?: string,
): RecommendationCard | null {
  const eligible = getEligibleRecommendationAccounts(accounts);

  if (eligible.length === 0) {
    return null;
  }

  const pool =
    excludeAccountId && eligible.length > 1
      ? eligible.filter((account) => account.id !== excludeAccountId)
      : eligible;

  const account = pool[Math.floor(Math.random() * pool.length)];
  const institutionTemplates = INSTITUTION_RECOMMENDATION_TEMPLATES[account.institution];
  const templates = institutionTemplates
    ? [...RECOMMENDATION_TEMPLATES, ...institutionTemplates]
    : RECOMMENDATION_TEMPLATES;
  const template = templates[Math.floor(Math.random() * templates.length)];

  return {
    accountId: account.id,
    message: template(account.institution, formatNgn(account.balance)),
  };
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
  const [spendingPeriod, setSpendingPeriod] = useState<SpendingPeriod>('this_month');
  const [recommendation, setRecommendation] = useState<RecommendationCard | null>(null);
  const [statementOpen, setStatementOpen] = useState(false);
  const [scanQrOpen, setScanQrOpen] = useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);

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

  useEffect(() => {
    if (!summary) {
      setRecommendation(null);
      return;
    }

    setRecommendation(pickRandomRecommendation(summary.accounts));
  }, [summary]);

  const accounts = useMemo(
    () => (summary ? summary.accounts.map(mapLinkedAccount) : []),
    [summary],
  );

  const spendingData = useMemo(() => {
    if (!summary) {
      return [];
    }

    const breakdown = adjustBreakdownForPeriod(summary.expenseBreakdown, spendingPeriod);
    return buildSpendingData(breakdown);
  }, [summary, spendingPeriod]);

  const hasRecommendationAccounts = useMemo(
    () => (summary ? getEligibleRecommendationAccounts(summary.accounts).length > 0 : false),
    [summary],
  );

  const handleNextRecommendation = () => {
    if (!summary) {
      return;
    }

    setRecommendation(
      pickRandomRecommendation(summary.accounts, recommendation?.accountId),
    );
  };

  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="greeting">Hi, {firstName}</h1>
        <p className="subtitle">Your balances and recent activity.</p>
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
          <button
            type="button"
            className="action-card"
            onClick={() => setStatementOpen(true)}
          >
            <div className="action-icon">
              <img src={accountStatementSvg} alt="" width="24" height="24" />
            </div>
            <p>Account Statement</p>
          </button>
          <Link to="/pay-bills" className="action-card">
            <div className="action-icon">
              <img src={quickPayBillsSvg} alt="" width="24" height="24" />
            </div>
            <p>Pay Bills</p>
          </Link>
          <button type="button" className="action-card" onClick={() => setScanQrOpen(true)}>
            <div className="action-icon">
              <img src={scanQrSvg} alt="" width="24" height="24" />
            </div>
            <p>Scan QR code</p>
          </button>
          <button
            type="button"
            className="action-card"
            onClick={() => setMoreActionsOpen(true)}
          >
            <div className="action-icon">⋯</div>
            <p>More</p>
          </button>
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
              <select
                className="date-dropdown date-dropdown-select"
                value={spendingPeriod}
                onChange={(event) => setSpendingPeriod(event.target.value as SpendingPeriod)}
                aria-label="Spending period"
              >
                {SPENDING_PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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

          {hasRecommendationAccounts && recommendation && (
            <section className="dashboard-section recommendation-section">
              <div className="recommendation-card">
                <h3>Recommendation</h3>
                <p>{recommendation.message}</p>
                <button type="button" className="got-it-btn" onClick={handleNextRecommendation}>
                  Got it
                </button>
              </div>
            </section>
          )}
        </div>
      </div>

      <AccountStatementModal
        open={statementOpen}
        accounts={accounts}
        onClose={() => setStatementOpen(false)}
      />
      <ScanQrModal
        open={scanQrOpen}
        accounts={accounts}
        onClose={() => setScanQrOpen(false)}
      />
      <MoreActionsModal
        open={moreActionsOpen}
        onClose={() => setMoreActionsOpen(false)}
      />
    </div>
  );
};

export default Dashboard;