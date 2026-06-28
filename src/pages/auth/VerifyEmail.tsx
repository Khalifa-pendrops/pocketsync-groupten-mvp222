import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/errors';
import OtpInput from '../../components/auth/OtpInput';
import OtpLayout from '../../components/auth/OtpLayout';
import { authService } from '../../services/authService';

const DEFAULT_RESEND_SECONDS = 30;

interface VerifyEmailState {
  email?: string;
  message?: string;
  devOtp?: string;
  resendAvailableIn?: number;
}

function formatCountdown(seconds: number): string {
  const padded = Math.max(0, seconds).toString().padStart(2, '0');
  return `00.${padded}`;
}

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as VerifyEmailState | null) ?? {};

  const [email] = useState(routeState.email ?? '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(routeState.devOtp ?? null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(
    routeState.resendAvailableIn ?? DEFAULT_RESEND_SECONDS,
  );

  const verifyInFlight = useRef(false);

  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current <= 0 ? 0 : current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  async function verifyOtpCode(nextCode: string) {
    if (nextCode.length !== 6 || !email || verifyInFlight.current) {
      return;
    }

    verifyInFlight.current = true;
    setError('');
    setLoading(true);

    try {
      await authService.verifyOtp({ email, code: nextCode, purpose: 'signup' });
      navigate('/login', {
        replace: true,
        state: { message: 'Email verified. You can sign in now.' },
      });
    } catch (err) {
      verifyInFlight.current = false;
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Verification failed. Please try again.');
      }
      setCode('');
    } finally {
      setLoading(false);
    }
  }

  function handleCodeChange(nextCode: string) {
    setCode(nextCode);
    if (nextCode.length === 6) {
      void verifyOtpCode(nextCode);
    }
  }

  async function handleResend() {
    if (secondsLeft > 0 || resending || !email) {
      return;
    }

    setError('');
    setResending(true);

    try {
      const response = await authService.sendOtp(email, 'signup');
      if ('devOtp' in response && typeof response.devOtp === 'string') {
        setDevOtp(response.devOtp);
      }
      const cooldown =
        'resendAvailableIn' in response && typeof response.resendAvailableIn === 'number'
          ? response.resendAvailableIn
          : DEFAULT_RESEND_SECONDS;
      setSecondsLeft(cooldown);
      setCode('');
      verifyInFlight.current = false;
    } catch (err) {
      if (err instanceof ApiError) {
        if (typeof err.body.resendAvailableIn === 'number') {
          setSecondsLeft(err.body.resendAvailableIn);
        }
        setError(err.message);
      } else {
        setError('Unable to resend code.');
      }
    } finally {
      setResending(false);
    }
  }

  if (!email) {
    return null;
  }

  return (
    <OtpLayout
      backTo="/register"
      title="Verify your account"
      subtitle="Enter the 6-digit code sent to your email"
    >
      <div className="otp-body">
        {error && <div className="otp-error">{error}</div>}
        {devOtp && (
          <div className="otp-dev-hint">
            Dev OTP: <strong>{devOtp}</strong>
          </div>
        )}

        <OtpInput value={code} onChange={handleCodeChange} disabled={loading} />

        {loading ? (
          <p className="otp-loading">Verifying…</p>
        ) : secondsLeft > 0 ? (
          <p className="otp-resend">Resend code in {formatCountdown(secondsLeft)}</p>
        ) : (
          <button
            type="button"
            className="otp-resend otp-resend--active"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        )}
      </div>
    </OtpLayout>
  );
}