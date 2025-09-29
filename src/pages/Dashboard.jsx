import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// Import các component từ MUI
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Alert } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Component thẻ thống kê (giữ nguyên)
function StatCard({ title, value, icon, color }) {
    return (
        <Card sx={{ display: 'flex', alignItems: 'center', padding: '16px' }} elevation={2}>
            <Box sx={{
                width: 64, height: 64, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: color, color: '#fff', marginRight: '16px'
            }}>
                {icon}
            </Box>
            <Box>
                <Typography color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>{title}</Typography>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {value}
                </Typography>
            </Box>
        </Card>
    );
}

export default function Dashboard() {
    // State để lưu trữ dữ liệu và trạng thái loading/error
    const [stats, setStats] = useState({ revenue: 0, orders: 0, discounts: 0, netRevenue: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                // Lấy tất cả các đơn hàng từ database
                const { data: orders, error: ordersError } = await supabase
                    .from('orders')
                    .select('amount, discount');

                if (ordersError) {
                    throw ordersError;
                }

                if (orders) {
                    // Tính toán các chỉ số
                    const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
                    const totalDiscounts = orders.reduce((sum, order) => sum + (order.discount || 0), 0);
                    const netRevenue = totalRevenue - totalDiscounts;

                    setStats({
                        revenue: totalRevenue,
                        orders: orders.length,
                        discounts: totalDiscounts,
                        netRevenue: netRevenue
                    });
                }
            } catch (err) {
                setError('Không thể tải dữ liệu dashboard. Lỗi: ' + err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []); // Chỉ chạy một lần khi component được mount

    const formatCurrency = (num) => num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Dashboard Tổng Quan
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Doanh thu" value={formatCurrency(stats.revenue)} icon={<AttachMoneyIcon />} color="#1976d2" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Số đơn hàng" value={stats.orders} icon={<ShoppingCartIcon />} color="#388e3c" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Giảm giá" value={formatCurrency(stats.discounts)} icon={<PriceCheckIcon />} color="#d32f2f" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Doanh thu thuần" value={formatCurrency(stats.netRevenue)} icon={<TrendingUpIcon />} color="#f57c00" />
                </Grid>
                {/* Placeholder cho các biểu đồ và bảng dữ liệu khác */}
            </Grid>
        </Box>
    );
}
