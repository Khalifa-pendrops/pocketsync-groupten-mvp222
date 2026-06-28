import { InputHTMLAttributes, useState } from 'react';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.7 10.7a3 3 0 0 0 4.2 4.2M6.3 6.3C4.2 7.8 2.6 10 2 12s3.5 7 10 7c1.8 0 3.4-.4 4.8-1.1M9.9 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17.5 17.5 0 0 1-3.1 4.2M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const { className, ...rest } = props;

  return (
    <div className="auth-password-wrap">
      <input
        {...rest}
        type={visible ? 'text' : 'password'}
        className={className ? `auth-password-input ${className}` : 'auth-password-input'}
      />
      <button
        type="button"
        className="auth-password-toggle"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        <EyeIcon open={visible} />
      </button>
    </div>
  );
}