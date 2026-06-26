import './LinkAccounts.css';

const institutions = [
  { name: 'GTBank', type: 'Commercial Bank', logo: '🏦' },
  { name: 'Access Bank', type: 'Commercial Bank', logo: '🏛️' },
  { name: 'First Bank', type: 'Commercial Bank', logo: '🏗️' },
  { name: 'Zenith Bank', type: 'Commercial Bank', logo: '🏰' },
  { name: 'UBA', type: 'Commercial Bank', logo: '🌍' },
  { name: 'Opay', type: 'Fintech', logo: '📱' },
  { name: 'Paga', type: 'Fintech', logo: '💳' },
  { name: 'PalmPay', type: 'Fintech', logo: '🖐️' },
];

const connectedAccounts = [
  { name: 'GTBank', account: '**** 4567', logo: '🏦' },
  { name: 'Opay', account: '**** 8901', logo: '📱' },
];

const LinkAccounts = () => {
  return (
    <div className="link-accounts-container">
      <header className="link-accounts-header">
        <h1>Link Accounts</h1>
        <p>Link your bank accounts securely.</p>
      </header>

      <div className="institution-grid">
        {institutions.map((inst) => (
          <div key={inst.name} className="institution-card">
            <div className="institution-logo">{inst.logo}</div>
            <p className="institution-name">{inst.name}</p>
            <p className="institution-type">{inst.type}</p>
          </div>
        ))}
      </div>

      <section className="connected-section">
        <h2>Connected Accounts</h2>
        {connectedAccounts.map((acc) => (
          <div key={acc.name} className="connected-account">
            <div className="connected-logo">{acc.logo}</div>
            <div className="connected-info">
              <p className="connected-label">{acc.name}</p>
              <p className="connected-status">
                <span className="status-dot" /> Connected — {acc.account}
              </p>
            </div>
            <button className="connected-action">Disconnect</button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default LinkAccounts;
