import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/errors';
import type { ApiDiscoveredAccount, OnboardingStep } from '../../api/types';
import AuthLayout from '../../components/auth/AuthLayout';
import '../../components/auth/auth.css';
import './Onboarding.css';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { syncOnboardingStatus } from '../../lib/authFlow';
import { onboardingService } from '../../services/onboardingService';

function formatNgn(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Onboarding() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { onboardingStep, user } = useAppSelector((state) => state.auth);

  const [step, setStep] = useState<OnboardingStep>(onboardingStep ?? 'bvn_entry');
  const [bvn, setBvn] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<ApiDiscoveredAccount[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (onboardingStep) {
      setStep(onboardingStep);
    }
  }, [onboardingStep]);

  useEffect(() => {
    if (step !== 'connect_accounts') {
      return;
    }

    let cancelled = false;

    async function loadAccounts() {
      setLoading(true);
      setError('');

      try {
        const response = await onboardingService.getDiscoveredAccounts();
        if (!cancelled) {
          setAccounts(response.accounts);
          setSelectedIds(response.accounts.map((account) => account.id));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load discovered accounts.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAccounts();

    return () => {
      cancelled = true;
    };
  }, [step]);

  async function handleBvnSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await onboardingService.submitBvn(bvn, phone);
      setInfo(response.message);
      setMaskedPhone(response.maskedPhone ?? '');
      if (response.devOtp) {
        setDevOtp(response.devOtp);
      }
      setStep('phone_otp');
      await syncOnboardingStatus(dispatch);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to submit BVN details.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await onboardingService.verifyBvnOtp(otp);
      setInfo(response.message);
      setStep('connect_accounts');
      await syncOnboardingStatus(dispatch);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verification failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError('');
    setLoading(true);

    try {
      const response = await onboardingService.sendBvnOtp();
      setInfo(response.message);
      setMaskedPhone(response.maskedPhone ?? maskedPhone);
      if (response.devOtp) {
        setDevOtp(response.devOtp);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to resend code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onboardingService.connectDiscoveredAccounts(selectedIds);
      const complete = await syncOnboardingStatus(dispatch);
      if (complete) {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to connect accounts.');
    } finally {
      setLoading(false);
    }
  }

  function toggleAccount(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  const title =
    step === 'bvn_entry'
      ? 'Verify your identity'
      : step === 'phone_otp'
        ? 'Confirm your phone'
        : 'Connect your accounts';

  const subtitle =
    step === 'bvn_entry'
      ? `Hi ${user?.fullName ?? 'there'}, enter your BVN and phone number to discover linked accounts.`
      : step === 'phone_otp'
        ? `Enter the code sent to ${maskedPhone || 'your phone'}.`
        : 'Select the accounts you want to add to PocketSync.';

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      {step === 'bvn_entry' && (
        <form className="auth-form" onSubmit={handleBvnSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label htmlFor="bvn">BVN</label>
            <input
              id="bvn"
              type="text"
              inputMode="numeric"
              value={bvn}
              onChange={(event) => setBvn(event.target.value)}
              maxLength={11}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="08012345678"
              required
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Submitting…' : 'Continue'}
          </button>
        </form>
      )}

      {step === 'phone_otp' && (
        <form className="auth-form" onSubmit={handleVerifyOtp}>
          {info && <div className="auth-info">{info}</div>}
          {error && <div className="auth-error">{error}</div>}
          {devOtp && (
            <div className="auth-dev-hint">
              Dev OTP: <strong>{devOtp}</strong>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="otp">Verification code</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              maxLength={6}
              required
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify phone'}
          </button>

          <button
            type="button"
            className="auth-secondary"
            onClick={handleResendOtp}
            disabled={loading}
          >
            Resend code
          </button>
        </form>
      )}

      {step === 'connect_accounts' && (
        <form className="auth-form onboarding-connect" onSubmit={handleConnect}>
          {error && <div className="auth-error">{error}</div>}

          <div className="onboarding-account-list">
            {accounts.map((account) => (
              <label key={account.id} className="onboarding-account-row">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(account.id)}
                  onChange={() => toggleAccount(account.id)}
                />
                <div className="onboarding-account-info">
                  <strong>{account.institution}</strong>
                  <span>
                    {account.maskedAccountNumber} · {account.accountType}
                  </span>
                  <span>{formatNgn(account.balance)}</span>
                </div>
              </label>
            ))}

            {!loading && accounts.length === 0 && (
              <p className="onboarding-empty">No pending accounts found.</p>
            )}
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading || selectedIds.length === 0}
          >
            {loading ? 'Connecting…' : 'Connect selected accounts'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}