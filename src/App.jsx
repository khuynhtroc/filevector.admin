import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductManager from './pages/ProductManager';
import DashboardLayout from './pages/DashboardLayout'; // Import layout mới
import { ProtectedRoute } from './auth/Auth.jsx';

function App() {
  return (
    <Routes>
      {/* Route công khai */}
      <Route path="/login" element={<Login />} />

      {/* Các route được bảo vệ sẽ nằm bên trong layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}> {/* Layout làm component cha */}
          <Route path="/" element={<Dashboard />} />
          <Route path="products" element={<ProductManager />} />
          {/* Ví dụ thêm trang quản lý đơn hàng */}
          {/* <Route path="orders" element={<OrderManager />} /> */}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
