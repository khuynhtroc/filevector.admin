import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// Import thêm các component cần thiết cho Modal và Form
import {
    Typography, Box, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
    Button, Modal, TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

// --- STYLE CHO MODAL ---
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State cho Modal chỉnh sửa ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editFormData, setEditFormData] = useState({ status: '', discount: 0 });

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        try {
            // Lấy thêm user_id để tìm email
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select('*, membership_plans(name), profiles(email)') // Lấy tất cả và join
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
            discount: order.discount || 0
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
                    discount: parseFloat(editFormData.discount) 
                })
                .eq('id', selectedOrder.id);

            if (updateError) throw updateError;

            alert('Cập nhật thành công!');
            handleCloseModal();
            // Tải lại danh sách đơn hàng để cập nhật giao diện
            setLoading(true);
            fetchOrders();

        } catch (err) {
            alert('Lỗi khi cập nhật: ' + err.message);
        }
    };

    // Các hàm format và hiển thị (giữ nguyên)
    const formatCurrency = (num) => (num || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    const getStatusChip = (status) => { /* ... giữ nguyên code cũ ... */ };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Quản lý Đơn hàng</Typography>
            
            {/* --- BẢNG ĐƠN HÀNG --- */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            {/* ... các TableCell tiêu đề khác ... */}
                            <TableCell sx={{ fontWeight: 'bold' }}>Hành động</TableCell> {/* THÊM CỘT MỚI */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id} hover>
                                <TableCell>{order.membership_plans?.name || 'N/A'}</TableCell>
                                <TableCell>{order.profiles?.email || 'Khách vãng lai'}</TableCell>
                                {/* ... các TableCell dữ liệu khác ... */}
                                <TableCell> {/* THÊM NÚT SỬA */}
                                    <Button variant="outlined" size="small" onClick={() => handleOpenModal(order)}>
                                        Sửa
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* --- MODAL CHỈNH SỬA --- */}
            <Modal open={isModalOpen} onClose={handleCloseModal}>
                <Box sx={style}>
                    <Typography variant="h6" component="h2">Chỉnh sửa Đơn hàng #{selectedOrder?.id}</Typography>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Trạng thái</InputLabel>
                        <Select name="status" value={editFormData.status} label="Trạng thái" onChange={handleFormChange}>
                            <MenuItem value="pending">Chờ xử lý</MenuItem>
                            <MenuItem value="completed">Hoàn thành</MenuItem>
                            <MenuItem value="failed">Thất bại</MenuItem>
                            <MenuItem value="cancelled">Đã hủy</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth margin="normal"
                        label="Giảm giá (VND)"
                        name="discount"
                        type="number"
                        value={editFormData.discount}
                        onChange={handleFormChange}
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={handleCloseModal} sx={{ mr: 1 }}>Hủy</Button>
                        <Button variant="contained" onClick={handleSaveChanges}>Lưu thay đổi</Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}
