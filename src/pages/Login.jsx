import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../auth/Auth.jsx'; // Đảm bảo import từ Auth.jsx
import { Navigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Sửa lỗi ở đây: Kiểm tra sự tồn tại của auth context trước khi sử dụng
    const auth = useAuth();

    // Nếu context chưa sẵn sàng, hiển thị thông báo chờ
    if (!auth) {
        return <div>Auth context is not available. Check your component tree.</div>;
    }

    const { user, isAdmin } = auth;

    // Nếu đã đăng nhập và là admin, tự động chuyển hướng
    if (user && isAdmin) {
        return <Navigate to="/" replace />;
    }
    
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            setError('Email hoặc mật khẩu không đúng.');
        }
        // Nếu đăng nhập thành công, AuthProvider sẽ tự động xử lý và redirect
        
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd' }}>
            <h2 style={{ textAlign: 'center' }}>Admin Dashboard Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    style={{ width: '100%', padding: '10px', marginBottom: '15px', boxSizing: 'border-box' }}
                />
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ width: '100%', padding: '12px', cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? 'Đang đăng nhập...' : 'Login'}
                </button>
                {error && <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{error}</p>}
            </form>
        </div>
    );
}
