import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  InputBase,
  alpha,
  styled,
  Chip,
  Button,
  Tooltip
} from "@mui/material";
import {
  Menu as MenuIcon,
  Search,
  Notifications,
  Settings,
  Person,
  Logout,
  ExpandMore,
  Help,
  Dashboard,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";

const SearchBar = styled('div')(({ theme }) => ({
  position: "relative",
  borderRadius: 8,
  backgroundColor: "#fafafa",
  border: `1px solid ${alpha("#000", 0.08)}`,
  paddingLeft: theme.spacing(5),
  height: 44,
  display: "flex",
  alignItems: "center",
  transition: "all 0.3s ease",

  "&:hover": {
    backgroundColor: "#fff",
    borderColor: alpha("#F5C857", 0.4),
    boxShadow: "0px 4px 12px rgba(0,0,0,0.06)",
  },

  "&.focused": {
    backgroundColor: "#fff7de",                  
    borderColor: "#F5C857",
    boxShadow: `0 0 0 3px ${alpha("#F5C857", 0.35)}`,
  },

  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  position: "absolute",
  left: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#F5C857",
  pointerEvents: "none",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  fontSize: "0.9rem",
  color: "#333",
  width: "100%",

  "& .MuiInputBase-input": {
    padding: "10px 12px",
    paddingLeft: theme.spacing(0),
    transition: "width 0.3s ease",

    [theme.breakpoints.up("md")]: {
      width: "32ch",
      "&:focus": {
        width: "42ch",
      },
    },
  },
}));


const Header = ({ drawerWidth, handleDrawerToggle, onThemeToggle, darkMode }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [focus, setFocus] = useState(false);

  const userMenuOpen = Boolean(anchorEl);
  const notificationsOpen = Boolean(notificationsAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchorEl(null);
  };

  const notifications = [
    { id: 1, text: "New booking received for 6 people", time: "10 min ago", read: false, type: "booking" },
    { id: 2, text: "Payment confirmed - Order #12345", time: "1 hour ago", read: false, type: "payment" },
    { id: 3, text: "New review for 'Spice Garden'", time: "2 hours ago", read: true, type: "review" },
    { id: 4, text: "System maintenance completed", time: "1 day ago", read: true, type: "system" },
    { id: 5, text: "Weekly sales report is ready", time: "2 days ago", read: true, type: "report" },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    const icons = {
      booking: "📋",
      payment: "💰",
      review: "⭐",
      system: "🔄",
      report: "📊"
    };
    return icons[type] || "🔔";
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(20px)', 
        WebkitBackdropFilter: 'blur(20px)', 
        borderBottom: '2px solid rgba(0, 0, 0, 0.08)', 
        boxShadow: 'none', 
        height: '84px', 
        display: 'flex',
        justifyContent: 'center',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar 
        sx={{ 
          minHeight: '84px !important', 
          height: '84px',
          px: { xs: 2, md: 3 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}
      >
        {/* Left Side: Menu Button and Search */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          flex: 1,
          gap: 2,
          height: '100%'
        }}>
          {/* Menu Button (Mobile) */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: { xs: 1, sm: 0 },
              display: { sm: 'none' },
              color: 'primary.main',
              backgroundColor: alpha('#F5C857', 0.08),
              height: '40px',
              width: '40px',
              '&:hover': {
                backgroundColor: alpha('#F5C857', 0.15),
              }
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Search Bar */}
          <SearchBar className={focus ? "focused" : ""}>
  <SearchIconWrapper>
    <Search />
  </SearchIconWrapper>

  <StyledInputBase
    placeholder="Search restaurants, menus, orders..."
    onFocus={() => setFocus(true)}
    onBlur={() => setFocus(false)}
  />
</SearchBar>

        </Box>

        {/* Right Side Actions */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0.5,
          flexShrink: 0,
          height: '100%'
        }}>


          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleNotificationsMenuOpen}
              sx={{
                position: 'relative',
                color: 'text.secondary',
                borderRadius: 2,
                height: '40px',
                width: '40px',
                '&:hover': {
                  backgroundColor: alpha('#F5C857', 0.08),
                  color: 'primary.main',
                }
              }}
            >
              <Badge 
                badgeContent={unreadCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.7rem',
                    height: 18,
                    minWidth: 18,
                    top: 5,
                    right: 5,
                  }
                }}
              >
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notifications Menu */}
          <Menu
            anchorEl={notificationsAnchorEl}
            open={notificationsOpen}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                width: 380,
                maxHeight: 450,
                mt: 1.5,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }
            }}
          >
            <Box sx={{ p: 2, pb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Notifications
                {unreadCount > 0 && (
                  <Chip 
                    label={`${unreadCount} new`} 
                    size="small" 
                    color="error"
                    sx={{ 
                      ml: 1, 
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 500
                    }}
                  />
                )}
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
              {notifications.map((notification) => (
                <MenuItem 
                  key={notification.id} 
                  onClick={handleMenuClose}
                  sx={{ 
                    py: 1.5,
                    px: 2,
                    borderLeft: notification.read ? 'none' : `3px solid #F5C857`,
                    backgroundColor: notification.read ? 'transparent' : alpha('#F5C857', 0.03),
                    '&:hover': {
                      backgroundColor: alpha('#F5C857', 0.05),
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <Box sx={{ 
                      mr: 2, 
                      fontSize: '1.2rem',
                      opacity: 0.8,
                      mt: 0.2
                    }}>
                      {getNotificationIcon(notification.type)}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: notification.read ? 400 : 600,
                        color: notification.read ? 'text.primary' : 'text.primary'
                      }}>
                        {notification.text}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {notification.time}
                      </Typography>
                    </Box>
                    {!notification.read && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#F5C857',
                          ml: 1,
                          mt: 0.5
                        }}
                      />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Box>
            <Divider />
            <Box sx={{ p: 1.5 }}>
              <Button 
                fullWidth 
                size="small" 
                onClick={handleMenuClose}
                sx={{ 
                  color: '#F5C857',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: alpha('#F5C857', 0.08),
                  }
                }}
              >
                View all notifications
              </Button>
            </Box>
          </Menu>

          {/* User Profile */}
          <Tooltip title="Account settings">
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                cursor: 'pointer',
                ml: 0.5,
                p: 0.8,
                borderRadius: 2,
                height: '48px',
                '&:hover': {
                  backgroundColor: alpha('#F5C857', 0.08),
                }
              }}
              onClick={handleProfileMenuOpen}
            >
              <Avatar
                sx={{
                  bgcolor: '#F5C857',
                  color: '#000',
                  width: 36,
                  height: 36,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 12px rgba(245, 200, 87, 0.4)'
                }}
              >
                ND
              </Avatar>
              <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                <Typography variant="subtitle2" sx={{color:'gray', fontWeight: 700, lineHeight: 1.2}}>
                  Nayan Dangar
                </Typography>
              </Box>
              <ExpandMore 
                fontSize="small" 
                sx={{ 
                  ml: 0.5, 
                  color: 'text.secondary',
                  transition: 'transform 0.2s',
                  transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0)'
                }} 
              />
            </Box>
          </Tooltip>

          {/* User Menu Dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={userMenuOpen}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                width: 260,
                mt: 1.5,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Nayan Dangar
              </Typography>
              <Typography variant="caption" color="text.secondary">
                nayandangar1@gmail.com
              </Typography>
            </Box>
            <MenuItem 
              onClick={handleMenuClose}
              sx={{
                py: 1.5,
                '&:hover': {
                  backgroundColor: alpha('#F5C857', 0.05),
                }
              }}
            >
              <ListItemIcon sx={{ color: '#F5C857' }}>
                <Person fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2" >My Profile</Typography>
            </MenuItem>
            <MenuItem 
              onClick={handleMenuClose}
              sx={{
                py: 1.5,
                '&:hover': {
                  backgroundColor: alpha('#F5C857', 0.05),
                }
              }}
            >
              <ListItemIcon sx={{ color: '#F5C857' }}>
                <Dashboard fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2">Dashboard</Typography>
            </MenuItem>
            <MenuItem 
              onClick={handleMenuClose}
              sx={{
                py: 1.5,
                '&:hover': {
                  backgroundColor: alpha('#F5C857', 0.05),
                }
              }}
            >
              <ListItemIcon sx={{ color: '#F5C857' }}>
                <Settings fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2">Account Settings</Typography>
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={handleMenuClose}
              sx={{
                py: 1.5,
                '&:hover': {
                  backgroundColor: alpha('#F5C857', 0.05),
                }
              }}
            >
              <ListItemIcon sx={{ color: '#F5C857' }}>
                <Help fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2">Help & Support</Typography>
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={handleMenuClose} 
              sx={{ 
                py: 1.5,
                color: '#d32f2f',
                '&:hover': {
                  backgroundColor: alpha('#d32f2f', 0.04),
                }
              }}
            >
              <ListItemIcon sx={{ color: '#d32f2f' }}>
                <Logout fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2" fontWeight={500}>
                Logout
              </Typography>
            </MenuItem>
          </Menu>
        
        </Box>
        
      </Toolbar>
    </AppBar>
  );
};

export default Header;