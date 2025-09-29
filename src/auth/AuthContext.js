// src/auth/AuthContext.js

import { createContext, useContext } from 'react';

// Tạo và export context
export const AuthContext = createContext(null);

// Tạo và export hook để sử dụng context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        // Đảm bảo hook này luôn được dùng bên trong AuthProvider
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
