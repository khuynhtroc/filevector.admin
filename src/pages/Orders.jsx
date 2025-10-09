import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; 

// Import các component cần thiết, bao gồm cả Modal và các trường Form
import {
    Typography, Box, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
    Button, Modal, TextField, Select, MenuItem, FormControl, InputLabel, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; // Icon cho nút sửa

// --- STYLE CHO MODAL --- (Giữ nguyên)
const style = { /* ... giữ nguyên style cũ ... */ };

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State cho Modal chỉnh sửa ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editFormData, setEditFormData] = useState({ status: '', discount: 0, discount_code: '' });

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        try {
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select('*, membership_plans(name), profiles(email)')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setOrders(data || []);
        } catch (err) {
            setError('Lỗi: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    // --- CÁC HÀM XỬ LÝ MODAL --- (Giữ nguyên logic)
    const handleOpenModal = (order) => { /* ... giữ nguyên code cũ ... */ };
    const handleCloseModal = () => { /* ... giữ nguyên code cũ ... */ };
    const handleFormChange = (e) => { /* ... giữ nguyên code cũ ... */ };
    const handleSaveChanges = async () => { /* ... giữ nguyên code cũ, chỉ sửa lại các trường update ... */
        // ...
        const { error: updateError } = await supabase
            .from('orders')
            .update({ 
                status: editFormData.status, 
                discount: parseFloat(editFormData.discount),
                discount_code: editFormData.discount_code
            })
            .eq('id', selectedOrder.id);
        // ...
    };

    // --- CÁC HÀM FORMAT ---
    const formatCurrency = (num) => (num || 0).toLocaleString('vi-VN') + 'đ';
    const formatDateTime = (dt) => new Date(dt).toLocaleString('vi-VN');
    const getStatusChip = (status) => { /* ... giữ nguyên code cũ ... */ };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Quản lý Đơn hàng</Typography>
            
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="orders table">
                    <TableHead>
                        <TableRow sx={{ '& > th': { fontWeight: 'bold' } }}>
                            <TableCell>Sản phẩm</TableCell>
                            <TableCell>Email Khách hàng</TableCell>
                            <TableCell align="right">Tổng tiền</TableCell>
                            <TableCell>Trạng thái</TableCell> {/* Đã có lại */}
                            <TableCell>Ngày tạo</TableCell>
                            <TableCell align="center">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id} hover>
                                <TableCell>{order.membership_plans?.name || 'Sản phẩm đã bị xóa'}</TableCell>
                                <TableCell>{order.profiles?.email || 'Khách vãng lai'}</TableCell>
                                <TableCell align="right">{formatCurrency(order.total_price)}</TableCell>
                                
                                {/* DÒNG BỊ THIẾU ĐÃ ĐƯỢC BỔ SUNG LẠI */}
                                <TableCell>{getStatusChip(order.status)}</TableCell>
                                
                                <TableCell>{formatDateTime(order.created_at)}</TableCell>
                                <TableCell align="center">
                                    <IconButton size="small" onClick={() => handleOpenModal(order)}>
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>


            {/* --- MODAL CHỈNH SỬA --- */}
            <Modal open={isModalOpen} onClose={handleCloseModal}>
                <Box sx={style}>
                    <Typography variant="h6">Chỉnh sửa Đơn hàng #{selectedOrder?.id}</Typography>
                    {/* ... các FormControl và TextField cho status, discount, discount_code ... */}
                    <TextField fullWidth margin="normal" label="Mã giảm giá" name="discount_code" value={editFormData.discount_code} onChange={handleFormChange}/>
                    {/* ... */}
                </Box>
            </Modal>
        </Box>
    );
}
