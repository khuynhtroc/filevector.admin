// src/pages/Memberships.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, CircularProgress, Alert
} from '@mui/material';

export default function Memberships() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchPlans() {
            try {
                const { data, error } = await supabase.from('membership_plans').select('*');
                if (error) throw error;
                setPlans(data || []);
            } catch (err) {
                setError('Không thể tải danh sách gói. Lỗi: ' + err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchPlans();
    }, []);
    
    const formatCurrency = (num) => (num || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Quản lý Gói Thành viên</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Tên Gói</TableCell>
                            <TableCell align="right">Giá</TableCell>
                            <TableCell align="center">Thời hạn (ngày)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {plans.map((plan) => (
                            <TableRow key={plan.id} hover>
                                <TableCell><strong>{plan.name}</strong></TableCell>
                                <TableCell align="right">{formatCurrency(plan.price)}</TableCell>
                                <TableCell align="center">{plan.duration_days}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
