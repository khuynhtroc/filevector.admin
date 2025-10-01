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
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Lấy danh sách gói
    const { data: plansData, error: planErr } = await supabase.from('membership_plans').select('*');
    if (planErr) {
      setError(planErr.message);
      setLoading(false);
      return;
    }
    setPlans(plansData);

    // Lấy số lượng user active cho từng plan
    let counts = {};
    for (const plan of plansData) {
      const { count } = await supabase
        .from('members')  // bảng member lưu user gói nào
        .select('id', { count: 'exact', head: true })
        .eq('plan_id', plan.id)
        .eq('status', 'active');
      counts[plan.id] = count;
    }
    setMembersCount(counts);

    setLoading(false);
  };

  // Hiển thị danh sách user trong modal khi click số lượng
  const showUsersInPlan = async (planId) => {
    setModalOpen(true);
    setSelectedUsers(null);  // Hiệu ứng loading
    const { data, error } = await supabase
      .from('members')
      .select('user_id, profiles ( email, full_name, created_at )')
      .eq('plan_id', planId)
      .eq('status', 'active');

    if (error) setSelectedUsers([]);
    else setSelectedUsers(data || []);
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
              <TableCell>Tên Gói</TableCell>
              <TableCell align="right">Giá</TableCell>
              <TableCell align="center">Thời hạn (ngày)</TableCell>
              <TableCell align="center">Số lượng user</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map(plan => (
              <TableRow hover key={plan.id}>
                <TableCell><strong>{plan.name}</strong></TableCell>
                <TableCell align="right">{plan.price?.toLocaleString()} đ</TableCell>
                <TableCell align="center">{plan.duration_days ?? 'Vĩnh viễn'}</TableCell>
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
            Danh sách người dùng trong gói
          </Typography>
          {selectedUsers === null && <CircularProgress />}
          {Array.isArray(selectedUsers) && selectedUsers.length === 0 && <Typography>Chưa có người dùng nào.</Typography>}
          {Array.isArray(selectedUsers) && selectedUsers.length > 0 && (
            <Table size="small">
              <TableBody>
                {selectedUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>{user.profiles?.email || 'N/A'}</TableCell>
                    <TableCell>{user.profiles?.full_name || 'Chưa cập nhật'}</TableCell>
                    <TableCell>{user.profiles?.created_at ? new Date(user.profiles.created_at).toLocaleDateString('vi-VN') : 'Không rõ'}</TableCell>
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
