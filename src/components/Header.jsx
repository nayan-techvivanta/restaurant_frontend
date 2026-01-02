import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Tooltip,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Person,
  Logout,
  ExpandMore,
  Help,
  Dashboard,
  Settings,
} from "@mui/icons-material";
import axios from "axios";

const Header = ({ drawerWidth, handleDrawerToggle }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const userMenuOpen = Boolean(anchorEl);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/v1/user/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("API Response:", response.data); // Debug log
      setUserData(response.data.data);
    } catch (err) {
      console.error("Profile fetch error:", err);
      // Fallback data for testing
      setUserData({
        user: {
          first_name: "adarsh",
          last_name: "mehta",
          email: "adarshmehta@gmail.com",
        },
        restaurant: {
          name: "Golden Spoon",
          city: "Ahmedabad",
          state: "Gujarat",
        },
        role: "OWNER",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0)?.toUpperCase() || ""}${
      lastName?.charAt(0)?.toUpperCase() || ""
    }`;
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "2px solid rgba(0, 0, 0, 0.08)",
        boxShadow: "none",
        height: "84px",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: "84px !important",
          height: "84px",
          px: { xs: 2, md: 3 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Left Side: Menu Button and Restaurant Name */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            minWidth: 0, // Prevents overflow
            gap: 2,
          }}
        >
          {/* Menu Button (Mobile) */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              display: { sm: "none" },
              color: "primary.main",
              backgroundColor: "rgba(245, 200, 87, 0.08)",
              height: "40px",
              width: "40px",
              "&:hover": {
                backgroundColor: "rgba(245, 200, 87, 0.15)",
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Restaurant Name - Always visible */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              ml: { xs: 0, sm: 1 },
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, fontSize: "1.1rem" }}
                >
                  Loading...
                </Typography>
              </Box>
            ) : (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    fontSize: { xs: "1rem", md: "1.2rem" },
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {userData?.restaurant?.name || "Golden Spoon"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontSize: { xs: "0.7rem", md: "0.8rem" },
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {userData?.restaurant
                    ? `${userData.restaurant.city || ""}, ${
                        userData.restaurant.state || ""
                      }`.trim() || "Ahmedabad, Gujarat"
                    : "Ahmedabad, Gujarat"}
                </Typography>
              </>
            )}
          </Box>
        </Box>

        {/* Right Side: User Profile */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexShrink: 0,
          }}
        >
          <Tooltip title="Account settings">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                p: 0.8,
                borderRadius: 2,
                height: "48px",
                "&:hover": {
                  backgroundColor: "rgba(245, 200, 87, 0.08)",
                },
              }}
              onClick={handleProfileMenuOpen}
            >
              <Avatar
                sx={{
                  bgcolor: "#F5C857",
                  color: "#000",
                  width: 36,
                  height: 36,
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  boxShadow: "0 4px 12px rgba(245, 200, 87, 0.4)",
                }}
              >
                {userData?.user
                  ? getInitials(
                      userData.user.first_name,
                      userData.user.last_name
                    )
                  : "AM"}
              </Avatar>
              <Box
                sx={{
                  display: { xs: "none", md: "flex", flexDirection: "column" },
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "text.primary",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    fontSize: "0.85rem",
                  }}
                >
                  {userData?.user
                    ? `${userData.user.first_name} ${userData.user.last_name}`
                    : "Adarsh Mehta"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.7rem",
                  }}
                >
                  {userData?.role || "OWNER"}
                </Typography>
              </Box>
              <ExpandMore
                fontSize="small"
                sx={{
                  color: "text.secondary",
                  transition: "transform 0.2s",
                  transform: userMenuOpen ? "rotate(180deg)" : "rotate(0)",
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
                width: 280,
                mt: 1.5,
                borderRadius: 2,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box
              sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {userData?.user
                  ? `${userData.user.first_name} ${userData.user.last_name}`
                  : "Adarsh Mehta"}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {userData?.user?.email || "adarshmehta@gmail.com"}
              </Typography>
              <Chip
                label={userData?.role || "OWNER"}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 24 }}
              />
            </Box>
            <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ color: "#F5C857" }}>
                <Dashboard fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2">Dashboard</Typography>
            </MenuItem>
            <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ color: "#F5C857" }}>
                <Settings fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2">Account Settings</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ color: "#F5C857" }}>
                <Help fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2">Help & Support</Typography>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={handleMenuClose}
              sx={{
                py: 1.5,
                color: "#d32f2f",
                "&:hover": {
                  backgroundColor: "rgba(211, 47, 47, 0.04)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#d32f2f" }}>
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
