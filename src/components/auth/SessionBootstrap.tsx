import { useEffect, type ReactNode } from 'react';
import { authService } from '../../services/authService';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setSessionChecked, setUser } from '../../store/slices/authSlice';
import { syncOnboardingStatus, tearDownSession } from '../../lib/authFlow';
import { loadPersistedUser } from '../../utils/session';
import './auth.css';

interface SessionBootstrapProps {
  children: ReactNode;
}

export default function SessionBootstrap({ children }: SessionBootstrapProps) {
  const dispatch = useAppDispatch();
  const sessionChecked = useAppSelector((state) => state.auth.sessionChecked);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await authService.refresh();
        const user = loadPersistedUser();

        if (!user) {
          await authService.logout().catch(() => undefined);
          tearDownSession(dispatch);
          return;
        }

        if (cancelled) {
          return;
        }

        dispatch(setUser(user));
        await syncOnboardingStatus(dispatch);
      } catch {
        tearDownSession(dispatch);
      } finally {
        if (!cancelled) {
          dispatch(setSessionChecked());
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  if (!sessionChecked) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-card">
          <span className="auth-spinner" aria-hidden="true" />
          <p>Loading PocketSync…</p>
        </div>
      </div>
    );
  }

  return children;
}