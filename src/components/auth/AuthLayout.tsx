import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import logoSvg from '../../assets/icons/logo.svg';
import './auth.css';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img src={logoSvg} alt="PocketSync" width="36" height="38" />
          <span>PocketSync</span>
        </div>

        <header className="auth-header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>

        {children}

        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  );
}

interface AuthLinkProps {
  to: string;
  state?: Record<string, unknown>;
  children: ReactNode;
}

export function AuthLink({ to, state, children }: AuthLinkProps) {
  return (
    <Link to={to} state={state} className="auth-link">
      {children}
    </Link>
  );
}