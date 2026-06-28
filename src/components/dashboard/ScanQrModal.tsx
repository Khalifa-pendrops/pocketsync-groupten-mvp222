import { useEffect, useMemo, useState } from 'react';
import type { BankAccount } from '../../types';
import { formatNgn } from '../../utils/format';
import './DashboardModal.css';

type ScanStep = 'scanning' | 'review' | 'success';

interface QrPayment {
  merchant: string;
  reference: string;
  amount: number;
}

const DEMO_PAYMENTS: QrPayment[] = [
  { merchant: 'Shoprite Ikeja', reference: 'QR-88421', amount: 12500 },
  { merchant: 'Chicken Republic VI', reference: 'QR-55290', amount: 4800 },
  { merchant: 'Uber Ride', reference: 'QR-33107', amount: 3200 },
  { merchant: 'Jumia Pay Merchant', reference: 'QR-71044', amount: 18900 },
];

interface ScanQrModalProps {
  open: boolean;
  accounts: BankAccount[];
  onClose: () => void;
}

export default function ScanQrModal({ open, accounts, onClose }: ScanQrModalProps) {
  const [step, setStep] = useState<ScanStep>('scanning');
  const [payment, setPayment] = useState<QrPayment | null>(null);
  const [accountId, setAccountId] = useState('');
  const [processing, setProcessing] = useState(false);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === accountId) ?? accounts[0],
    [accounts, accountId],
  );

  const canPay =
    payment &&
    selectedAccount &&
    selectedAccount.balance >= payment.amount &&
    selectedAccount.status === 'Active';

  useEffect(() => {
    if (!open) {
      setStep('scanning');
      setPayment(null);
      setProcessing(false);
      return;
    }

    if (accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [open, accounts]);

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

  const handleSimulateScan = () => {
    const randomPayment = DEMO_PAYMENTS[Math.floor(Math.random() * DEMO_PAYMENTS.length)];
    setPayment(randomPayment);
    setStep('review');
  };

  const handleConfirmPayment = () => {
    if (!canPay) {
      return;
    }

    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      setStep('success');
    }, 900);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="dashboard-modal-backdrop" onClick={onClose}>
      <div
        className="dashboard-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-qr-title"
      >
        <h3 id="scan-qr-title">Scan QR Code</h3>

        {step === 'scanning' && (
          <>
            <p className="dashboard-modal-sub">
              Point your camera at a merchant QR code to pay.
            </p>
            <div className="qr-scanner-frame" aria-hidden="true">
              <div className="qr-scanner-overlay">
                <div className="qr-scanner-corners">
                  <div className="qr-scanner-line" />
                </div>
              </div>
            </div>
            <p className="qr-scan-hint">
              Camera scanning is not enabled here yet. Try a sample payment instead.
            </p>
            <div className="dashboard-modal-actions">
              <button
                type="button"
                className="dashboard-modal-btn dashboard-modal-btn--ghost"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dashboard-modal-btn dashboard-modal-btn--primary"
                onClick={handleSimulateScan}
              >
                Try sample
              </button>
            </div>
          </>
        )}

        {step === 'review' && payment && (
          <>
            <p className="dashboard-modal-sub">Confirm payment details before you pay.</p>
            <div className="qr-result-card">
              <p>
                <span className="qr-result-label">Merchant</span>
                <br />
                <strong>{payment.merchant}</strong>
              </p>
              <p>
                <span className="qr-result-label">Reference</span>
                <br />
                {payment.reference}
              </p>
              <p>
                <span className="qr-result-label">Amount</span>
                <br />
                <strong>{formatNgn(payment.amount)}</strong>
              </p>
            </div>

            {accounts.length === 0 ? (
              <p className="dashboard-modal-status">
                Link an account to complete this QR payment.
              </p>
            ) : (
              <label className="dashboard-modal-field">
                <span>Pay from</span>
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
            )}

            {selectedAccount && payment.amount > selectedAccount.balance && (
              <div className="dashboard-modal-error">
                Insufficient balance on {selectedAccount.bankName}.
              </div>
            )}

            <div className="dashboard-modal-actions">
              <button
                type="button"
                className="dashboard-modal-btn dashboard-modal-btn--ghost"
                onClick={() => {
                  setStep('scanning');
                  setPayment(null);
                }}
              >
                Scan again
              </button>
              <button
                type="button"
                className="dashboard-modal-btn dashboard-modal-btn--primary"
                onClick={handleConfirmPayment}
                disabled={!canPay || processing}
              >
                {processing ? 'Processing…' : `Pay ${formatNgn(payment.amount)}`}
              </button>
            </div>
          </>
        )}

        {step === 'success' && payment && (
          <>
            <div className="qr-success">
              <div className="qr-success-icon" aria-hidden="true">
                ✓
              </div>
              <p>
                <strong>Payment successful</strong>
              </p>
              <p className="dashboard-modal-sub">
                {formatNgn(payment.amount)} sent to {payment.merchant}.
              </p>
            </div>
            <div className="dashboard-modal-actions">
              <button
                type="button"
                className="dashboard-modal-btn dashboard-modal-btn--primary"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}