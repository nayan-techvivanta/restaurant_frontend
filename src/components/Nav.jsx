import React, { useEffect, useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
  Box,
  Drawer as MuiDrawer,
  AppBar as MuiAppBar,
  Toolbar,
  List,
  CssBaseline,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
 
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  Inventory2 as InventoryIcon,
  ExitToApp as ExitToAppIcon,
} from "@mui/icons-material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PrecisionManufacturingRoundedIcon from '@mui/icons-material/PrecisionManufacturingRounded';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import CategoryIcon from "@mui/icons-material/Category";
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/Loginpage/logo.png";
import Cookies from "js-cookie";
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import ListIcon from '@mui/icons-material/List';
 
const drawerWidth = 240;
 
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});
 
const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});
 
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));
 
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));
 
const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));
 
const Nav = () => {
  const theme = useTheme();
  const token = Cookies.get("authToken");
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
 
  const handleDrawerOpen = () => {
    setOpen(true);
  };
 
  useEffect(() => {
    if (!token) {
      navigate("/auth/login");
    }
  }, [token]);
 
  const handleDrawerClose = () => {
    setOpen(false);
  };
 
  const handleLogout = (e) => {
    e.preventDefault();
    Cookies.remove("authToken");
    navigate("/auth/login");
  };
 
  const navItems = [
    // { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Blog", icon: <PostAddRoundedIcon />, path: "/blog" },
    { text: "Products", icon: <CategoryIcon />, path: "/categories" },
    { text: "Job Department", icon: <ListIcon />, path: "/job/category" },
    { text: "Jobs", icon: <PrecisionManufacturingRoundedIcon />, path: "/jobs" },
    { text: "Enquiry", icon: <CallEndRoundedIcon />, path: "/enquiry" },
    { text: "Users", icon: <PersonRoundedIcon />, path: "/users" },
    { text: "Job Applied", icon: <WorkRoundedIcon />, path: "/jobs/applied" },
    { text: "Team Members", icon: <GroupRoundedIcon />, path: "/team" },
    { text: "brochure", icon: <InventoryIcon />, path: "/brochure" },
    { text: "Images", icon: <ImageRoundedIcon />, path: "/images" },
  ];
 
  return (
    <>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ marginRight: 5, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Hello, Admin
          </Typography>
        </Toolbar>
      </AppBar>
 
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <img
            src={logo}
            alt="logo"
            className="img-fluid"
            style={{ maxHeight: 40, marginLeft: 8 }}
          />
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              <Tooltip title={!open ? item.text : ""} placement="right">
                <ListItemButton
                  component={Link}
                  to={item.path}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem disablePadding sx={{ display: "block" }}>
            <Tooltip title={!open ? "Logout" : ""} placement="right">
              <ListItemButton
                onClick={(e) => handleLogout(e)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  color: "error.main",
                  "&:hover": {
                    bgcolor: "error.light",
                    color: "#fff",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                    color: "inherit",
                  }}
                >
                  <ExitToAppIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};
 
export default Nav;
 
 