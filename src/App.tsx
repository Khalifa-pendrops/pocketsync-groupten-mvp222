import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const LinkAccounts = lazy(() => import('./pages/LinkAccounts'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Analytics = lazy(() => import('./pages/Analytics'));
const PayBills = lazy(() => import('./pages/PayBills'));
const HelpSupport = lazy(() => import('./pages/HelpSupport'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Suspense fallback={null}><Dashboard /></Suspense>} />
          <Route path="link-accounts" element={<Suspense fallback={null}><LinkAccounts /></Suspense>} />
          <Route path="transactions" element={<Suspense fallback={null}><Transactions /></Suspense>} />
          <Route path="analytics" element={<Suspense fallback={null}><Analytics /></Suspense>} />
          <Route path="pay-bills" element={<Suspense fallback={null}><PayBills /></Suspense>} />
          <Route path="help-support" element={<Suspense fallback={null}><HelpSupport /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={null}><Settings /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
