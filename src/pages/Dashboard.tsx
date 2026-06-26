import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import ConnectedAccounts from '../components/accounts/ConnectedAccounts';
import './Dashboard.css';

const spendingData = [
  { name: 'Transfer', value: 65, color: '#ef4444' },
  { name: 'Bills', value: 45, color: '#9333ea' },
  { name: 'Receive', value: 20, color: '#10b981' },
  { name: 'Others', value: 9, color: '#6b7280' },
];

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="greeting">Good day, English 👋</h1>
        <p className="subtitle">Here's what's happening to your money today.</p>
      </header>

      <ConnectedAccounts />

      {/* Quick Actions */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="quick-actions-grid">
          <div className="action-card">
            <div className="action-icon">🧾</div>
            <p>Transaction History</p>
          </div>
          <div className="action-card">
            <div className="action-icon">📊</div>
            <p>Account Analysis</p>
          </div>
          <div className="action-card">
            <div className="action-icon">📥</div>
            <p>Account Statement</p>
          </div>
          <div className="action-card">
            <div className="action-icon">✈️</div>
            <p>Pay Bills</p>
          </div>
          <div className="action-card">
            <div className="action-icon">📱</div>
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
            <div className="transaction-item">
              <div className="tx-icon tx-transfer">↗</div>
              <div className="tx-details">
                <p className="tx-name">Chiamaka Opal</p>
                <p className="tx-desc">Transfer to 0024561190</p>
              </div>
              <div className="tx-amount-time">
                <p className="tx-amount tx-negative">-₦150,000.00</p>
                <p className="tx-time">Today, 9:41 AM</p>
              </div>
            </div>
            
            <div className="transaction-item">
              <div className="tx-icon tx-bills">⚡</div>
              <div className="tx-details">
                <p className="tx-name">Electricity Bill</p>
                <p className="tx-desc">EEDC Enugu</p>
              </div>
              <div className="tx-amount-time">
                <p className="tx-amount tx-negative">-₦75,000.00</p>
                <p className="tx-time">Yesterday, 10:05 AM</p>
              </div>
            </div>

            <div className="transaction-item">
              <div className="tx-icon tx-transfer">↗</div>
              <div className="tx-details">
                <p className="tx-name">Adaeze Okeke</p>
                <p className="tx-desc">Transfer to 0034567890</p>
              </div>
              <div className="tx-amount-time">
                <p className="tx-amount tx-negative">-₦200,000.00</p>
                <p className="tx-time">Jun 20, 10:30 AM</p>
              </div>
            </div>

            <div className="transaction-item">
              <div className="tx-icon tx-receive">↙</div>
              <div className="tx-details">
                <p className="tx-name">Ifeanyi Uche</p>
                <p className="tx-desc">Transfer to 0045678901</p>
              </div>
              <div className="tx-amount-time">
                <p className="tx-amount tx-positive">+₦50,000.00</p>
                <p className="tx-time">Jun 18, 11:15 AM</p>
              </div>
            </div>

            <div className="transaction-item">
              <div className="tx-icon tx-mobile">📱</div>
              <div className="tx-details">
                <p className="tx-name">Airtime Purchase</p>
                <p className="tx-desc">MTN NG</p>
              </div>
              <div className="tx-amount-time">
                <p className="tx-amount tx-negative">-₦120,000.00</p>
                <p className="tx-time">Apr 24, 11:45 AM</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Spending Overview & Recommendations */}
        <div className="dashboard-right-col">
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Spending Overview</h2>
              <select className="date-dropdown">
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
    </div>
  );
};

export default Dashboard;
