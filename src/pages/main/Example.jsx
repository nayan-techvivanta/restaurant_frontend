import React from "react";
import Nav from "../../components/Nav";
import {
  Box,
  Typography,
} from "@mui/material";
 
const Example = () => {
  return (
    <>
      <Box sx={{ display: "flex" }}>
        <Nav />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 6 }}>
          <div className="container-fluid">
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Typography variant="h4" component="h1" gutterBottom>
                Example
              </Typography>
            </Box>
          </div>
        </Box>
      </Box>
    </>
  );
};
 
export default Example;
 
 