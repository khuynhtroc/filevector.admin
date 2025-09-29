// src/pages/Reports.jsx
import React from 'react';
import { Typography, Box } from '@mui/material';
// Trong tương lai, chúng ta sẽ thêm biểu đồ ở đây
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function Reports() {
    // Dữ liệu giả cho biểu đồ, sau này sẽ thay bằng dữ liệu thật
    const data = [
        { name: 'Tháng 1', DoanhThu: 4000 },
        { name: 'Tháng 2', DoanhThu: 3000 },
        { name: 'Tháng 3', DoanhThu: 5000 },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Báo cáo & Phân tích
            </Typography>
            <Typography>
                Khu vực này sẽ chứa các biểu đồ chi tiết về doanh thu, người dùng mới, và các chỉ số quan trọng khác theo thời gian.
            </Typography>
            
            {/* VÍ DỤ VỀ BIỂU ĐỒ TRONG TƯƠNG LAI
            <Box mt={4}>
                <Typography variant="h6">Doanh thu theo tháng</Typography>
                <BarChart width={600} height={300} data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="DoanhThu" fill="#8884d8" />
                </BarChart>
            </Box>
            */}
        </Box>
    );
}
