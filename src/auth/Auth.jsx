import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { Navigate, Outlet } from 'react-router-dom';

// Tạo Context để chứa thông tin xác thực
const AuthContext = createContext(null);

// Component chính cung cấp thông tin Auth cho toàn bộ ứng dụng
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true); // Bắt đầu với trạng thái loading

    useEffect(() => {
        const checkUser = async () => {
            // Lấy thông tin session hiện tại
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user;

            if (currentUser) {
                setUser(currentUser);
                // Nếu có người dùng, kiểm tra vai trò admin
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', currentUser.id)
                    .single();
                
                setIsAdmin(profile?.is_admin || false);
            } else {
                // Nếu không có session, reset trạng thái
                setUser(null);
                setIsAdmin(false);
            }
            // Dù có lỗi hay không, cũng phải kết thúc loading
            setLoading(false);
        };

        // Chạy kiểm tra lần đầu khi component được mount
        checkUser();

        // Lắng nghe các sự kiện đăng nhập/đăng xuất
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsAdmin(false);
            } else if (session) {
                checkUser(); // Khi có sự kiện đăng nhập, chạy lại kiểm tra
            }
        });

        // Dọn dẹp listener khi component bị unmount
        return () => {
            subscription.unsubscribe();
        };
    }, []);
    
    const value = { user, isAdmin, loading };

    // Chỉ render children (tức là <App />) sau khi đã kiểm tra xong
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook tùy chỉnh để sử dụng context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// Component bảo vệ route
export const ProtectedRoute = () => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) {
        return <div>Checking authentication...</div>; // Hiển thị thông báo chờ
    }

    if (!user || !isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
