import React from "react";
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/images/Loginpage/logo.png";
import {
  Dashboard as DashboardIcon,
  Restaurant as RestaurantIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import TableBarRoundedIcon from '@mui/icons-material/TableBarRounded';
import FastfoodIcon from "@mui/icons-material/Fastfood";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { FiLogOut } from "react-icons/fi";

const Sidebar = ({ drawerWidth, mobileOpen, handleDrawerToggle, isMobile }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { path: "/create_order", label: "Create Order", icon: <FastfoodIcon /> },
    { path: "/orders", label: "Orders", icon: <AssignmentIcon /> },
    { path: "/menu", label: "Menu", icon: <RestaurantIcon /> },
    { path: "/settings", label: "Settings", icon: <SettingsIcon /> },
    { path: "/tables", label: "Tables", icon: <TableBarRoundedIcon /> },
  ];

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          textAlign: "center",
          width: "100%",
          px: 2,
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Vivanta Logo"
          sx={{
            width: { xs: "70px", sm: "80px", md: "100px" },
            height: "auto",
            objectFit: "contain",
            mx: "auto",
          }}
        />
      </Box>

      <Divider />

      {/* Menu Items */}
      <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
        <List>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={isMobile ? handleDrawerToggle : undefined}
              style={{ textDecoration: "none" }}
            >
              {({ isActive }) => (
                <ListItemButton
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    borderLeft: isActive
                      ? "4px solid #F5C857"
                      : "4px solid transparent",
                    backgroundColor: isActive
                      ? "rgba(245, 200, 87, 0.1)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(245, 200, 87, 0.08)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListItemIcon
                    sx={{ color: isActive ? "#F5C857" : "text.secondary" }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      color: isActive ? "#F5C857" : "text.primary",
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              )}
            </NavLink>
          ))}
        </List>
      </Box>

      {/* Logout Section */}
      <Box sx={{ p: 2, mt: "auto" }}>
        <Divider sx={{ mb: 2 }} />
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: "error.main",
            "&:hover": {
              backgroundColor: "rgba(244, 67, 54, 0.08)",
            },
          }}
        >
          <ListItemIcon sx={{ color: "error.main" }}>
            <FiLogOut size={20} />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            borderRight: "1px solid rgba(0, 0, 0, 0.12)",
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Sidebar;
