import React, { useState, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PeopleIcon from '@mui/icons-material/People';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { AuthContext } from '../contexts/AuthContext';

const drawerWidth = 240;

function Layout(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <HomeIcon sx={{ fontSize: 20 }} />, path: '/quotations' },
    { text: 'Company Settings', icon: <SettingsIcon sx={{ fontSize: 20 }} />, path: '/header-image' },
    { text: 'Profile Settings', icon: <AccountCircleIcon sx={{ fontSize: 20 }} />, path: '/profile' }
  ];

  if (user && user.role === 'admin') {
    menuItems.push({ text: 'User Management', icon: <PeopleIcon sx={{ fontSize: 20 }} />, path: '/users' });
  }

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#166534', color: 'white' }}>
      {/* Brand Header */}
      <Toolbar sx={{ my: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', px: 2.5 }}>
        <WbSunnyIcon sx={{ fontSize: 32, color: '#facc15', mr: 1.5 }} />
        <Box>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 900, letterSpacing: '0.5px', color: '#ffffff', lineHeight: 1.1, fontSize: '1.2rem' }}>
            PROGIX
          </Typography>
          <Typography variant="caption" sx={{ color: '#fef08a', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.8px' }}>
            SOLAR SOLUTIONS
          </Typography>
        </Box>
      </Toolbar>
      
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 1 }} />

      {/* Navigation Links */}
      <List sx={{ px: 1.5, flexGrow: 1 }}>
        {menuItems.map((item, index) => {
          const isSelected = 
            (item.text === 'Company Settings' && location.pathname === '/header-image') ||
            (item.text === 'User Management' && location.pathname === '/users') ||
            (item.text === 'Profile Settings' && location.pathname === '/profile') ||
            (item.text === 'Dashboard' && location.pathname !== '/header-image' && location.pathname !== '/users' && location.pathname !== '/profile');

          return (
            <ListItem key={item.text + index} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '8px',
                  py: 1,
                  px: 1.8,
                  bgcolor: isSelected ? 'rgba(255,255,255,0.18)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.12)'
                  },
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255,255,255,0.22)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.26)'
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'rgba(255,255,255,0.85)', minWidth: 34 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      fontWeight: isSelected ? 700 : 500,
                      color: '#ffffff',
                      fontSize: '0.88rem'
                    } 
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Sidebar Solar Illustration Full-Size Block */}
      <Box sx={{ px: 2, my: 1.5 }}>
        <Box sx={{
          bgcolor: '#ffffff',
          borderRadius: '14px',
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <Box
            component="img"
            src="/solar-illustration-full.png"
            alt="Solar Engineer Illustration"
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: 175,
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
          <Typography sx={{ color: '#166534', fontWeight: 800, fontSize: '0.86rem', mt: 1, lineHeight: 1.2 }}>
            Clean Solar Energy
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.72rem', mt: 0.3, fontWeight: 500 }}>
            Pro Proposal Generator
          </Typography>
        </Box>
      </Box>

      {/* Logout Button */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
        <ListItemButton 
          onClick={handleLogout}
          sx={{
            borderRadius: '8px',
            py: 1,
            px: 1.5,
            color: '#f87171',
            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 34 }}><LogoutIcon sx={{ color: '#ef4444', fontSize: 20 }} /></ListItemIcon>
          <ListItemText primary="Logout" sx={{ '& .MuiTypography-root': { color: '#ef4444', fontWeight: 600, fontSize: '0.88rem' } }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  const getBreadcrumbs = () => {
    const isEdit = location.pathname.startsWith('/edit-quotation');
    const isCreate = location.pathname === '/create-quotation';
    const isSettings = location.pathname === '/header-image';
    const isUsers = location.pathname === '/users';
    const isProfile = location.pathname === '/profile';

    const currentText = isEdit ? 'Edit Quotation' : isCreate ? 'Create Quotation' : isSettings ? 'Company Settings' : isUsers ? 'User Management' : isProfile ? 'Profile Settings' : '';

    return (
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
        <Typography
          variant="body2"
          onClick={() => navigate('/quotations')}
          sx={{ color: '#16a34a', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          Dashboard
        </Typography>
        {currentText && (
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
            <NavigateNextIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              {currentText}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#ffffff',
          borderBottom: '1px solid #f1f5f9',
          color: '#1e293b',
        }}
      >
        <Toolbar sx={{ minHeight: '52px !important', height: 52, px: 3, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          {getBreadcrumbs()}
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#f8fafc',
          minHeight: '100vh',
          pt: 7
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
