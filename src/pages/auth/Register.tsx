import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/errors';
import AuthLayout, { AuthLink } from '../../components/auth/AuthLayout';
import { authService } from '../../services/authService';

function goToVerify(
  navigate: ReturnType<typeof useNavigate>,
  email: string,
  message: string,
  devOtp?: string,
) {
  navigate('/verify-email', {
    replace: true,
    state: { email, message, devOtp },
  });
}

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.register({
        email,
        password,
        fullName,
        confirmPassword,
        termsAccepted,
      });

      goToVerify(navigate, email, response.message, response.devOtp);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError(
            'This email is already registered and verified. Sign in instead, or use a different email.',
          );
          return;
        }
        setError(err.message);
      } else {
        setError('Unable to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start consolidating your finances in one place."
      footer={
        <>
          Already have an account? <AuthLink to="/login">Sign in</AuthLink>
          {' · '}
          <AuthLink to="/verify-email">Verify email</AuthLink>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </div>

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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            required
          />
        </div>

        <label className="auth-checkbox">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(event) => setTermsAccepted(event.target.checked)}
            required
          />
          <span>I agree to the terms and privacy policy</span>
        </label>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}