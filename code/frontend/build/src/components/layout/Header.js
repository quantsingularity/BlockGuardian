import React from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  useTheme,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  AccountBalanceWallet as WalletIcon,
  Explore as ExploreIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useThemeContext } from '../../theme/ThemeContext';
import { styled } from '@mui/material/styles';

const drawerWidth = 240;

// Styled components
const StyledAppBar = styled(AppBar)(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.05)',
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  margin: '4px 8px',
  borderRadius: '12px',
  transition: 'all 0.2s ease',
  position: 'relative',
  overflow: 'hidden',
  ...(active && {
    backgroundColor: theme.palette.mode === 'light' 
      ? 'rgba(67, 97, 238, 0.1)' 
      : 'rgba(67, 97, 238, 0.2)',
    '&:before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '4px',
      backgroundColor: theme.palette.primary.main,
      borderRadius: '4px',
    },
  }),
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' 
      ? 'rgba(67, 97, 238, 0.05)' 
      : 'rgba(67, 97, 238, 0.15)',
    transform: 'translateX(4px)',
  },
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    boxShadow: '0 0 0 2px ' + (theme.palette.mode === 'light' ? '#fff' : '#1e1e1e'),
  },
}));

export default function Header() {
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = React.useState(!isMobile);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState(null);
  const location = useLocation();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Alerts', icon: <WarningIcon />, path: '/alerts' },
    { text: 'Risk Reports', icon: <AssessmentIcon />, path: '/reports' },
    { text: 'Blockchain Explorer', icon: <ExploreIcon />, path: '/explorer' },
    { text: 'Wallet', icon: <WalletIcon />, path: '/wallet' },
    { text: 'Multi-Wallet', icon: <WalletIcon />, path: '/multi-wallet' },
    { text: 'Advanced Analytics', icon: <AssessmentIcon />, path: '/analytics' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <StyledAppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h5" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.5px'
            }}
          >
            BlockGuardian
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Toggle dark/light mode">
              <IconButton 
                color="inherit" 
                onClick={toggleDarkMode}
                sx={{ 
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'rotate(30deg)' }
                }}
              >
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit"
                onClick={handleNotificationMenuOpen}
                sx={{ 
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}
              >
                <NotificationBadge badgeContent={3} color="error">
                  <NotificationsIcon />
                </NotificationBadge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Account">
              <IconButton
                color="inherit"
                onClick={handleProfileMenuOpen}
                sx={{ 
                  ml: 1,
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36, 
                    bgcolor: theme.palette.secondary.main,
                    border: '2px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  U
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </StyledAppBar>
      
      <StyledDrawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={isMobile ? handleDrawerClose : undefined}
      >
        <LogoContainer>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 700,
              color: theme.palette.primary.main,
              ml: 2
            }}
          >
            BlockGuardian
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </LogoContainer>
        <Divider />
        <List component="nav" sx={{ px: 1, py: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <StyledListItemButton
                component={RouterLink} 
                to={item.path}
                active={location.pathname === item.path ? 1 : 0}
              >
                <ListItemIcon 
                  sx={{ 
                    color: location.pathname === item.path ? 
                      theme.palette.primary.main : theme.palette.text.secondary,
                    minWidth: '40px'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    fontSize: '0.95rem',
                    color: location.pathname === item.path ? 
                      theme.palette.primary.main : theme.palette.text.primary
                  }}
                />
              </StyledListItemButton>
            </ListItem>
          ))}
          <Divider sx={{ my: 2 }} />
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <StyledListItemButton 
              component={RouterLink} 
              to="/help"
              active={location.pathname === '/help' ? 1 : 0}
            >
              <ListItemIcon>
                <HelpIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Help & Support" 
                primaryTypographyProps={{
                  fontSize: '0.95rem'
                }}
              />
            </StyledListItemButton>
          </ListItem>
        </List>
      </StyledDrawer>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: '12px',
            mt: 1.5,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              my: 0.5,
              borderRadius: '8px',
              mx: 1,
              transition: 'background-color 0.2s ease',
            },
          }
        }}
      >
        <MenuItem component={RouterLink} to="/profile" onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" color="primary" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem component={RouterLink} to="/settings" onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" color="primary" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <ExploreIcon fontSize="small" color="error" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      
      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: { 
            width: 320, 
            maxHeight: 400, 
            overflow: 'auto',
            borderRadius: '12px',
            mt: 1.5
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>
        <Divider />
        <MenuItem sx={{ py: 2 }}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
              High risk transaction detected
            </Typography>
            <Typography variant="body2" color="text.secondary">
              2 minutes ago
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem sx={{ py: 2 }}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
              New alert created
            </Typography>
            <Typography variant="body2" color="text.secondary">
              10 minutes ago
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem sx={{ py: 2 }}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
              Risk report generated
            </Typography>
            <Typography variant="body2" color="text.secondary">
              1 hour ago
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            color="primary" 
            component={RouterLink} 
            to="/notifications"
            onClick={handleNotificationMenuClose}
            size="small"
            sx={{ borderRadius: '8px' }}
          >
            View all notifications
          </Button>
        </Box>
      </Menu>
    </Box>
  );
}
