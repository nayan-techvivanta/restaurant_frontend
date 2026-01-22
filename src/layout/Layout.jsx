// import React, { useState } from "react";
// import { Outlet } from "react-router-dom";
// import Header from "../components/Header";
// import Sidebar from "../components/Sidebar";

// const Layout = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   return (
//     <div className="flex bg-gray-50 min-h-screen">

//       <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

//       <div className="flex-1 flex flex-col">
//          <div className="md:ml-64">
//         <Header onMenuClick={() => setSidebarOpen(true)}/>
//          </div>
//         <main className="flex-1 overflow-y-auto p-4 md:ml-[260px]">
//           <Outlet />
//         </main>

//       </div>
//     </div>
//   );
// };

// export default Layout;
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  Box,
  CssBaseline,
  Toolbar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../api/axiosInstance";

const drawerWidth = 250;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      
      const response = await axiosInstance.get("/api/v1/user/");
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
    } 
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Header */}
      <Header
        drawerWidth={drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
        userData={userData}
      />

      {/* Sidebar */}
      <Sidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
        userData={userData}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
