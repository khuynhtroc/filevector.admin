// src/pages/Reports.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Paper
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

// Component Card hiển thị chỉ số
function StatCard({ title, value, color }) {
    return (
        <Card sx={{ backgroundColor: color, color: 'white' }}>
            <CardContent>
                <Typography variant="h6" component="div">
                    {title}
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default function Reports() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalUsers: 0,
        totalOrders: 0,
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchReportData() {
            try {
                // Sử dụng Promise.all để thực hiện các truy vấn song song
                const [
                    { count: userCount, error: userError },
                    { data: ordersData, error: ordersError }
                ] = await Promise.all([
                    supabase.from('profiles').select('id', { count: 'exact', head: true }),
                    supabase.from('orders').select('total_price, created_at').eq('status', 'completed')
                ]);

                if (userError) throw userError;
                if (ordersError) throw ordersError;

                // --- 1. Tính toán các chỉ số tổng quan ---
                const totalRevenue = ordersData.reduce((sum, order) => sum + order.total_price, 0);
                setStats({
                    totalRevenue: totalRevenue,
                    totalUsers: userCount,
                    totalOrders: ordersData.length,
                });

                // --- 2. Xử lý dữ liệu cho biểu đồ doanh thu (30 ngày gần nhất) ---
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const recentOrders = ordersData.filter(order => new Date(order.created_at) >= thirtyDaysAgo);
                
                const dailyRevenue = recentOrders.reduce((acc, order) => {
                    const date = format(new Date(order.created_at), 'dd/MM');
                    acc[date] = (acc[date] || 0) + order.total_price;
                    return acc;
                }, {});

                const formattedChartData = Object.keys(dailyRevenue).map(date => ({
                    date,
                    DoanhThu: dailyRevenue[date],
                })).sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')));

                setChartData(formattedChartData);

            } catch (err) {
                setError('Không thể tải dữ liệu báo cáo. Lỗi: ' + err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchReportData();
    }, []);

    const formatCurrency = (num) => (num || 0).toLocaleString('vi-VN') + 'đ';

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Báo cáo & Phân tích
            </Typography>

            {/* Các thẻ chỉ số tổng quan */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={4}>
                    <StatCard title="Tổng Doanh Thu" value={formatCurrency(stats.totalRevenue)} color="#1976d2" />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatCard title="Tổng Số Đơn Hàng" value={stats.totalOrders} color="#388e3c" />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatCard title="Tổng Người Dùng" value={stats.totalUsers} color="#f57c00" />
                </Grid>
            </Grid>

            {/* Biểu đồ doanh thu */}
            <Typography variant="h6" gutterBottom>Doanh thu 30 ngày qua</Typography>
            <Paper sx={{ p: 2, mt: 2 }}>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="DoanhThu" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </Paper>
        </Box>
    );
}
