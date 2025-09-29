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
        async function fetchUsers() {
            try {
                // Lấy tất cả user từ bảng profiles
                const { data, error } = await supabase.from('profiles').select('*');
                if (error) throw error;
                setUsers(data || []);
            } catch (err) {
                setError('Không thể tải danh sách người dùng. Lỗi: ' + err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

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
                            <TableCell>Ngày tham gia</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell><strong>{user.email || 'Chưa có email'}</strong></TableCell>
                                <TableCell>{user.full_name || 'Chưa cập nhật'}</TableCell>
                                <TableCell>
                                    {user.is_admin ? <Chip label="Admin" color="secondary" size="small" /> : <Chip label="User" color="default" size="small" />}
                                </TableCell>
                                <TableCell>
                                    {/* SỬA LỖI Ở ĐÂY: Kiểm tra user.created_at trước khi định dạng */}
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
