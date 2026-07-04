import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './auth/AuthContext';
import Dashboard from './pages/Dashboard';
import DriverApprovals from './pages/DriverApprovals';
import Drivers from './pages/Drivers';
import FareConfig from './pages/FareConfig';
import Login from './pages/Login';
import PaymentCheckout from './pages/PaymentCheckout';
import Settings from './pages/Settings';
import SubscriptionPlans from './pages/SubscriptionPlans';
import Subscriptions from './pages/Subscriptions';

export default function App() {
  const { token } = useAuth();

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="approvals" element={<DriverApprovals />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="plans" element={<SubscriptionPlans />} />
        <Route path="fares" element={<FareConfig />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="payment-test" element={<PaymentCheckout />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
