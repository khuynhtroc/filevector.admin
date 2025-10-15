// src/pages/Reports.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import {
    Typography, Box, Grid, Card, CardContent, CircularProgress, 
    Alert, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Button, Popover
} from '@mui/material';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, startOfToday, endOfToday, startOfYesterday, endOfYesterday, startOfWeek, endOfWeek } from 'date-fns';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css'; 

// Component Card hiển thị chỉ số
function StatCard({ title, value, change, changeColor }) {
    return (
        <Card variant="outlined">
            <CardContent>
                <Typography color="text.secondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {value}
                </Typography>
                {change && (
                    <Typography sx={{ color: changeColor }} variant="body2">
                        {change}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}

export default function Reports() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalDiscount: 0,
        avgOrderValue: 0,
    });
    const [revenueByType, setRevenueByType] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState([
        {
            startDate: startOfMonth(new Date()),
            endDate: endOfMonth(new Date()),
            key: 'selection'
        }
    ]);
    const [anchorEl, setAnchorEl] = useState(null);

    const formatCurrency = (num) => (num || 0).toLocaleString('vi-VN') + 'đ';

    const fetchReportData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const startDate = format(dateRange[0].startDate, 'yyyy-MM-dd HH:mm:ss');
            const endDate = format(dateRange[0].endDate, 'yyyy-MM-dd HH:mm:ss');

            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*, products(name), membership_plans(name)')
                .eq('status', 'completed')
                .gte('created_at', startDate)
                .lte('created_at', endDate);

            if (ordersError) throw ordersError;
            
            // --- 1. Tính toán các chỉ số tổng quan ---
            const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total_price || 0), 0);
            const totalOrders = ordersData.length;
            // Giả sử bạn có cột 'discount_amount' trong bảng orders
            const totalDiscount = ordersData.reduce((sum, order) => sum + (order.discount_amount || 0), 0);
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            setStats({
                totalRevenue,
                totalOrders,
                totalDiscount,
                avgOrderValue,
            });

            // --- 2. Doanh thu theo loại sản phẩm ---
            const typeRevenue = {
                membership: { count: 0, revenue: 0, name: 'Gói thành viên' },
                download: { count: 0, revenue: 0, name: 'Download lẻ' },
                video: { count: 0, revenue: 0, name: 'Video lẻ' } // Placeholder
            };
            ordersData.forEach(order => {
                if (order.plan_id) {
                    typeRevenue.membership.count++;
                    typeRevenue.membership.revenue += order.total_price;
                } else if (order.product_id) {
                    // Cần logic để phân biệt 'download' và 'video' nếu có
                    typeRevenue.download.count++;
                    typeRevenue.download.revenue += order.total_price;
                }
            });
            setRevenueByType(Object.values(typeRevenue));

            // --- 3. Top sản phẩm bán chạy ---
            const productSales = {};
            ordersData.forEach(order => {
                const id = order.plan_id ? `plan_${order.plan_id}` : `product_${order.product_id}`;
                const name = order.membership_plans?.name || order.products?.name || 'Sản phẩm không xác định';
                
                if (name === 'Sản phẩm không xác định') return;
                
                if (!productSales[id]) {
                    productSales[id] = { name, purchases: 0, revenue: 0 };
                }
                productSales[id].purchases++;
                productSales[id].revenue += order.total_price;
            });
            const sortedProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
            setTopProducts(sortedProducts);

            // --- 4. Dữ liệu biểu đồ ---
            const dailyRevenue = ordersData.reduce((acc, order) => {
                const date = format(new Date(order.created_at), 'dd/MM');
                acc[date] = (acc[date] || 0) + order.total_price;
                return acc;
            }, {});
            const formattedChartData = Object.keys(dailyRevenue).map(date => ({
                date,
                'Doanh thu (VND)': dailyRevenue[date],
            })).sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')));
            setChartData(formattedChartData);

        } catch (err) {
            setError('Không thể tải dữ liệu báo cáo. Lỗi: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    const handleDateFilterClick = (range) => {
        setDateRange([{ ...dateRange[0], ...range }]);
    };
    
    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Báo cáo Doanh thu
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button variant="outlined" size="small" onClick={() => handleDateFilterClick({ startDate: startOfToday(), endDate: endOfToday() })}>Hôm nay</Button>
                    <Button variant="outlined" size="small" onClick={() => handleDateFilterClick({ startDate: startOfYesterday(), endDate: endOfYesterday() })}>Hôm qua</Button>
                    <Button variant="outlined" size="small" onClick={() => handleDateFilterClick({ startDate: subDays(new Date(), 6), endDate: endOfToday() })}>7 ngày qua</Button>
                    <Button variant="contained" size="small" onClick={() => handleDateFilterClick({ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) })}>Tháng này</Button>
                    <Button variant="outlined" size="small" onClick={handlePopoverOpen}>Tùy chỉnh</Button>
                </Box>
            </Box>
            
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <DateRange
                    editableDateInputs={true}
                    onChange={item => setDateRange([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                />
            </Popover>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Doanh thu ròng" value={formatCurrency(stats.totalRevenue)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Đơn hàng" value={stats.totalOrders} /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Giảm giá" value={formatCurrency(stats.totalDiscount)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Trung bình/Đơn" value={formatCurrency(stats.avgOrderValue)} /></Grid>
            </Grid>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Doanh thu theo Loại sản phẩm</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Loại sản phẩm</TableCell>
                                        <TableCell align="right">Số đơn</TableCell>
                                        <TableCell align="right">Doanh thu ròng</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {revenueByType.map((row) => (
                                        <TableRow key={row.name}>
                                            <TableCell component="th" scope="row">{row.name}</TableCell>
                                            <TableCell align="right">{row.count}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Top sản phẩm bán chạy</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Sản phẩm</TableCell>
                                        <TableCell align="right">Lượt mua</TableCell>
                                        <TableCell align="right">Doanh thu</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {topProducts.map((product) => (
                                        <TableRow key={product.name}>
                                            <TableCell component="th" scope="row">{product.name}</TableCell>
                                            <TableCell align="right">{product.purchases}</TableCell>
                                            <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
            
            <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom>Biểu đồ Doanh thu</Typography>
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => `${(value/1000000)}tr`} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Area type="monotone" dataKey="Doanh thu (VND)" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </Paper>
        </Box>
    );
}
