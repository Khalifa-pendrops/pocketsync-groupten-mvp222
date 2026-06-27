import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/errors';
import AuthLayout, { AuthLink } from '../../components/auth/AuthLayout';
import { useAppDispatch } from '../../hooks/redux';
import { establishSession } from '../../lib/authFlow';
import { authService } from '../../services/authService';

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const flashMessage = (location.state as { message?: string } | null)?.message ?? '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      const onboardingComplete = await establishSession(response.user, dispatch);

      if (from && onboardingComplete) {
        navigate(from, { replace: true });
        return;
      }

      navigate(onboardingComplete ? '/' : '/onboarding', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403 && err.body.requiresVerification === true) {
          const verifiedEmail = typeof err.body.email === 'string' ? err.body.email : email;
          navigate('/verify-email', { replace: true, state: { email: verifiedEmail } });
          return;
        }
        setError(err.message);
      } else {
        setError('Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your accounts and transactions."
      footer={
        <>
          Don&apos;t have an account? <AuthLink to="/register">Create one</AuthLink>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {flashMessage && <div className="auth-info">{flashMessage}</div>}
        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <p style={{ textAlign: 'right', fontSize: 'var(--body-4)' }}>
          <AuthLink to="/forgot-password">Forgot password?</AuthLink>
        </p>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}