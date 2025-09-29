import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductManager from './pages/ProductManager';
import DashboardLayout from './pages/DashboardLayout'; // Import layout mới
import { ProtectedRoute } from './auth/Auth.jsx';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Memberships from './pages/Memberships';
import Reports from './pages/Reports';



function App() {
  return (
    <Routes>
      {/* Route công khai */}
      <Route path="/login" element={<Login />} />

      {/* Các route được bảo vệ sẽ nằm bên trong layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}> {/* Layout làm component cha */}
          <Route path="/" element={<Dashboard />} />
          <Route path="reports" element={<Reports />} /> {/* Thêm dòng này */}
          <Route path="orders" element={<Orders />} /> {/* Thêm dòng này */}
          <Route path="products" element={<ProductManager />} />
          <Route path="users" element={<Users />} /> {/* Thêm dòng này */}
          <Route path="memberships" element={<Memberships />} /> {/* Thêm dòng này */}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
