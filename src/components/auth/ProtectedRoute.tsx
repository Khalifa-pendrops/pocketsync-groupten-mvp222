import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import './auth.css';

interface ProtectedRouteProps {
  requireOnboardingComplete?: boolean;
}

export default function ProtectedRoute({ requireOnboardingComplete = true }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, onboardingComplete } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (onboardingComplete === null) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-card">
          <span className="auth-spinner" aria-hidden="true" />
          <p>Preparing your account…</p>
        </div>
      </div>
    );
  }

  if (requireOnboardingComplete) {
    if (onboardingComplete === false) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Outlet />;
  }

  if (onboardingComplete) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}