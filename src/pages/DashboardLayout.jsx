import { Outlet, NavLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../auth/Auth.jsx';

export default function DashboardLayout() {
    const { user } = useAuth();
    const handleLogout = async () => await supabase.auth.signOut();

    const navLinkStyle = ({ isActive }) => ({
        display: 'block',
        padding: '10px 15px',
        textDecoration: 'none',
        color: isActive ? 'white' : '#adb5bd',
        background: isActive ? '#007bff' : 'transparent',
        borderRadius: '5px',
        marginBottom: '5px'
    });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <aside style={{ width: '250px', background: '#343a40', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ textAlign: 'center', borderBottom: '1px solid #495057', paddingBottom: '15px' }}>FileVector</h2>
                <nav style={{ flex: 1 }}>
                    <NavLink to="/" style={navLinkStyle}>Dashboard</NavLink>
                    <NavLink to="/products" style={navLinkStyle}>Quản lý Sản phẩm</NavLink>
                    {/* Thêm các link khác ở đây, ví dụ: */}
                    {/* <NavLink to="/orders" style={navLinkStyle}>Quản lý Đơn hàng</NavLink> */}
                    {/* <NavLink to="/users" style={navLinkStyle}>Quản lý Người dùng</NavLink> */}
                </nav>
                <div>
                    <p style={{ fontSize: '14px', color: '#adb5bd' }}>Welcome,</p>
                    <p style={{ wordBreak: 'break-all' }}>{user?.email}</p>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        Đăng xuất
                    </button>
                </div>
            </aside>
            <main style={{ flex: 1, padding: '30px', background: '#f8f9fa' }}>
                <Outlet />
            </main>
        </div>
    );
}
