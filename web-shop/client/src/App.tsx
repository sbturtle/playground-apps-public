import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { Notifications } from './pages/Notifications';
import { OrderDetail } from './pages/OrderDetail';
import { OrderList } from './pages/OrderList';
import { ShipmentTracking } from './pages/ShipmentTracking';

export function App() {
  return (
    <>
      <nav>
        <NavLink to="/orders">주문 내역</NavLink>
        <NavLink to="/notifications">알림</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/orders" replace />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/:orderId" element={<OrderDetail />} />
        <Route path="/shipments/:shipmentId" element={<ShipmentTracking />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </>
  );
}
