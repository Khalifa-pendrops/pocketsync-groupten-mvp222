import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './otp.css';

function OtpShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.25 4.5 5.75v5.5c0 4.95 3.4 9.2 7.5 10.5 4.1-1.3 7.5-5.55 7.5-10.5v-5.5L12 2.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9.25 10.5V9a2.75 2.75 0 0 1 5.5 0v1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="9"
        y="10.5"
        width="6"
        height="4.75"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

interface OtpLayoutProps {
  backTo: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function OtpLayout({ backTo, title, subtitle, children }: OtpLayoutProps) {
  return (
    <div className="otp-page">
      <div className="otp-card">
        <Link to={backTo} className="otp-back">
          ← Back
        </Link>

        <div className="otp-icon-wrap">
          <OtpShieldIcon />
        </div>

        <header className="otp-header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>

        {children}
      </div>
    </div>
  );
}