import { type SubmitEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/errors';
import AuthLayout, { AuthDangerLink, AuthLink } from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
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

  async function handleSubmit(event: SubmitEvent) {
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
      title="Welcome 👋"
      footer={
        <>
          Don&apos;t have an account? <AuthLink to="/register">Sign Up</AuthLink>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {flashMessage && <div className="auth-info">{flashMessage}</div>}
        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label htmlFor="email">Email or Phone</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="auth-forgot-row">
          <AuthDangerLink to="/forgot-password">Forgot Password?</AuthDangerLink>
        </div>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Log In'}
        </button>
      </form>
    </AuthLayout>
  );
}