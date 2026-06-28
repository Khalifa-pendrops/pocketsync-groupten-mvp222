import { type SubmitEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/errors';
import AuthLayout, { AuthLink } from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import { authService } from '../../services/authService';

interface ResetPasswordState {
  email?: string;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as ResetPasswordState | null) ?? {};

  const [email, setEmail] = useState(routeState.email ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.resetPassword({
        email,
        code,
        password,
        confirmPassword,
      });
      navigate('/login', {
        replace: true,
        state: { message: 'Password updated. Sign in with your new password.' },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to reset password.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter the code from your email and choose a new password."
      footer={
        <>
          <AuthLink to="/login">Back to Log In</AuthLink>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label htmlFor="email">Email or Phone</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
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
            placeholder="000000"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            maxLength={6}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">New password</label>
          <PasswordInput
            id="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="confirmPassword">Confirm password</label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            required
          />
        </div>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthLayout>
  );
}