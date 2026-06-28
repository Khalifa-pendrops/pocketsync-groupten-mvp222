import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import AuthMarketingPanel from './AuthMarketingPanel';
import './auth.css';

const MOBILE_BREAKPOINT = 768;
const INTRO_DELAY_MS = 2500;
const INTRO_FADE_MS = 600;

function getInitialIntroPhase(): 'pending' | 'fading' | 'done' {
  if (typeof window === 'undefined') {
    return 'pending';
  }

  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches ? 'pending' : 'done';
}

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const [introPhase, setIntroPhase] = useState<'pending' | 'fading' | 'done'>(getInitialIntroPhase);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

    function skipIntro() {
      setIntroPhase('done');
    }

    if (!mq.matches) {
      skipIntro();
      return;
    }

    const fadeTimer = window.setTimeout(() => setIntroPhase('fading'), INTRO_DELAY_MS);
    const doneTimer = window.setTimeout(
      () => setIntroPhase('done'),
      INTRO_DELAY_MS + INTRO_FADE_MS,
    );

    const onChange = (event: MediaQueryListEvent) => {
      if (!event.matches) {
        window.clearTimeout(fadeTimer);
        window.clearTimeout(doneTimer);
        skipIntro();
      }
    };

    mq.addEventListener('change', onChange);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
      mq.removeEventListener('change', onChange);
    };
  }, []);

  const introClass =
    introPhase === 'done'
      ? 'auth-intro-complete'
      : introPhase === 'fading'
        ? 'auth-intro-fading'
        : 'auth-intro-pending';

  return (
    <div className="auth-page">
      <div className={`auth-split ${introClass}`}>
        <AuthMarketingPanel />

        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <header className="auth-header">
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </header>

            {children}

            {footer && <div className="auth-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="auth-link">
      {children}
    </Link>
  );
}

export function AuthDangerLink({
  to,
  children,
  state,
}: {
  to: string;
  children: ReactNode;
  state?: unknown;
}) {
  return (
    <Link to={to} state={state} className="auth-link auth-link--danger">
      {children}
    </Link>
  );
}