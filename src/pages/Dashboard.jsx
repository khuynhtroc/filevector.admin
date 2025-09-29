import React from 'react';

export default function Dashboard() {
    // --- Các số liệu này sau này sẽ được lấy từ database ---
    const stats = {
        monthlyRevenue: 17398000,
        orders: 95,
        discounts: -2100000,
        netRevenue: 18313700
    };

    const topProducts = [
        { name: 'Thành viên VIP - Vĩnh viễn', sold: 22, revenue: 18230000 },
        { name: 'Backdrop khai giảng năm học mới', sold: 8, revenue: 80000 },
    ];

    const cardStyle = {
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        flex: 1,
        margin: '0 10px'
    };

    const formatCurrency = (num) => num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    return (
        <div>
            <h1>Báo cáo Doanh thu</h1>
            <div style={{ display: 'flex', margin: '20px 0' }}>
                <div style={cardStyle}>
                    <h4>Doanh thu tháng</h4>
                    <h2 style={{ color: '#007bff' }}>{formatCurrency(stats.monthlyRevenue)}</h2>
                </div>
                <div style={cardStyle}>
                    <h4>Đơn tăng</h4>
                    <h2 style={{ color: '#28a745' }}>{stats.orders}</h2>
                </div>
                <div style={cardStyle}>
                    <h4>Giảm giá</h4>
                    <h2 style={{ color: '#dc3545' }}>{formatCurrency(stats.discounts)}</h2>
                </div>
                <div style={cardStyle}>
                    <h4>Doanh thu thuần</h4>
                    <h2 style={{ color: '#17a2b8' }}>{formatCurrency(stats.netRevenue)}</h2>
                </div>
            </div>

            <div style={cardStyle}>
                <h3>Top sản phẩm bán chạy</h3>
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Lượt mua</th>
                            <th>Doanh thu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topProducts.map(p => (
                            <tr key={p.name}>
                                <td>{p.name}</td>
                                <td>{p.sold}</td>
                                <td>{formatCurrency(p.revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
