import { type SubmitEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/errors';
import type { ApiDiscoveredAccount, OnboardingStep } from '../../api/types';
import OtpInput from '../../components/auth/OtpInput';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import SecurityConsentModal from '../../components/onboarding/SecurityConsentModal';
import {
  DEFAULT_RESEND_SECONDS,
  formatCountdown,
  formatPhoneForOtpDisplay,
} from '../../lib/otpUtils';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { syncOnboardingStatus } from '../../lib/authFlow';
import { onboardingService } from '../../services/onboardingService';
import onboardArt from '../../assets/images/onboard.png';
import lockIcon from '../../assets/icons/lock.svg';
import '../../components/auth/otp.css';
import './Onboarding.css';

const ONBOARDING_STEPS = 3;

type UiStep = 'welcome' | 'bvn_entry' | 'phone_otp' | 'connect_accounts';

function resolveUiStep(backendStep: OnboardingStep | null): UiStep {
  if (backendStep === 'phone_otp') {
    return 'phone_otp';
  }

  if (backendStep === 'connect_accounts') {
    return 'connect_accounts';
  }

  return 'welcome';
}

function formatNgn(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Onboarding() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { onboardingStep } = useAppSelector((state) => state.auth);

  const [uiStep, setUiStep] = useState<UiStep>(() => resolveUiStep(onboardingStep));
  const [bvn, setBvn] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<ApiDiscoveredAccount[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_RESEND_SECONDS);
  const [bvnConsentAccepted, setBvnConsentAccepted] = useState(false);
  const [showSecurityConsent, setShowSecurityConsent] = useState(false);

  const verifyInFlight = useRef(false);

  useEffect(() => {
    if (!onboardingStep) {
      return;
    }

    if (onboardingStep === 'phone_otp') {
      setUiStep('phone_otp');
      return;
    }

    if (onboardingStep === 'connect_accounts') {
      setUiStep('connect_accounts');
    }
  }, [onboardingStep]);

  useEffect(() => {
    if (uiStep !== 'phone_otp' && uiStep !== 'connect_accounts') {
      return;
    }

    let cancelled = false;

    async function loadStatus() {
      try {
        const status = await onboardingService.getStatus();
        if (!cancelled && status.maskedPhone) {
          setMaskedPhone(status.maskedPhone);
        }
      } catch {

      }
    }

    loadStatus();

    return () => {
      cancelled = true;
    };
  }, [uiStep]);

  useEffect(() => {
    if (uiStep !== 'connect_accounts') {
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
  }, [uiStep]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current <= 0 ? 0 : current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (uiStep !== 'bvn_entry' || bvnConsentAccepted) {
      setShowSecurityConsent(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowSecurityConsent(true);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [uiStep, bvnConsentAccepted]);

  function goToWelcome() {
    setBvnConsentAccepted(false);
    setShowSecurityConsent(false);
    setUiStep('welcome');
  }

  async function handleBvnSubmit(event: SubmitEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await onboardingService.submitBvn(bvn, phone);
      setMaskedPhone(response.maskedPhone ?? '');
      if (response.devOtp) {
        setDevOtp(response.devOtp);
      }
      setSecondsLeft(DEFAULT_RESEND_SECONDS);
      setUiStep('phone_otp');
      await syncOnboardingStatus(dispatch);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to submit BVN details.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtpCode(nextCode: string) {
    if (nextCode.length !== 6 || verifyInFlight.current) {
      return;
    }

    verifyInFlight.current = true;
    setError('');
    setLoading(true);

    try {
      await onboardingService.verifyBvnOtp(nextCode);
      setUiStep('connect_accounts');
      await syncOnboardingStatus(dispatch);
    } catch (err) {
      verifyInFlight.current = false;
      setError(err instanceof ApiError ? err.message : 'Verification failed.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(nextCode: string) {
    setOtp(nextCode);
    if (nextCode.length === 6) {
      void verifyOtpCode(nextCode);
    }
  }

  async function handleResendOtp() {
    if (secondsLeft > 0 || resending) {
      return;
    }

    setError('');
    setResending(true);

    try {
      const response = await onboardingService.sendBvnOtp();
      setMaskedPhone(response.maskedPhone ?? maskedPhone);
      if (response.devOtp) {
        setDevOtp(response.devOtp);
      }
      setSecondsLeft(DEFAULT_RESEND_SECONDS);
      setOtp('');
      verifyInFlight.current = false;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to resend code.');
    } finally {
      setResending(false);
    }
  }

  async function handleConnect(event: SubmitEvent) {
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

  if (uiStep === 'welcome') {
    return (
      <OnboardingLayout step={1} totalSteps={ONBOARDING_STEPS}>
        <div className="onboarding-welcome">
          <img
            src={onboardArt}
            alt="Connected bank accounts on a phone"
            className="onboarding-welcome-art"
          />

          <div className="onboarding-welcome-copy">
            <h2>Connect all your bank and fintech accounts in one place.</h2>
            <p>
              View all accounts, track transactions and manage your money from one dashboard.
            </p>
            <button
              type="button"
              className="onboarding-primary-btn"
              onClick={() => setUiStep('bvn_entry')}
            >
              Get Started <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  if (uiStep === 'bvn_entry') {
    const formLocked = !bvnConsentAccepted;

    return (
      <>
        <OnboardingLayout
          step={2}
          totalSteps={ONBOARDING_STEPS}
          innerCard
          onBack={goToWelcome}
        >
          <header className="onboarding-form-header">
            <h1>Enter Your BVN</h1>
            <p>Please enter your 11-digit BVN to continue.</p>
          </header>

          <form className="onboarding-form" onSubmit={handleBvnSubmit}>
            {error && <div className="onboarding-error">{error}</div>}

            <div className="onboarding-field">
              <label htmlFor="bvn">BVN</label>
              <input
                id="bvn"
                type="text"
                inputMode="numeric"
                placeholder="Enter your 11-digit"
                value={bvn}
                onChange={(event) => setBvn(event.target.value)}
                maxLength={11}
                disabled={formLocked}
                required
              />
            </div>

            <div className="onboarding-field">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={formLocked}
                required
              />
            </div>

            <div className="onboarding-security-note">
              <img src={lockIcon} alt="" width="18" height="18" aria-hidden="true" />
              <span>
                Your BVN is required to verify your identity and connect your bank account.
              </span>
            </div>

            <button
              type="submit"
              className="onboarding-primary-btn onboarding-primary-btn--full"
              disabled={loading || formLocked}
            >
              {loading ? 'Submitting…' : 'Continue'}
            </button>
          </form>
        </OnboardingLayout>

        <SecurityConsentModal
          open={showSecurityConsent}
          onProceed={() => {
            setBvnConsentAccepted(true);
            setShowSecurityConsent(false);
          }}
          onCancel={goToWelcome}
        />
      </>
    );
  }

  if (uiStep === 'phone_otp') {
    const phoneLabel = maskedPhone
      ? formatPhoneForOtpDisplay(maskedPhone)
      : 'your registered phone number';

    return (
      <OnboardingLayout
        step={3}
        totalSteps={ONBOARDING_STEPS}
        innerCard
        onBack={() => setUiStep('bvn_entry')}
      >
        <header className="onboarding-form-header">
          <h1>Enter OTP</h1>
          <p>
            We&apos;ve sent a 6-digit OTP to your registered phone number {phoneLabel}.
          </p>
        </header>

        <div className="onboarding-otp-body">
          {error && <div className="onboarding-error">{error}</div>}
          {devOtp && (
            <div className="onboarding-dev-hint">
              Test code: <strong>{devOtp}</strong>
            </div>
          )}

          <OtpInput value={otp} onChange={handleOtpChange} disabled={loading} />

          {loading ? (
            <p className="onboarding-loading">Verifying…</p>
          ) : secondsLeft > 0 ? (
            <p className="otp-resend">Resend code in {formatCountdown(secondsLeft)}</p>
          ) : (
            <button
              type="button"
              className="otp-resend otp-resend--active"
              onClick={handleResendOtp}
              disabled={resending}
            >
              {resending ? 'Sending…' : 'Resend code'}
            </button>
          )}
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout step={3} totalSteps={ONBOARDING_STEPS} innerCard>
      <header className="onboarding-form-header">
        <h1>Connect your accounts</h1>
        <p>Select the accounts you want to add to PocketSync.</p>
      </header>

      <form className="onboarding-form onboarding-connect" onSubmit={handleConnect}>
        {error && <div className="onboarding-error">{error}</div>}

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
          className="onboarding-primary-btn onboarding-primary-btn--full"
          disabled={loading || selectedIds.length === 0}
        >
          {loading ? 'Connecting…' : 'Connect selected accounts'}
        </button>
      </form>
    </OnboardingLayout>
  );
}