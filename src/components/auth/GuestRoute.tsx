import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import './auth.css';

export default function GuestRoute() {
  const location = useLocation();
  const { isAuthenticated, onboardingComplete } = useAppSelector((state) => state.auth);

  if (isAuthenticated && onboardingComplete === null) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-card">
          <span className="auth-spinner" aria-hidden="true" />
          <p>Preparing your account…</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    const destination = onboardingComplete ? '/' : '/onboarding';
    return <Navigate to={destination} replace state={{ from: location }} />;
  }

  return <Outlet />;
}