import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import GuestRoute from './components/auth/GuestRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SessionBootstrap from './components/auth/SessionBootstrap';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Onboarding from './pages/onboarding/Onboarding';
import Dashboard from './pages/Dashboard';
const LinkAccounts = lazy(() => import('./pages/LinkAccounts'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Analytics = lazy(() => import('./pages/Analytics'));
const PayBills = lazy(() => import('./pages/PayBills'));
const HelpSupport = lazy(() => import('./pages/HelpSupport'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <BrowserRouter>
      <SessionBootstrap>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          <Route element={<ProtectedRoute requireOnboardingComplete={false} />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          <Route element={<ProtectedRoute requireOnboardingComplete />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="link-accounts" element={<Suspense fallback={null}><LinkAccounts /></Suspense>} />
              <Route path="transactions" element={<Suspense fallback={null}><Transactions /></Suspense>} />
              <Route path="analytics" element={<Suspense fallback={null}><Analytics /></Suspense>} />
              <Route path="pay-bills" element={<Suspense fallback={null}><PayBills /></Suspense>} />
              <Route path="help-support" element={<Suspense fallback={null}><HelpSupport /></Suspense>} />
              <Route path="settings" element={<Suspense fallback={null}><Settings /></Suspense>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SessionBootstrap>
    </BrowserRouter>
  );
}

export default App;