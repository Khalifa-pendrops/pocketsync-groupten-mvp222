import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api/errors';
import { RECIPIENT_BANKS } from '../constants/banks';
import { accountService } from '../services/accountService';
import { transactionService } from '../services/transactionService';
import type { BankAccount } from '../types';
import { formatAccountType, formatNgn } from '../utils/format';
import './Transfer.css';

type TransferMode = 'internal' | 'interbank';

interface TransferSuccess {
  title: string;
  amount: number;
  reference: string;
  detail: string;
}

function parseAmountInput(value: string): number | null {
  const parsed = Number(value.replace(/,/g, '').trim());
  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

const Transfer = () => {
  const [mode, setMode] = useState<TransferMode>('internal');
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<TransferSuccess | null>(null);

  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const [recipientBank, setRecipientBank] = useState<string>(RECIPIENT_BANKS[0]);
  const [recipientAccountNumber, setRecipientAccountNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');

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
        return data[0]?.id ?? '';
      });
      setToAccountId((current) => {
        const destinations = data.filter((account) => account.id !== data[0]?.id);
        if (current && destinations.some((account) => account.id === current)) {
          return current;
        }
        return destinations[0]?.id ?? '';
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load accounts.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const fromAccount = accounts.find((account) => account.id === fromAccountId);
  const destinationAccounts = useMemo(
    () => accounts.filter((account) => account.id !== fromAccountId),
    [accounts, fromAccountId],
  );

  const parsedAmount = parseAmountInput(amount);

  const canSubmitInternal =
    fromAccount &&
    toAccountId &&
    fromAccountId !== toAccountId &&
    parsedAmount !== null &&
    fromAccount.balance >= parsedAmount;

  const canSubmitInterbank =
    fromAccount &&
    parsedAmount !== null &&
    /^\d{10}$/.test(recipientAccountNumber) &&
    recipientBank.trim().length >= 2 &&
    fromAccount.balance >= parsedAmount;

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setRecipientAccountNumber('');
    setRecipientName('');
    setSuccess(null);
    setError(null);
  };

  const handleModeChange = (nextMode: TransferMode) => {
    setMode(nextMode);
    resetForm();
  };

  const handleInternalSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmitInternal || parsedAmount === null) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await transactionService.transferInternal({
        fromAccountId,
        toAccountId,
        amount: parsedAmount,
        description: description.trim() || undefined,
      });

      const toAccount = response.transfer.toAccount;
      setSuccess({
        title: 'Transfer successful',
        amount: response.transfer.amount,
        reference: response.transfer.reference,
        detail: `${formatNgn(response.transfer.amount)} moved from ${response.transfer.fromAccount.institution} to ${toAccount.institution}.`,
      });
      await loadAccounts();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Transfer failed.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInterbankSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmitInterbank || parsedAmount === null) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await transactionService.transferInterbank({
        fromAccountId,
        recipientBank,
        recipientAccountNumber,
        recipientName: recipientName.trim() || undefined,
        amount: parsedAmount,
        description: description.trim() || undefined,
      });

      setSuccess({
        title: 'Transfer sent',
        amount: response.transfer.amount,
        reference: response.transfer.nipReference,
        detail: `${formatNgn(response.transfer.amount)} sent to ${response.transfer.recipient.name} at ${response.transfer.recipient.bank} (${response.transfer.recipient.accountNumber}).`,
      });
      await loadAccounts();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Transfer failed.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!destinationAccounts.some((account) => account.id === toAccountId)) {
      setToAccountId(destinationAccounts[0]?.id ?? '');
    }
  }, [destinationAccounts, toAccountId]);

  if (success) {
    return (
      <div className="transfer-container">
        <div className="transfer-card">
          <div className="transfer-success-card">
            <div className="transfer-success-icon" aria-hidden="true">
              ✓
            </div>
            <h2>{success.title}</h2>
            <p className="transfer-success-detail">{success.detail}</p>
            <p className="transfer-success-ref">
              Reference: <strong>{success.reference}</strong>
            </p>
          </div>
          <div className="transfer-actions">
            <button type="button" className="transfer-tab" onClick={resetForm}>
              Make another transfer
            </button>
            <Link to="/transactions" className="transfer-submit-btn">
              View transactions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transfer-container">
      <header className="transfer-header">
        <h1>Transfer</h1>
        <p>Move money between your linked accounts or send to another bank.</p>
      </header>

      <div className="transfer-tabs" role="tablist" aria-label="Transfer type">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'internal'}
          className={`transfer-tab${mode === 'internal' ? ' active' : ''}`}
          onClick={() => handleModeChange('internal')}
        >
          Between my accounts
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'interbank'}
          className={`transfer-tab${mode === 'interbank' ? ' active' : ''}`}
          onClick={() => handleModeChange('interbank')}
        >
          To another bank
        </button>
      </div>

      {loading && <p className="transfer-status">Loading accounts…</p>}

      {!loading && accounts.length === 0 && (
        <div className="transfer-card">
          <p className="transfer-hint">
            Link at least one account before you can transfer money.
          </p>
          <Link to="/link-accounts" className="transfer-submit-btn">
            Link an account
          </Link>
        </div>
      )}

      {!loading && accounts.length > 0 && mode === 'internal' && accounts.length < 2 && (
        <div className="transfer-card">
          <p className="transfer-hint">
            Internal transfers need two linked accounts. Link another bank or wallet to
            move money between your own accounts.
          </p>
          <Link to="/link-accounts" className="transfer-submit-btn">
            Link another account
          </Link>
        </div>
      )}

      {!loading && error && <div className="transfer-banner transfer-banner--error">{error}</div>}

      {!loading && accounts.length > 0 && mode === 'internal' && accounts.length >= 2 && (
        <form className="transfer-card" onSubmit={handleInternalSubmit}>
          <label className="transfer-field">
            <span>From</span>
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

          <label className="transfer-field">
            <span>To</span>
            <select
              value={toAccountId}
              onChange={(event) => setToAccountId(event.target.value)}
            >
              {destinationAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bankName} ({account.maskAccount}) · {formatNgn(account.balance)}
                </option>
              ))}
            </select>
          </label>

          <label className="transfer-field">
            <span>Amount (NGN)</span>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="e.g. 5000"
              required
            />
          </label>

          <label className="transfer-field">
            <span>Description (optional)</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this transfer for?"
            />
          </label>

          {fromAccount && parsedAmount !== null && fromAccount.balance < parsedAmount && (
            <p className="transfer-hint">Insufficient balance on {fromAccount.bankName}.</p>
          )}

          {fromAccount && (
            <p className="transfer-hint">
              {formatAccountType(fromAccount.accountType)} · Available{' '}
              {formatNgn(fromAccount.balance)}
            </p>
          )}

          <div className="transfer-actions">
            <button
              type="submit"
              className="transfer-submit-btn"
              disabled={submitting || !canSubmitInternal}
            >
              {submitting
                ? 'Processing…'
                : parsedAmount
                  ? `Transfer ${formatNgn(parsedAmount)}`
                  : 'Transfer'}
            </button>
          </div>
        </form>
      )}

      {!loading && accounts.length > 0 && mode === 'interbank' && (
        <form className="transfer-card" onSubmit={handleInterbankSubmit}>
          <label className="transfer-field">
            <span>From</span>
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

          <label className="transfer-field">
            <span>Recipient bank</span>
            <select
              value={recipientBank}
              onChange={(event) => setRecipientBank(event.target.value)}
            >
              {RECIPIENT_BANKS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </label>

          <label className="transfer-field">
            <span>Account number</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={recipientAccountNumber}
              onChange={(event) =>
                setRecipientAccountNumber(event.target.value.replace(/\D/g, '').slice(0, 10))
              }
              placeholder="10-digit account number"
              required
            />
          </label>

          <label className="transfer-field">
            <span>Recipient name (optional)</span>
            <input
              type="text"
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              placeholder="Account holder name"
            />
          </label>

          <label className="transfer-field">
            <span>Amount (NGN)</span>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="e.g. 10000"
              required
            />
          </label>

          <label className="transfer-field">
            <span>Description (optional)</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Payment note"
            />
          </label>

          {fromAccount && parsedAmount !== null && fromAccount.balance < parsedAmount && (
            <p className="transfer-hint">Insufficient balance on {fromAccount.bankName}.</p>
          )}

          <div className="transfer-actions">
            <button
              type="submit"
              className="transfer-submit-btn"
              disabled={submitting || !canSubmitInterbank}
            >
              {submitting
                ? 'Processing…'
                : parsedAmount
                  ? `Send ${formatNgn(parsedAmount)}`
                  : 'Send money'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Transfer;