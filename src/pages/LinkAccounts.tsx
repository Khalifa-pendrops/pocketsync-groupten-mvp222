import { useCallback, useEffect, useMemo, useState } from 'react';
import { hasSearchTerm, matchesAnySearchTerm } from '../utils/search';
import { ApiError } from '../api/errors';
import {
  INSTITUTION_META,
  type InstitutionCategory,
  type InstitutionMeta,
} from '../constants/institutions';
import { enrichInstitution } from '../lib/institutions';
import { accountService } from '../services/accountService';
import { institutionService } from '../services/institutionService';
import type { BankAccount } from '../types';
import { formatAccountType, formatNgn } from '../utils/format';
import './LinkAccounts.css';
import shieldCheckSvg from '../assets/icons/shield-check.svg';
import buildingSvg from '../assets/icons/building.svg';
import linkSvg from '../assets/icons/link.svg';
import shieldLockSvg from '../assets/icons/shield-lock.svg';
import checkCircleSvg from '../assets/icons/check-circle.svg';
import lockSvg from '../assets/icons/lock.svg';

type Tab = 'All' | InstitutionCategory;
const TABS: Tab[] = ['All', 'Banks', 'Fintechs', 'Microfinance Banks'];

interface BankLogoProps {
  meta: InstitutionMeta;
  name: string;
  size?: number;
}

function BankLogo({ meta, name, size = 48 }: BankLogoProps) {
  return meta.logo ? (
    <img
      src={meta.logo}
      alt={name}
      width={size}
      height={size}
      style={{ objectFit: 'contain', borderRadius: 8 }}
    />
  ) : (
    <div
      className="bank-logo-fallback"
      style={{ width: size, height: size, backgroundColor: meta.color }}
    >
      {meta.initial}
    </div>
  );
}

const LinkAccounts = () => {
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [search, setSearch] = useState('');
  const [institutions, setInstitutions] = useState<ReturnType<typeof enrichInstitution>[]>([]);
  const [linkedAccounts, setLinkedAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [linkingInstitution, setLinkingInstitution] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [apiInstitutions, accounts] = await Promise.all([
        institutionService.getAll(),
        accountService.getAll(),
      ]);

      setInstitutions(apiInstitutions.map(enrichInstitution));
      setLinkedAccounts(accounts);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load accounts.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const linkedByInstitution = useMemo(() => {
    const map = new Map<string, BankAccount>();
    linkedAccounts.forEach((account) => map.set(account.bankName, account));
    return map;
  }, [linkedAccounts]);

  const filteredInstitutions = useMemo(() => {
    return institutions.filter((institution) => {
      const matchesTab = activeTab === 'All' || institution.category === activeTab;
      const matchesSearch = matchesAnySearchTerm(
        search,
        institution.name,
        institution.category,
        institution.meta.initial,
      );

      return matchesTab && matchesSearch;
    });
  }, [institutions, activeTab, search]);

  async function handleLink(institutionName: string) {
    setLinkingInstitution(institutionName);
    setError(null);
    setMessage(null);

    try {
      await accountService.link(institutionName);
      setMessage(`${institutionName} linked successfully.`);
      await loadData();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to link account.';
      setError(msg);
    } finally {
      setLinkingInstitution(null);
    }
  }

  async function handleDisconnect(account: BankAccount) {
    const confirmed = window.confirm(`Disconnect ${account.bankName} (${account.maskAccount})?`);
    if (!confirmed) {
      return;
    }

    setDisconnectingId(account.id);
    setError(null);
    setMessage(null);

    try {
      await accountService.disconnect(account.id);
      setMessage(`${account.bankName} disconnected.`);
      await loadData();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to disconnect account.';
      setError(msg);
    } finally {
      setDisconnectingId(null);
    }
  }

  return (
    <div className="la-container">
      <form
        className="la-search"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <span className="la-search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          type="search"
          className="la-search-input"
          placeholder="Search for your bank or fintech"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search for your bank or fintech"
        />
        {hasSearchTerm(search) && (
          <button
            type="button"
            className="la-search-clear"
            onClick={() => setSearch('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </form>

      <div className="la-title-row">
        <div>
          <h1 className="la-title">Connect an Account</h1>
          <p className="la-subtitle">
            Connect your bank or fintech account to get started with PocketSync.
          </p>
        </div>
        <div className="la-secure-badge">
          <span className="la-secure-icon">
            <img src={shieldCheckSvg} alt="" width="24" height="24" />
          </span>
          <div>
            <p className="la-secure-title">Secure Connection</p>
            <p className="la-secure-desc">256-bit SSL encryption</p>
          </div>
        </div>
      </div>

      {message && <div className="la-banner la-banner--success">{message}</div>}
      {error && (
        <div className="la-banner la-banner--error">
          <p>{error}</p>
          <button type="button" className="la-retry-btn" onClick={loadData}>
            Try again
          </button>
        </div>
      )}

      {linkedAccounts.length > 0 && (
        <section className="la-section">
          <h2 className="la-section-title">Your connected accounts</h2>
          <div className="la-connected-list">
            {linkedAccounts.map((account) => {
              const meta = INSTITUTION_META[account.bankName] ?? {
                color: '#6b7280',
                initial: account.bankName.charAt(0),
              };

              return (
                <div key={account.id} className="la-connected-card">
                  <div className="la-card-header">
                    <BankLogo meta={meta} name={account.bankName} size={40} />
                    <div className="la-card-info">
                      <p className="la-card-name">{account.bankName}</p>
                      <p className="la-card-masked">{account.maskAccount}</p>
                    </div>
                  </div>
                  <p className="la-connected-balance">{formatNgn(account.balance)}</p>
                  <p className="la-connected-type">{formatAccountType(account.accountType)}</p>
                  <button
                    type="button"
                    className="la-remove-btn"
                    onClick={() => handleDisconnect(account)}
                    disabled={disconnectingId === account.id}
                  >
                    {disconnectingId === account.id ? 'Removing…' : 'Disconnect'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="la-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`la-tab${activeTab === tab ? ' la-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="la-section">
        <h2 className="la-section-title">Supported institutions</h2>

        {loading && <p className="la-status">Loading institutions…</p>}

        {!loading && filteredInstitutions.length === 0 && (
          <p className="la-status">No institutions match your search.</p>
        )}

        <div className="la-grid">
          {filteredInstitutions.map((institution) => {
            const linked = linkedByInstitution.get(institution.name);
            const isLinking = linkingInstitution === institution.name;

            return (
              <div key={institution.id} className="la-card">
                <div className="la-card-header">
                  <BankLogo meta={institution.meta} name={institution.name} size={48} />
                  <div className="la-card-info">
                    <p className="la-card-name">{institution.name}</p>
                    <p className="la-card-masked">
                      {linked ? linked.maskAccount : institution.category}
                    </p>
                  </div>
                </div>
                {linked ? (
                  <button type="button" className="la-add-btn la-add-btn--linked" disabled>
                    Connected
                  </button>
                ) : (
                  <button
                    type="button"
                    className="la-add-btn"
                    onClick={() => handleLink(institution.name)}
                    disabled={isLinking}
                  >
                    {isLinking ? 'Linking…' : 'Add Account'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="la-manual-bar">
        <div className="la-manual-left">
          <span className="la-manual-icon">
            <img src={buildingSvg} alt="" width="24" height="24" />
          </span>
          <div>
            <p className="la-manual-title">Can&apos;t find your bank?</p>
            <p className="la-manual-desc">
              We currently support GTBank, Access Bank, Kuda, Opay, and Moniepoint.
            </p>
          </div>
        </div>
      </div>

      <section className="la-section la-how-section">
        <h2 className="la-section-title">How it works</h2>
        <div className="la-steps">
          <div className="la-step">
            <div className="la-step-icon">
              <img src={linkSvg} alt="" width="34" height="34" />
            </div>
            <div className="la-step-body">
              <p className="la-step-num">1. Select your bank</p>
              <p className="la-step-desc">Choose your bank or fintech from the list above.</p>
            </div>
          </div>
          <div className="la-step">
            <div className="la-step-icon">
              <img src={shieldLockSvg} alt="" width="24" height="24" />
            </div>
            <div className="la-step-body">
              <p className="la-step-num">2. Secure login</p>
              <p className="la-step-desc">
                You&apos;ll be redirected to your bank to log in.
              </p>
            </div>
          </div>
          <div className="la-step">
            <div className="la-step-icon">
              <img src={checkCircleSvg} alt="" width="24" height="24" />
            </div>
            <div className="la-step-body">
              <p className="la-step-num">3. Connection successful</p>
              <p className="la-step-desc">Your account will be connected and ready to use.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="la-privacy">
        <span className="la-privacy-icon">
          <img src={lockSvg} alt="" width="16" height="16" />
        </span>
        We never store your login details. Your data is encrypted and secure.
      </div>
    </div>
  );
};

export default LinkAccounts;