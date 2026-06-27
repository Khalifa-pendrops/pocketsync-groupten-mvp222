import { FormEvent, useState } from 'react';
import AuthLayout, { AuthLink } from '../../components/auth/AuthLayout';
import { ApiError } from '../../api/errors';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
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
          Remembered it? <AuthLink to="/login">Back to sign in</AuthLink>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {info && <div className="auth-info">{info}</div>}
        {error && <div className="auth-error">{error}</div>}
        {devOtp && (
          <div className="auth-dev-hint">
            Dev OTP: <strong>{devOtp}</strong> — use it on the reset page.
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

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send code'}
        </button>

        {info && (
          <p style={{ textAlign: 'center', fontSize: 'var(--body-4)' }}>
            <AuthLink to="/reset-password" state={{ email }}>
              Continue to reset password
            </AuthLink>
          </p>
        )}
      </form>
    </AuthLayout>
  );
}