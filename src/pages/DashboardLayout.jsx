import { Outlet, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../auth/Auth.jsx';

export default function DashboardLayout() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // AuthProvider sẽ tự động xử lý chuyển hướng về trang login
    };

    const layoutStyle = {
        display: 'flex',
        minHeight: '100vh',
        fontFamily: 'sans-serif'
    };

    const sidebarStyle = {
        width: '240px',
        background: '#f4f4f4',
        padding: '20px',
        borderRight: '1px solid #ddd'
    };

    const contentStyle = {
        flex: 1,
        padding: '20px'
    };

    const navLinkStyle = {
        display: 'block',
        padding: '10px',
        textDecoration: 'none',
        color: '#333',
        borderRadius: '4px',
        marginBottom: '5px'
    };

    return (
        <div style={layoutStyle}>
            <aside style={sidebarStyle}>
                <h3>Admin Menu</h3>
                <nav>
                    <Link to="/" style={navLinkStyle}>Dashboard</Link>
                    <Link to="/products" style={navLinkStyle}>Quản lý Sản phẩm</Link>
                    {/* Thêm các link khác ở đây */}
                </nav>
                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
                    <p>Welcome, {user?.email}</p>
                    <button onClick={handleLogout}>Đăng xuất</button>
                </div>
            </aside>
            <main style={contentStyle}>
                {/* Các trang con sẽ được render ở đây */}
                <Outlet />
            </main>
        </div>
    );
}
