// src/pages/Users.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, CircularProgress, Alert, Chip
} from '@mui/material';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchUsersWithOrderData() {
            try {
                // Bước 1: Lấy tất cả user từ bảng profiles
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (profilesError) throw profilesError;

                // Bước 2: Lấy tất cả đơn hàng để xử lý
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select('user_id, total_price, status, membership_plans ( name )');

                if (ordersError) throw ordersError;

                // Bước 3: Xử lý và kết hợp dữ liệu bằng Javascript
                const usersWithStats = profilesData.map(profile => {
                    // Lọc ra các đơn hàng của user này
                    const userOrders = ordersData.filter(order => order.user_id === profile.id);
                    
                    // Lọc ra các đơn hàng VIP đã hoàn thành
                    const activeVipOrders = userOrders.filter(order => order.status === 'completed');
                    
                    // Tính tổng tiền đã chi tiêu
                    const totalSpent = userOrders.reduce((sum, order) => sum + order.total_price, 0);

                    // Tìm tên gói VIP đang hoạt động (lấy gói mới nhất)
                    let activePlanName = 'Chưa có';
                    if (activeVipOrders.length > 0) {
                        // Giả sử gói mới nhất là gói đang hoạt động
                        activePlanName = activeVipOrders[0].membership_plans?.name || 'Gói không tên';
                    }

                    return {
                        ...profile, // Giữ lại toàn bộ thông tin gốc của profile
                        order_count: userOrders.length, // Tổng số đơn hàng đã tạo
                        total_spent: totalSpent, // Tổng tiền đã chi
                        active_plan: activePlanName, // Tên gói VIP
                    };
                });

                setUsers(usersWithStats);

            } catch (err) {
                setError('Không thể tải danh sách người dùng. Lỗi: ' + err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchUsersWithOrderData();
    }, []);

    // Hàm định dạng tiền tệ
    const formatCurrency = (num) => (num || 0).toLocaleString('vi-VN') + 'đ';

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Quản lý Người dùng</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Email</TableCell>
                            <TableCell>Tên đầy đủ</TableCell>
                            <TableCell>Vai trò</TableCell>
                            <TableCell>Số đơn hàng</TableCell>
                            <TableCell>Tổng chi tiêu</TableCell>
                            <TableCell>Gói VIP</TableCell>
                            <TableCell>Ngày tham gia</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell><strong>{user.email || 'Chưa có email'}</strong></TableCell>
                                <TableCell>{user.full_name || 'Chưa cập nhật'}</TableCell>
                                <TableCell>
                                    {user.role === 'admin' ? <Chip label="Admin" color="secondary" size="small" /> : <Chip label="User" color="default" size="small" />}
                                </TableCell>
                                <TableCell>{user.order_count}</TableCell>
                                <TableCell>{formatCurrency(user.total_spent)}</TableCell>
                                <TableCell>{user.active_plan}</TableCell>
                                <TableCell>
                                    {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'Không rõ'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
