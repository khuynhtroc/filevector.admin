import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Alert,
  Button, Modal
} from '@mui/material';

export default function Memberships() {
  const [plans, setPlans] = useState([]);
  const [membersCount, setMembersCount] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
        // 1. Lấy danh sách tất cả các gói từ `membership_plans`
        const { data: plansData, error: planErr } = await supabase
            .from('membership_plans')
            .select('*')
            .order('price', { ascending: true });
        
        if (planErr) throw planErr;
        setPlans(plansData || []);

        // 2. Với mỗi gói, đếm số lượng đơn hàng có trạng thái "completed"
        let counts = {};
        for (const plan of plansData) {
            const { count, error: countError } = await supabase
                .from('orders') // Sửa lại: Đếm từ bảng `orders`
                .select('id', { count: 'exact', head: true })
                .eq('plan_id', plan.id)
                .eq('status', 'completed'); // Chỉ đếm các thành viên đã thanh toán thành công
            
            if (countError) {
                console.error(`Lỗi khi đếm thành viên cho gói ${plan.id}:`, countError);
                counts[plan.id] = 0;
            } else {
                counts[plan.id] = count;
            }
        }
        setMembersCount(counts);

    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  // Hiển thị danh sách user trong modal khi click vào số lượng
  const showUsersInPlan = async (planId) => {
    setModalOpen(true);
    setSelectedUsers(null);  // Hiệu ứng loading
    try {
        // Lấy danh sách user đã mua gói này và có trạng thái "completed"
        const { data, error: usersError } = await supabase
            .from('orders') // Sửa lại: Lấy từ bảng `orders`
            .select('user_id, profiles ( email, full_name, created_at )')
            .eq('plan_id', planId)
            .eq('status', 'completed');

        if (usersError) throw usersError;
        setSelectedUsers(data || []);

    } catch (err) {
        alert('Lỗi khi tải danh sách người dùng: ' + err.message);
        setSelectedUsers([]);
    }
  };

  const handleClose = () => setModalOpen(false);

  if (loading) return <Box p={4} textAlign="center"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Quản lý Gói Thành viên
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Tên Gói</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Giá</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Thời hạn (tháng)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Số lượng user (active)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map(plan => (
              <TableRow hover key={plan.id}>
                <TableCell><strong>{plan.name}</strong></TableCell>
                <TableCell align="right">{plan.price?.toLocaleString()} đ</TableCell>
                <TableCell align="center">{plan.duration_months ?? 'Vĩnh viễn'}</TableCell> 
                <TableCell align="center">
                  <Button variant="text" onClick={() => showUsersInPlan(plan.id)}>
                    {membersCount[plan.id] ?? 0}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal hiển thị danh sách user */}
      <Modal open={modalOpen} onClose={handleClose} aria-labelledby="modal-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, width: 600, maxHeight: '80vh', overflowY: 'auto' }}>
          <Typography id="modal-title" variant="h6" gutterBottom>
            Danh sách người dùng đang hoạt động
          </Typography>
          {selectedUsers === null && <CircularProgress />}
          {Array.isArray(selectedUsers) && selectedUsers.length === 0 && <Typography>Chưa có người dùng nào đang hoạt động trong gói này.</Typography>}
          {Array.isArray(selectedUsers) && selectedUsers.length > 0 && (
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Email</TableCell>
                        <TableCell>Tên hiển thị</TableCell>
                        <TableCell>Ngày tham gia</TableCell>
                    </TableRow>
                </TableHead>
              <TableBody>
                {selectedUsers.map((order) => (
                  <TableRow key={order.user_id}>
                    <TableCell>{order.profiles?.email || 'N/A'}</TableCell>
                    <TableCell>{order.profiles?.full_name || 'Chưa cập nhật'}</TableCell>
                    <TableCell>{order.profiles?.created_at ? new Date(order.profiles.created_at).toLocaleDateString('vi-VN') : 'Không rõ'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
