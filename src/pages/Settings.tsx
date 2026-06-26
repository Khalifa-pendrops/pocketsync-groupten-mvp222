import { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>Settings</h1>
        <p>Manage your preferences and profile.</p>
      </header>

      <div className="settings-section">
        <div className="settings-section-header">
          <h2>Profile</h2>
        </div>
        <div className="settings-section-body">
          <div className="settings-row">
            <div className="settings-row-icon">👤</div>
            <div className="settings-row-info">
              <p className="settings-row-label">Personal Information</p>
              <p className="settings-row-desc">Name, email, phone number</p>
            </div>
            <div className="settings-row-action">
              <span className="settings-chevron">›</span>
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-icon">🔒</div>
            <div className="settings-row-info">
              <p className="settings-row-label">Change Password</p>
              <p className="settings-row-desc">Update your account password</p>
            </div>
            <div className="settings-row-action">
              <span className="settings-chevron">›</span>
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-icon">🏦</div>
            <div className="settings-row-info">
              <p className="settings-row-label">Bank Accounts</p>
              <p className="settings-row-desc">Manage linked accounts</p>
            </div>
            <div className="settings-row-action">
              <span className="settings-chevron">›</span>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <h2>Preferences</h2>
        </div>
        <div className="settings-section-body">
          <div className="settings-row">
            <div className="settings-row-icon">🌙</div>
            <div className="settings-row-info">
              <p className="settings-row-label">Dark Mode</p>
              <p className="settings-row-desc">Coming soon</p>
            </div>
            <div className="settings-row-action">
              <span className="settings-value">Auto</span>
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-icon">💰</div>
            <div className="settings-row-info">
              <p className="settings-row-label">Currency</p>
              <p className="settings-row-desc">Display currency preference</p>
            </div>
            <div className="settings-row-action">
              <span className="settings-value">NGN (₦)</span>
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-icon">🔔</div>
            <div className="settings-row-info">
              <p className="settings-row-label">Push Notifications</p>
              <p className="settings-row-desc">Receive transaction alerts</p>
            </div>
            <div className="settings-row-action">
              <button
                className={`settings-toggle${notifications ? ' active' : ''}`}
                onClick={() => setNotifications(!notifications)}
                aria-label="Toggle notifications"
              />
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-icon">📱</div>
            <div className="settings-row-info">
              <p className="settings-row-label">Biometric Login</p>
              <p className="settings-row-desc">Use fingerprint or face ID</p>
            </div>
            <div className="settings-row-action">
              <button
                className={`settings-toggle${biometrics ? ' active' : ''}`}
                onClick={() => setBiometrics(!biometrics)}
                aria-label="Toggle biometric login"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <h2>Support</h2>
        </div>
        <div className="settings-section-body">
          <div className="settings-row">
            <div className="settings-row-icon">❓</div>
            <div className="settings-row-info">
              <p className="settings-row-label">Help Center</p>
              <p className="settings-row-desc">FAQs and support articles</p>
            </div>
            <div className="settings-row-action">
              <span className="settings-chevron">›</span>
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-icon">📝</div>
            <div className="settings-row-info">
              <p className="settings-row-label">Privacy Policy</p>
              <p className="settings-row-desc">How we handle your data</p>
            </div>
            <div className="settings-row-action">
              <span className="settings-chevron">›</span>
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-icon">ℹ️</div>
            <div className="settings-row-info">
              <p className="settings-row-label">About</p>
              <p className="settings-row-desc">Version 1.0.0</p>
            </div>
            <div className="settings-row-action">
              <span className="settings-chevron">›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
