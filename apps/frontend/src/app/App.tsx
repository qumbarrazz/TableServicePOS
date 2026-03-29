import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { syncNow } from '../services/syncEngine';
import { LoginPage } from '../pages/LoginPage';
import { POSScreen } from '../pages/POSScreen';
import { FloorLayoutPage } from '../pages/FloorLayoutPage';
import { TableOrderPage } from '../pages/TableOrderPage';
import { CartPage } from '../pages/CartPage';
import { PaymentPage } from '../pages/PaymentPage';
import { KitchenDisplayPage } from '../pages/KitchenDisplayPage';
import { ReportsDashboardPage } from '../pages/ReportsDashboardPage';
import { SettingsPage } from '../pages/SettingsPage';

function AuthGate({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const online = useOnlineStatus();

  useEffect(() => {
    if (online) {
      void syncNow();
    }
  }, [online]);

  return (
    <BrowserRouter>
      <nav className="bg-white px-4 py-2 flex gap-3 text-sm overflow-auto">
        <Link to="/">POS</Link>
        <Link to="/floor-layout">Floor Layout</Link>
        <Link to="/table-order">Table Order</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/payment">Payment</Link>
        <Link to="/kitchen">Kitchen</Link>
        <Link to="/reports">Reports</Link>
        <Link to="/settings">Settings</Link>
      </nav>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<AuthGate><POSScreen /></AuthGate>} />
        <Route path="/floor-layout" element={<AuthGate><FloorLayoutPage /></AuthGate>} />
        <Route path="/table-order" element={<AuthGate><TableOrderPage /></AuthGate>} />
        <Route path="/cart" element={<AuthGate><CartPage /></AuthGate>} />
        <Route path="/payment" element={<AuthGate><PaymentPage /></AuthGate>} />
        <Route path="/kitchen" element={<AuthGate><KitchenDisplayPage /></AuthGate>} />
        <Route path="/reports" element={<AuthGate><ReportsDashboardPage /></AuthGate>} />
        <Route path="/settings" element={<AuthGate><SettingsPage /></AuthGate>} />
      </Routes>
      <div className="fixed bottom-2 right-2 text-xs bg-black text-white px-2 py-1 rounded">
        {online ? 'ONLINE' : 'OFFLINE'}
      </div>
    </BrowserRouter>
  );
}
