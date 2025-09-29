import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/Auth.jsx';
import { supabase } from '../supabaseClient';

// Import các component và icon từ MUI
import { Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, CssBaseline, Avatar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import LogoutIcon from '@mui/icons-material/Logout';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import ReceiptIcon from '@mui/icons-material/Receipt';


const drawerWidth = 240;

export default function DashboardLayout() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const navLinkStyle = {
        textDecoration: 'none',
        color: 'inherit'
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Báo cáo', icon: <BarChartIcon />, path: '/reports' },
        { text: 'Quản lý Đơn hàng', icon: <ReceiptIcon />, path: '/orders' },
        { text: 'Quản lý Sản phẩm', icon: <InventoryIcon />, path: '/products' },
        { text: 'Quản lý Thành viên', icon: <PeopleIcon />, path: '/users' },
        { text: 'Quản lý Gói VIP', icon: <CardMembershipIcon />, path: '/memberships' },
        // { text: 'Báo cáo', icon: <BarChartIcon />, path: '/reports' }, // Ví dụ thêm mục mới
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, background: '#fff', color: '#333' }}
                elevation={1}
            >
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        FileVector Admin
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        background: '#111827', // Màu nền tối cho sidebar
                        color: '#9CA3AF',
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <Toolbar />
                <Box sx={{ padding: '16px', textAlign: 'center' }}>
                    <Avatar sx={{ margin: '0 auto 10px auto', bgcolor: '#4F46E5' }}>
                        {user?.email?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ color: '#fff' }}>{user?.email}</Typography>
                </Box>
                <Divider sx={{ borderColor: '#374151' }} />
                <List>
                    {menuItems.map((item, index) => (
                        <NavLink to={item.path} key={item.text} style={navLinkStyle}>
                            {({ isActive }) => (
                                <ListItem disablePadding>
                                    <ListItemButton selected={isActive} sx={{ 
                                        '&.Mui-selected': { background: '#374151', color: 'white' },
                                        '&:hover': { background: '#1F2937' }
                                    }}>
                                        <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.text} />
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </NavLink>
                    ))}
                </List>
                <Divider sx={{ borderColor: '#374151' }} />
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={handleLogout}>
                            <ListItemIcon sx={{ color: '#9CA3AF' }}><LogoutIcon /></ListItemIcon>
                            <ListItemText primary="Đăng xuất" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
            <Box
                component="main"
                sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, background: '#F9FAFB' }}
            >
                <Toolbar />
                <Outlet /> {/* Nội dung các trang sẽ được hiển thị ở đây */}
            </Box>
        </Box>
    );
}
