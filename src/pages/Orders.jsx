import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; 

// Import đầy đủ các component cần thiết
import {
    Typography, Box, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
    Button, Modal, TextField, Select, MenuItem, FormControl, InputLabel, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

// Style cho Modal (không thay đổi)
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editFormData, setEditFormData] = useState({
        status: '',
        discount: 0,
        discount_code: ''
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select('*, membership_plans(name), profiles(email)')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setOrders(data || []);
        } catch (err) {
            setError('Không thể tải danh sách đơn hàng. Lỗi: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    // --- CÁC HÀM XỬ LÝ MODAL ---
    const handleOpenModal = (order) => {
        setSelectedOrder(order);
        setEditFormData({
            status: order.status || 'pending',
            discount: order.discount || 0,
            discount_code: order.discount_code || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        if (!selectedOrder) return;
        
        try {
            const { error: updateError } = await supabase
                .from('orders')
                .update({ 
                    status: editFormData.status, 
                    discount: parseFloat(editFormData.discount) || 0,
                    discount_code: editFormData.discount_code
                })
                .eq('id', selectedOrder.id);

            if (updateError) throw updateError;

            alert('Cập nhật thành công!');
            handleCloseModal();
            fetchOrders(); // Tải lại dữ liệu sau khi cập nhật
        } catch (err) {
            alert('Lỗi khi cập nhật: ' + err.message);
        }
    };

    // --- CÁC HÀM FORMAT ---
    const formatCurrency = (num) => (num || 0).toLocaleString('vi-VN') + 'đ';
    const formatDateTime = (dt) => new Date(dt).toLocaleString('vi-VN');
    
    const getStatusChip = (status) => {
        switch (status) {
            case 'completed': return <Chip label="Hoàn thành" color="success" size="small" />;
            case 'pending': return <Chip label="Chờ xử lý" color="warning" size="small" />;
            default: return <Chip label={status || 'N/A'} size="small" />;
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Quản lý Đơn hàng</Typography>
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                            <TableCell>Sản phẩm</TableCell>
                            <TableCell>Email Khách hàng</TableCell>
                            <TableCell align="right">Tổng tiền</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Ngày tạo</TableCell>
                            <TableCell align="center">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id} hover>
                                <TableCell>{order.membership_plans?.name || 'N/A'}</TableCell>
                                <TableCell>{order.profiles?.email || 'Khách vãng lai'}</TableCell>
                                <TableCell align="right">{formatCurrency(order.total_price)}</TableCell>
                                <TableCell>{getStatusChip(order.status)}</TableCell>
                                <TableCell>{formatDateTime(order.created_at)}</TableCell>
                                <TableCell align="center">
                                    <IconButton size="small" onClick={() => handleOpenModal(order)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal open={isModalOpen} onClose={handleCloseModal}>
                <Box sx={style}>
                    <Typography variant="h6" component="h2">Chỉnh sửa Đơn hàng #{selectedOrder?.id}</Typography>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Trạng thái</InputLabel>
                        <Select name="status" value={editFormData.status} label="Trạng thái" onChange={handleFormChange}>
                            <MenuItem value="pending">Chờ xử lý</MenuItem>
                            <MenuItem value="completed">Hoàn thành</MenuItem>
                            <MenuItem value="failed">Thất bại</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField fullWidth margin="normal" label="Mã giảm giá" name="discount_code" value={editFormData.discount_code} onChange={handleFormChange} />
                    <TextField fullWidth margin="normal" label="Giảm giá (VND)" name="discount" type="number" value={editFormData.discount} onChange={handleFormChange} />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={handleCloseModal} sx={{ mr: 1 }}>Hủy</Button>
                        <Button variant="contained" onClick={handleSaveChanges}>Lưu thay đổi</Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}
