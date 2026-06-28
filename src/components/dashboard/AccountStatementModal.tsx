import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../api/errors';
import { transactionService } from '../../services/transactionService';
import type { BankAccount } from '../../types';
import type { TransactionRow } from '../../types';
import { formatNgn, formatSignedNgn, formatTransactionDate } from '../../utils/format';
import './DashboardModal.css';

type StatementPeriod = 'this_month' | 'last_30_days' | 'last_3_months';

const PERIOD_OPTIONS: { value: StatementPeriod; label: string }[] = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'last_3_months', label: 'Last 3 Months' },
];

function getPeriodRange(period: StatementPeriod): { fromDate: string; toDate: string } {
  const toDate = new Date();
  const fromDate = new Date();

  switch (period) {
    case 'this_month':
      fromDate.setDate(1);
      fromDate.setHours(0, 0, 0, 0);
      break;
    case 'last_30_days':
      fromDate.setDate(fromDate.getDate() - 30);
      break;
    case 'last_3_months':
      fromDate.setMonth(fromDate.getMonth() - 3);
      break;
  }

  return { fromDate: fromDate.toISOString(), toDate: toDate.toISOString() };
}

function buildStatementCsv(
  account: BankAccount,
  periodLabel: string,
  transactions: TransactionRow[],
): string {
  const header = [
    'PocketSync Account Statement',
    `Account: ${account.bankName} ${account.maskAccount}`,
    `Period: ${periodLabel}`,
    `Generated: ${new Date().toLocaleString('en-NG')}`,
    '',
    'Date,Description,Category,Type,Amount',
  ];

  const rows = transactions.map((tx) =>
    [
      new Date(tx.date).toISOString(),
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.category,
      tx.type,
      tx.amount,
    ].join(','),
  );

  return [...header, ...rows].join('\n');
}

interface AccountStatementModalProps {
  open: boolean;
  accounts: BankAccount[];
  onClose: () => void;
}

export default function AccountStatementModal({
  open,
  accounts,
  onClose,
}: AccountStatementModalProps) {
  const [accountId, setAccountId] = useState('');
  const [period, setPeriod] = useState<StatementPeriod>('this_month');
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === accountId) ?? accounts[0],
    [accounts, accountId],
  );

  const periodLabel = PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? period;

  const loadStatement = useCallback(async () => {
    if (!selectedAccount) {
      setTransactions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const range = getPeriodRange(period);
      const response = await transactionService.getPage({
        accountId: selectedAccount.id,
        fromDate: range.fromDate,
        toDate: range.toDate,
        limit: 100,
        page: 1,
      });
      setTransactions(response.transactions);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load account statement.';
      setError(message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [period, selectedAccount]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [open, accounts, accountId]);

  useEffect(() => {
    if (!open || !selectedAccount) {
      return;
    }

    loadStatement();
  }, [open, selectedAccount, period, loadStatement]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  const handleDownload = () => {
    if (!selectedAccount || transactions.length === 0) {
      return;
    }

    const csv = buildStatementCsv(selectedAccount, periodLabel, transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pocketsync-statement-${selectedAccount.bankName.toLowerCase().replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="dashboard-modal-backdrop" onClick={onClose}>
      <div
        className="dashboard-modal dashboard-modal--wide"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-statement-title"
      >
        <h3 id="account-statement-title">Account Statement</h3>
        <p className="dashboard-modal-sub">Download a statement for a linked account.</p>

        {accounts.length === 0 ? (
          <p className="dashboard-modal-status">
            Link an account first to generate a statement.
          </p>
        ) : (
          <>
            <label className="dashboard-modal-field">
              <span>Account</span>
              <select
                value={selectedAccount?.id ?? ''}
                onChange={(event) => setAccountId(event.target.value)}
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.bankName} ({account.maskAccount}) · {formatNgn(account.balance)}
                  </option>
                ))}
              </select>
            </label>

            <label className="dashboard-modal-field">
              <span>Period</span>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as StatementPeriod)}
              >
                {PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {error && <div className="dashboard-modal-error">{error}</div>}

            <div className="dashboard-modal-body">
              {loading && (
                <p className="dashboard-modal-status">Loading statement…</p>
              )}

              {!loading && !error && transactions.length === 0 && (
                <p className="dashboard-modal-status">
                  No transactions found for {periodLabel.toLowerCase()}.
                </p>
              )}

              {!loading && transactions.length > 0 && (
                <table className="statement-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>{formatTransactionDate(tx.date)}</td>
                        <td>{tx.description}</td>
                        <td
                          className={
                            tx.type === 'credit'
                              ? 'statement-amount--credit'
                              : 'statement-amount--debit'
                          }
                        >
                          {formatSignedNgn(tx.amount, tx.type)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        <div className="dashboard-modal-actions">
          <button
            type="button"
            className="dashboard-modal-btn dashboard-modal-btn--ghost"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="dashboard-modal-btn dashboard-modal-btn--primary"
            onClick={handleDownload}
            disabled={!selectedAccount || transactions.length === 0 || loading}
          >
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}