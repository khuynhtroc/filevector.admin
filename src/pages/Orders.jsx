import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; 

// Import đầy đủ các component từ Material-UI
import {
    Typography,
    Box,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    Modal,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

// CSS style cho Modal pop-up chỉnh sửa
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
    // State để lưu danh sách đơn hàng
    const [orders, setOrders] = useState([]);
    // State để kiểm soát trạng thái loading
    const [loading, setLoading] = useState(true);
    // State để lưu trữ lỗi nếu có
    const [error, setError] = useState(null);

    // State quản lý việc mở/đóng Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    // State lưu trữ đơn hàng đang được chọn để sửa
    const [selectedOrder, setSelectedOrder] = useState(null);
    // State lưu trữ dữ liệu của form trong Modal
    const [editFormData, setEditFormData] = useState({
        status: '',
        discount: 0,
        discount_code: ''
    });

    // useEffect sẽ chạy một lần khi component được render
    useEffect(() => {
        fetchOrders();
    }, []);

    // Hàm chính để lấy dữ liệu đơn hàng từ Supabase
    async function fetchOrders() {
        setLoading(true);
        try {
            // Câu lệnh truy vấn để lấy tất cả các cột từ 'orders'
            // và join với các bảng liên quan để lấy thêm thông tin
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select(`
                    id,
                    created_at,
                    total_price,
                    status,
                    discount,
                    discount_code,
                    membership_plans ( name ), 
                    profiles ( username, email ) 
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

    // Hàm mở Modal và điền thông tin của đơn hàng được chọn
    const handleOpenModal = (order) => {
        setSelectedOrder(order);
        setEditFormData({
            status: order.status || 'pending',
            discount: order.discount || 0,
            discount_code: order.discount_code || ''
        });
        setIsModalOpen(true);
    };

    // Hàm đóng Modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    // Hàm cập nhật state của form khi người dùng nhập liệu
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    // Hàm xử lý khi nhấn nút "Lưu thay đổi" trên Modal
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
            // Tải lại danh sách đơn hàng để thấy thay đổi
            fetchOrders(); 
        } catch (err) {
            alert('Lỗi khi cập nhật: ' + err.message);
        }
    };

    // Hàm định dạng số thành tiền tệ VNĐ
    const formatCurrency = (num) => (num || 0).toLocaleString('vi-VN') + 'đ';
    // Hàm định dạng ngày giờ theo chuẩn Việt Nam
    const formatDateTime = (dt) => new Date(dt).toLocaleString('vi-VN');
    
    // Hàm trả về Chip màu tương ứng với trạng thái đơn hàng
    const getStatusChip = (status) => {
        switch (status) {
            case 'completed':
                return <Chip label="Hoàn thành" color="success" size="small" />;
            case 'pending':
                return <Chip label="Chờ xử lý" color="warning" size="small" />;
            case 'failed':
                return <Chip label="Thất bại" color="error" size="small" />;
            default:
                return <Chip label={status || 'N/A'} size="small" />;
        }
    };

    // Hiển thị vòng xoay loading khi đang tải dữ liệu
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    // Hiển thị thông báo lỗi nếu có
    if (error) return <Alert severity="error">{error}</Alert>;

    // Phần giao diện chính của component
    return (
        <Box>
            <Typography variant="h4" gutterBottom>Quản lý Đơn hàng</Typography>
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                            <TableCell>Mã ĐH</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell>Email Khách hàng</TableCell>
                            <TableCell>Sản phẩm</TableCell>
                            <TableCell align="right">Tổng tiền</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Ngày tạo</TableCell>
                            <TableCell align="center">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id} hover>
                                <TableCell>#{order.id}</TableCell>
                                <TableCell>{order.profiles?.username || 'N/A'}</TableCell>
                                <TableCell>{order.profiles?.email || 'Khách vãng lai'}</TableCell>
                                <TableCell>{order.membership_plans?.name || 'N/A'}</TableCell>
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

            {/* Modal chỉnh sửa đơn hàng */}
            <Modal open={isModalOpen} onClose={handleCloseModal}>
                <Box sx={style}>
                    <Typography variant="h6" component="h2">Chỉnh sửa Đơn hàng #{selectedOrder?.id}</Typography>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                            name="status"
                            value={editFormData.status}
                            label="Trạng thái"
                            onChange={handleFormChange}
                        >
                            <MenuItem value="pending">Chờ xử lý</MenuItem>
                            <MenuItem value="completed">Hoàn thành</MenuItem>
                            <MenuItem value="failed">Thất bại</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Mã giảm giá"
                        name="discount_code"
                        value={editFormData.discount_code}
                        onChange={handleFormChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
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
