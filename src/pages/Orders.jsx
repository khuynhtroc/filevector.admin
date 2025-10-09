import React, { useEffect, useState } from 'react';
// Đảm bảo đường dẫn đến supabaseClient là chính xác
import { supabase } from '../supabaseClient'; 

// Import các component từ MUI
import {
    Typography, Box, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip
} from '@mui/material';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchOrders() {
            try {
                // Sửa lỗi 1: Truy vấn đến đúng bảng `membership_plans`
                // Sửa lỗi 2: Lấy đúng cột `total_price` thay vì `amount`
                const { data, error: fetchError } = await supabase
                    .from('orders')
                    .select(`
                        id,
                        created_at,
                        total_price, 
                        status,
                        profiles ( email ),
                        membership_plans ( name ) 
                    `)
                    .order('created_at', { ascending: false });

                if (fetchError) {
                    throw fetchError;
                }
                setOrders(data || []);
            } catch (err) {
                // Hiển thị thông báo lỗi thân thiện hơn
                setError('Không thể tải danh sách đơn hàng. Lỗi: ' + err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    const formatCurrency = (num) => (num || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    const getStatusChip = (status) => {
        switch (status) {
            case 'completed':
                return <Chip label="Hoàn thành" color="success" size="small" />;
            case 'pending':
                return <Chip label="Chờ xử lý" color="warning" size="small" />;
            case 'failed':
            case 'cancelled':
                return <Chip label="Thất bại" color="error" size="small" />;
            default:
                return <Chip label={status || 'Không rõ'} size="small" />;
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quản lý Đơn hàng
            </Typography>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="orders table">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Sản phẩm</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email Khách hàng</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Tổng tiền</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Ngày tạo</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id} hover>
                                <TableCell component="th" scope="row">
                                    {/* Sửa lỗi 3: Hiển thị tên gói VIP từ `membership_plans` */}
                                    {order.membership_plans?.name || 'Sản phẩm không xác định'}
                                </TableCell>
                                <TableCell>{order.profiles?.email || 'Khách vãng lai'}</TableCell>
                                <TableCell align="right">{formatCurrency(order.total_price)}</TableCell>
                                <TableCell>{getStatusChip(order.status)}</TableCell>
                                <TableCell>{new Date(order.created_at).toLocaleString('vi-VN')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
