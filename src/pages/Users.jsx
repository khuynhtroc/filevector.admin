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
            setLoading(true);
            try {
                // === ĐOẠN SỬA LỖI QUAN TRỌNG NHẤT ===
                // Dùng câu lệnh select lồng nhau để Supabase tự join và tính toán
                // Đồng thời chỉ định rõ khóa ngoại để không bị lỗi
                const { data, error: fetchError } = await supabase
                    .from('profiles')
                    .select(`
                        id,
                        created_at,
                        email,
                        full_name,
                        role,
                        orders (
                            total_price,
                            status,
                            plan:membership_plans!orders_plan_id_fkey ( name )
                        )
                    `)
                    .order('created_at', { ascending: false });

                if (fetchError) {
                    throw fetchError;
                }

                // Xử lý dữ liệu trả về ngay trên client
                const processedUsers = (data || []).map(user => {
                    const totalSpent = user.orders.reduce((sum, order) => sum + order.total_price, 0);
                    const activeVipOrders = user.orders.filter(order => order.status === 'completed' && order.plan);
                    
                    // Lấy tên của gói VIP mới nhất đã hoàn thành
                    const activePlanName = activeVipOrders.length > 0 
                        ? activeVipOrders[activeVipOrders.length - 1].plan.name 
                        : 'Chưa có';

                    return {
                        ...user,
                        order_count: user.orders.length,
                        total_spent: totalSpent,
                        active_plan: activePlanName,
                    };
                });

                setUsers(processedUsers);

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
