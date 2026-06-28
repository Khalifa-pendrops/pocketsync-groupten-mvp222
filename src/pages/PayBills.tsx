import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../api/errors';
import { BILL_CATALOG, BILL_CATEGORY_SUMMARY, type BillCatalogItem } from '../constants/bills';
import { accountService } from '../services/accountService';
import { billService } from '../services/billService';
import type { BankAccount } from '../types';
import { formatAccountType, formatNgn } from '../utils/format';
import './PayBills.css';
import lightningSvg from '../assets/icons/lightning.svg';

function BillIcon({ icon }: { icon: BillCatalogItem['icon'] }) {
  if (icon === 'electricity') {
    return <img src={lightningSvg} alt="" width="20" height="20" />;
  }
  if (icon === 'airtime') {
    return '📱';
  }
  if (icon === 'tv') {
    return '📺';
  }
  return '🌐';
}

function CategoryIcon({ icon }: { icon: 'electricity' | 'airtime' | 'tv' | 'internet' }) {
  if (icon === 'electricity') {
    return <img src={lightningSvg} alt="" width="24" height="24" />;
  }
  if (icon === 'airtime') {
    return '📱';
  }
  if (icon === 'tv') {
    return '📺';
  }
  return '🌐';
}

const PayBills = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [paidBillIds, setPaidBillIds] = useState<Set<string>>(new Set());
  const [selectedBill, setSelectedBill] = useState<BillCatalogItem | null>(null);
  const [fromAccountId, setFromAccountId] = useState('');
  const [customerReference, setCustomerReference] = useState('');
  const [paying, setPaying] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await accountService.getAll();
      setAccounts(data);
      setFromAccountId((current) => {
        if (current && data.some((account) => account.id === current)) {
          return current;
        }

        const preferred =
          data.find((account) => account.accountType === 'wallet') ?? data[0];
        return preferred?.id ?? '';
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load accounts.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const walletBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + account.balance, 0),
    [accounts],
  );

  const upcomingBills = useMemo(
    () => BILL_CATALOG.filter((bill) => !paidBillIds.has(bill.id)),
    [paidBillIds],
  );

  const selectedAccount = accounts.find((account) => account.id === fromAccountId);

  const canPaySelected =
    selectedBill &&
    selectedAccount &&
    selectedAccount.balance >= selectedBill.amount;

  function openPayModal(bill: BillCatalogItem) {
    setSelectedBill(bill);
    setCustomerReference('');
    setMessage(null);
    setError(null);

    const affordable =
      accounts.find((account) => account.balance >= bill.amount) ??
      accounts.find((account) => account.accountType === 'wallet') ??
      accounts[0];

    if (affordable) {
      setFromAccountId(affordable.id);
    }
  }

  function closePayModal() {
    setSelectedBill(null);
    setCustomerReference('');
    setPaying(false);
  }

  async function handlePayBill() {
    if (!selectedBill || !fromAccountId) {
      return;
    }

    setPaying(true);
    setError(null);
    setMessage(null);

    try {
      const response = await billService.pay({
        fromAccountId,
        amount: selectedBill.amount,
        billProvider: selectedBill.billProvider,
        customerReference: customerReference.trim() || undefined,
        description: `${selectedBill.name} — ${selectedBill.billProvider}`,
      });

      setMessage(
        `${response.message} Ref: ${response.payment.reference} (${formatNgn(response.payment.amount)})`,
      );
      setPaidBillIds((current) => new Set(current).add(selectedBill.id));
      closePayModal();
      await loadAccounts();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Bill payment failed.';
      setError(msg);
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="pay-bills-container">
      <header className="pay-bills-header">
        <h1>Pay Bills</h1>
        <p>Settle your bills directly from PocketSync.</p>
      </header>

      {message && <div className="pb-banner pb-banner--success">{message}</div>}
      {error && !selectedBill && (
        <div className="pb-banner pb-banner--error">
          <p>{error}</p>
          <button type="button" className="pb-retry-btn" onClick={loadAccounts}>
            Try again
          </button>
        </div>
      )}

      <div className="bills-balance-card">
        <p className="bills-balance-label">Total linked balance</p>
        <p className="bills-balance-amount">
          {loading ? '…' : formatNgn(walletBalance)}
        </p>
        <p className="bills-balance-sub">
          {accounts.length === 0
            ? 'Link an account to pay bills'
            : `${accounts.length} connected account${accounts.length === 1 ? '' : 's'}`}
        </p>
      </div>

      <div className="bills-category-grid">
        {BILL_CATEGORY_SUMMARY.map((cat) => (
          <div key={cat.name} className="bill-category-card">
            <div className="bill-cat-icon">
              <CategoryIcon icon={cat.icon} />
            </div>
            <p className="bill-cat-name">{cat.name}</p>
            <p className="bill-cat-count">
              {cat.count} bill{cat.count === 1 ? '' : 's'}
            </p>
          </div>
        ))}
      </div>

      <section className="upcoming-bills">
        <h2>Upcoming Bills</h2>

        {loading && <p className="pb-status">Loading accounts…</p>}

        {!loading && accounts.length === 0 && (
          <p className="pb-status">Link an account before paying bills.</p>
        )}

        {!loading && upcomingBills.length === 0 && (
          <p className="pb-status">All catalog bills paid for this session.</p>
        )}

        {upcomingBills.map((bill) => (
          <div key={bill.id} className="bill-item">
            <div className="bill-icon">
              <BillIcon icon={bill.icon} />
            </div>
            <div className="bill-info">
              <p className="bill-name">{bill.name}</p>
              <p className={`bill-due${bill.overdue ? ' overdue' : ''}`}>
                {bill.overdue ? '⚠ Overdue — ' : 'Due '}
                {bill.due}
              </p>
            </div>
            <div className="bill-right">
              <p className="bill-amount">{formatNgn(bill.amount)}</p>
              <button
                type="button"
                className="pay-now-btn"
                onClick={() => openPayModal(bill)}
                disabled={accounts.length === 0}
              >
                Pay Now
              </button>
            </div>
          </div>
        ))}
      </section>

      {selectedBill && (
        <div className="pb-modal-backdrop" onClick={closePayModal}>
          <div
            className="pb-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-labelledby="pay-bill-title"
          >
            <h3 id="pay-bill-title">Pay {selectedBill.name}</h3>
            <p className="pb-modal-sub">
              {selectedBill.billProvider} · {formatNgn(selectedBill.amount)}
            </p>

            {error && <div className="pb-banner pb-banner--error">{error}</div>}

            <label className="pb-field">
              <span>Pay from</span>
              <select
                value={fromAccountId}
                onChange={(event) => setFromAccountId(event.target.value)}
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.bankName} ({account.maskAccount}) · {formatNgn(account.balance)}
                  </option>
                ))}
              </select>
            </label>

            <label className="pb-field">
              <span>Meter / customer reference (optional)</span>
              <input
                type="text"
                value={customerReference}
                onChange={(event) => setCustomerReference(event.target.value)}
                placeholder="e.g. 1234567890"
              />
            </label>

            {selectedAccount && (
              <p className="pb-modal-hint">
                {formatAccountType(selectedAccount.accountType)} ·{' '}
                {selectedAccount.balance < selectedBill.amount
                  ? 'Insufficient balance for this payment'
                  : 'Ready to pay'}
              </p>
            )}

            <div className="pb-modal-actions">
              <button type="button" className="pb-cancel-btn" onClick={closePayModal}>
                Cancel
              </button>
              <button
                type="button"
                className="pay-now-btn"
                onClick={handlePayBill}
                disabled={paying || !canPaySelected}
              >
                {paying ? 'Processing…' : `Pay ${formatNgn(selectedBill.amount)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayBills;