import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import ConnectedAccounts from '../components/accounts/ConnectedAccounts';
import SecurityConsentModal from '../components/modals/SecurityConsentModal';
import './Dashboard.css';
import transactionHistorySvg from '../assets/icons/transaction-history.svg';
import accountAnalysisSvg from '../assets/icons/account-analysis.svg';
import accountStatementSvg from '../assets/icons/account-statement.svg';
import quickPayBillsSvg from '../assets/icons/quick-pay-bills.svg';
import scanQrSvg from '../assets/icons/scan-qr.svg';
import lightningSvg from '../assets/icons/lightning.svg';
import { transactionService, dashboardService } from '../services';
import type { Transaction, SpendingCategory } from '../types';

const Dashboard = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [spendingData, setSpendingData] = useState<SpendingCategory[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [spendingLoading, setSpendingLoading] = useState(true);

  useEffect(() => {
    transactionService.getAll().then((data) => {
      setRecentTx(data.slice(0, 5));
      setTxLoading(false);
    });
    dashboardService.getSpendingData().then((data) => {
      setSpendingData(data);
      setSpendingLoading(false);
    });
  }, []);

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'bills':
        return <img src={lightningSvg} alt="" width="16" height="16" />;
      case 'transfer':
        return '↗';
      case 'receive':
        return '↙';
      default:
        return '💳';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="greeting">Good day, English 👋</h1>
        <p className="subtitle">Here's what's happening to your money today.</p>
      </header>

      <ConnectedAccounts onAddAccount={() => setShowConsent(true)} />

      {/* Quick Actions */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="quick-actions-grid">
          <div className="action-card">
            <div className="action-icon">
              <img src={transactionHistorySvg} alt="" width="24" height="24" />
            </div>
            <p>Transaction History</p>
          </div>
          <div className="action-card">
            <div className="action-icon">
              <img src={accountAnalysisSvg} alt="" width="24" height="24" />
            </div>
            <p>Account Analysis</p>
          </div>
          <div className="action-card">
            <div className="action-icon">
              <img src={accountStatementSvg} alt="" width="24" height="24" />
            </div>
            <p>Account Statement</p>
          </div>
          <div className="action-card">
            <div className="action-icon">
              <img src={quickPayBillsSvg} alt="" width="24" height="24" />
            </div>
            <p>Pay Bills</p>
          </div>
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

      {/* Main Grid for Transactions and Overview */}
      <div className="dashboard-main-grid">
        {/* Recent Transactions */}
        <section className="dashboard-section transactions-section">
          <div className="section-header">
            <h2>Recent Transaction</h2>
            <a href="#" className="view-all">View all</a>
          </div>
          <div className="transactions-card">
            {txLoading ? (
              <p className="state-message loading">Loading transactions...</p>
            ) : recentTx.length === 0 ? (
              <p className="state-message empty">No recent transactions</p>
            ) : recentTx.map((tx) => {
              const amount = typeof tx.amount === 'number' ? tx.amount : 0;
              return (
                <div key={tx.id} className="transaction-item">
                  <div className={`tx-icon tx-${tx.type}`}>
                    {getTxIcon(tx.type)}
                  </div>
                  <div className="tx-details">
                    <p className="tx-name">{tx.name}</p>
                    <p className="tx-desc">{tx.desc}</p>
                  </div>
                  <div className="tx-amount-time">
                    <p className={`tx-amount ${amount > 0 ? 'tx-positive' : 'tx-negative'}`}>
                      {amount > 0 ? '+' : '-'}₦{Math.abs(amount).toLocaleString()}
                    </p>
                    <p className="tx-time">{tx.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Spending Overview & Recommendations */}
        <div className="dashboard-right-col">
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Spending Overview</h2>
              <select className="date-dropdown" aria-label="Select month">
                <option value="">This Month</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
            <div className="spending-card">
              {spendingLoading ? (
                <p className="state-message loading">Loading spending data...</p>
              ) : spendingData.length === 0 ? (
                <p className="state-message empty">No spending data available</p>
              ) : (
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
                          {spendingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-legend">
                    {spendingData.map((item, index) => (
                      <div key={index} className="legend-item">
                        <div className="legend-color-label">
                          <span className="color-dot" style={{ backgroundColor: item.color }}></span>
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

          <section className="dashboard-section recommendation-section">
            <div className="recommendation-card">
              <h3>Recommendation</h3>
              <p>
                Use Opay (₦100,000.00) for airtime and paying bills because it has sufficient funds and lower applicable charges
              </p>
              <button className="got-it-btn">Got it</button>
            </div>
          </section>
        </div>
      </div>

      <SecurityConsentModal
        isOpen={showConsent}
        onClose={() => setShowConsent(false)}
        onProceed={() => setShowConsent(false)}
      />
    </div>
  );
};

export default Dashboard;
