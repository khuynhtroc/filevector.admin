import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// Import các component và icon từ MUI
import {
    Grid, Card, CardContent, Typography, Box, CircularProgress, Alert, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import TodayIcon from '@mui/icons-material/Today';
import NewReleasesIcon from '@mui/icons-material/NewReleases';

// Component thẻ thống kê (giữ nguyên thiết kế)
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
    // State để lưu trữ dữ liệu và trạng thái
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalUsers: 0,
        todayRevenue: 0,
        newUsersToday: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                // Sử dụng Promise.all để các truy vấn chạy song song, tăng hiệu năng
                const [
                    { data: completedOrders, error: ordersError },
                    { count: totalUserCount, error: userCountError },
                    { count: newUsersTodayCount, error: newUsersError }
                ] = await Promise.all([
                    supabase.from('orders').select('user_id, total_price, created_at, profiles(email)').eq('status', 'completed').order('created_at', { ascending: false }),
                    supabase.from('profiles').select('id', { count: 'exact', head: true }),
                    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString())
                ]);

                if (ordersError) throw ordersError;
                if (userCountError) throw userCountError;
                if (newUsersError) throw newUsersError;

                // --- Bắt đầu tính toán các chỉ số ---
                const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
                
                const ordersToday = completedOrders.filter(order => new Date(order.created_at) >= todayStart);
                const todayRevenue = ordersToday.reduce((sum, order) => sum + (order.total_price || 0), 0);

                setStats({
                    totalRevenue: totalRevenue,
                    totalOrders: completedOrders.length,
                    totalUsers: totalUserCount,
                    todayRevenue: todayRevenue,
                    newUsersToday: newUsersTodayCount
                });
                
                // Lấy 5 đơn hàng gần nhất để hiển thị
                setRecentOrders(completedOrders.slice(0, 5));

            } catch (err) {
                setError('Không thể tải dữ liệu dashboard. Lỗi: ' + err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []); // Chỉ chạy một lần

    const formatCurrency = (num) => (num || 0).toLocaleString('vi-VN') + 'đ';

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }
    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Dashboard Tổng Quan
            </Typography>
            
            {/* Hàng trên: Các chỉ số tổng quan */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard title="Tổng Doanh Thu" value={formatCurrency(stats.totalRevenue)} icon={<AttachMoneyIcon />} color="#1976d2" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard title="Tổng Đơn Hàng" value={stats.totalOrders} icon={<ShoppingCartIcon />} color="#388e3c" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard title="Tổng Người Dùng" value={stats.totalUsers} icon={<PeopleAltIcon />} color="#7b1fa2" />
                </Grid>
            </Grid>

            {/* Hàng dưới: Các chỉ số trong ngày */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6}>
                    <StatCard title="Doanh Thu Hôm Nay" value={formatCurrency(stats.todayRevenue)} icon={<TodayIcon />} color="#f57c00" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <StatCard title="Người Dùng Mới Hôm Nay" value={stats.newUsersToday} icon={<NewReleasesIcon />} color="#d32f2f" />
                </Grid>
            </Grid>

            {/* Bảng: Các đơn hàng gần nhất */}
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
                Đơn hàng gần nhất
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Thời gian</TableCell>
                            <TableCell>Email Khách hàng</TableCell>
                            <TableCell align="right">Giá trị</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {recentOrders.map((order) => (
                            <TableRow key={order.created_at} hover>
                                <TableCell>{new Date(order.created_at).toLocaleString('vi-VN')}</TableCell>
                                <TableCell>{order.profiles?.email || 'N/A'}</TableCell>
                                <TableCell align="right">{formatCurrency(order.total_price)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
