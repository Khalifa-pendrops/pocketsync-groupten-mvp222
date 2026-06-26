import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import LinkAccounts from './pages/LinkAccounts';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import PayBills from './pages/PayBills';
import HelpSupport from './pages/HelpSupport';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="link-accounts" element={<LinkAccounts />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="pay-bills" element={<PayBills />} />
          <Route path="help-support" element={<HelpSupport />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
