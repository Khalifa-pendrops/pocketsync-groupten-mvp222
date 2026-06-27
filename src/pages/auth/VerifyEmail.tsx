import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/errors';
import AuthLayout, { AuthLink } from '../../components/auth/AuthLayout';
import { authService } from '../../services/authService';

interface VerifyEmailState {
  email?: string;
  message?: string;
  devOtp?: string;
}

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as VerifyEmailState | null) ?? {};

  const [email, setEmail] = useState(routeState.email ?? '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState(routeState.message ?? '');
  const [devOtp, setDevOtp] = useState<string | null>(routeState.devOtp ?? null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.verifyOtp({ email, code, purpose: 'signup' });
      navigate('/login', {
        replace: true,
        state: { message: 'Email verified. You can sign in now.' },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setResending(true);

    try {
      const response = await authService.sendOtp(email, 'signup');
      setInfo(response.message);
      if ('devOtp' in response && typeof response.devOtp === 'string') {
        setDevOtp(response.devOtp);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to resend code.');
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the 6-digit code sent to your inbox."
      footer={
        <>
          Verified already? <AuthLink to="/login">Sign in</AuthLink>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {info && <div className="auth-info">{info}</div>}
        {error && <div className="auth-error">{error}</div>}
        {devOtp && (
          <div className="auth-dev-hint">
            Dev OTP: <strong>{devOtp}</strong>
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="code">Verification code</label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            maxLength={6}
            required
          />
        </div>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Verifying…' : 'Verify email'}
        </button>

        <button
          type="button"
          className="auth-secondary"
          onClick={handleResend}
          disabled={resending || !email}
        >
          {resending ? 'Sending…' : 'Resend code'}
        </button>
      </form>
    </AuthLayout>
  );
}