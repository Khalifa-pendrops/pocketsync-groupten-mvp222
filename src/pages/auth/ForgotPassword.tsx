import { type SubmitEvent, useState } from 'react';
import AuthLayout, { AuthDangerLink, AuthLink } from '../../components/auth/AuthLayout';
import { ApiError } from '../../api/errors';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setError('');
    setInfo('');
    setDevOtp(null);
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setInfo(response.message);
      if ('devOtp' in response && typeof response.devOtp === 'string') {
        setDevOtp(response.devOtp);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to process request.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="We'll send a verification code if an account exists for this email."
      footer={
        <>
          Remembered it? <AuthLink to="/login">Back to Log In</AuthLink>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {info && <div className="auth-info">{info}</div>}
        {error && <div className="auth-error">{error}</div>}
        {devOtp && (
          <div className="auth-dev-hint">
            Test code: <strong>{devOtp}</strong>
          </div>
        )}

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

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send code'}
        </button>

        {info && (
          <p className="auth-inline-action">
            <AuthDangerLink to="/reset-password" state={{ email }}>
              Continue to reset password
            </AuthDangerLink>
          </p>
        )}
      </form>
    </AuthLayout>
  );
}