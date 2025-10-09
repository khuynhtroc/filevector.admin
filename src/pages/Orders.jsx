import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; 

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
                // *** SỬA LỖI QUAN TRỌNG NHẤT ***
                // Chỉ định rõ ràng mối quan hệ: profiles!user_id
                // Điều này nói cho Supabase: "Hãy join với bảng 'profiles' thông qua cột 'user_id' của bảng 'orders'"
                const { data, error: fetchError } = await supabase
                    .from('orders')
                    .select(`
                        id,
                        created_at,
                        total_price, 
                        status,
                        profiles:user_id ( email ), 
                        membership_plans ( name ) 
                    `)
                    .order('created_at', { ascending: false });

                if (fetchError) {
                    throw fetchError;
                }
                setOrders(data || []);
            } catch (err) {
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
            case 'completed': return <Chip label="Hoàn thành" color="success" size="small" />;
            case 'pending': return <Chip label="Chờ xử lý" color="warning" size="small" />;
            default: return <Chip label={status || 'Không rõ'} size="small" />;
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
                                    {order.membership_plans?.name || 'Sản phẩm không xác định'}
                                </TableCell>
                                <TableCell>
                                    {/* Sửa lại cách truy cập email sau khi đã chỉ định rõ quan hệ */}
                                    {order.profiles?.email || 'Khách vãng lai'}
                                </TableCell>
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
