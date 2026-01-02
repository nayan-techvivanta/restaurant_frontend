import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { FiPlus, FiEdit2 } from "react-icons/fi";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import "react-toastify/dist/ReactToastify.css";

// API CONFIGURATION
const API_BASE_URL = "https://x81b1d9j-4000.inc1.devtunnels.ms/api/v1";

const TableList = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);

  // Modal & Form State
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [formData, setFormData] = useState({
    table_no: "",
    status: true,
  });

  /* PAGINATION */
  const [page, setPage] = useState(0); // MUI is 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* ---------- API HELPERS ---------- */
  const getAuthHeader = () => {
    const token = localStorage.getItem("access_token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  /* ---------- FETCH DATA ---------- */
  const fetchTables = async () => {
    try {
      setLoading(true);
      // API is likely 1-indexed, MUI is 0-indexed
      const response = await axios.get(
        `${API_BASE_URL}/table/all?page=${page + 1}&limit=${rowsPerPage}`,
        getAuthHeader()
      );

      if (response.data.success) {
        // Map backend "number" to frontend "table_no" and string status to boolean
        const mappedData = response.data.data.map((item) => ({
          ...item,
          table_no: item.number || item.table_no, // Handle inconsistency
          status: item.status === "ACTIVE",
          work_status: item.work_status || "Available",
        }));

        setTables(mappedData);
        setTotalRows(response.data.total || mappedData.length);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  /* ---------- HANDLERS ---------- */

  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({ table_no: "", status: true });
    setOpenModal(true);
  };

  const handleOpenEdit = (row) => {
    setIsEdit(true);
    setSelectedRow(row);
    setFormData({
      table_no: row.table_no,
      status: row.status,
    });
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setSelectedRow(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSwitch = (e) => {
    setFormData({ ...formData, status: e.target.checked });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this table?")) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/table/${id}`,
        getAuthHeader()
      );

      if (response.data.success) {
        toast.success("Table deleted successfully");
        fetchTables(); // Refresh list
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete table");
    }
  };

  const handleSubmit = async () => {
    if (!formData.table_no.toString().trim()) {
      toast.error("Table number is required");
      return;
    }

    try {
      if (isEdit) {
        // PUT Request
        // Note: CURL uses "number" for updates, "table_no" for add
        const payload = {
          id: selectedRow.id,
          number: formData.table_no,
          status: formData.status ? "ACTIVE" : "DEACTIVE",
        };

        const response = await axios.put(
          `${API_BASE_URL}/table/update`,
          payload,
          getAuthHeader()
        );

        if (response.data.success) {
          toast.success("Table updated successfully");
          fetchTables();
        }
      } else {
        // POST Request
        const payload = {
          table_no: formData.table_no,
        };

        const response = await axios.post(
          `${API_BASE_URL}/table/add`,
          payload,
          getAuthHeader()
        );

        if (response.data.success) {
          toast.success("Table added successfully");
          fetchTables();
        }
      }
      handleClose();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Operation failed";
      toast.error(msg);
    }
  };

  /* PAGINATION HANDLERS */
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  /* ---------- UI HELPERS ---------- */

  const statusChip = (status) => (
    <Chip
      label={status ? "Active" : "Deactive"}
      color={status ? "success" : "default"}
      size="small"
      variant="outlined"
    />
  );

  const workStatusChip = (status) => {
    // Normalize status case for matching
    const normalizedStatus = status ? status.toUpperCase() : "AVAILABLE";

    let color = "success";
    if (normalizedStatus === "OCCUPIED") color = "warning";
    if (normalizedStatus === "CLEANING") color = "info";

    return <Chip label={status} color={color} size="small" />;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <ToastContainer />

      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Table Management
          </h1>

          <Button
            variant="contained"
            startIcon={<FiPlus />}
            onClick={handleOpenAdd}
            className="!bg-yellow-500 hover:!bg-yellow-600 !text-black"
          >
            Add Table
          </Button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow className="bg-gray-100">
                  <TableCell>
                    <b>#</b>
                  </TableCell>
                  
                  <TableCell>
                    <b>Table No</b>
                  </TableCell>
                  <TableCell>
                    <b>Status</b>
                  </TableCell>
                  <TableCell>
                    <b>Work Status</b>
                  </TableCell>
                  <TableCell>
                    <b>Assigned Waiter</b>
                  </TableCell>
                  <TableCell>
                    <b>Action</b>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" className="py-8">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : tables.length ? (
                  tables.map((row,i) => (
                    <TableRow key={i} hover>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{row.table_no}</TableCell>
                      <TableCell>{statusChip(row.status)}</TableCell>
                      <TableCell>{workStatusChip(row.work_status)}</TableCell>
                      <TableCell>{row.assign_waiter || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEdit(row)}
                          >
                            <FiEdit2 />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(row.id)}
                          >
                            <DeleteForeverRoundedIcon />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No tables found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* SERVER SIDE PAGINATION */}
            <TablePagination
              component="div"
              count={totalRows}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </TableContainer>
        </div>
      </div>

      {/* ADD / UPDATE MODAL */}
      <Dialog open={openModal} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle className="font-bold">
          {isEdit ? "Update Table" : "Add Table"}
        </DialogTitle>

        <DialogContent className="space-y-4 mt-2">
          <TextField
            label="Table Number"
            name="table_no"
            value={formData.table_no}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
            required
          />

          {isEdit && (
            <FormControlLabel
              control={
                <Switch
                  checked={formData.status}
                  onChange={handleSwitch}
                  color="success"
                />
              }
              label={formData.status ? "Active" : "Deactive"}
            />
          )}
        </DialogContent>

        <DialogActions className="p-4">
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            className="!bg-yellow-500 hover:!bg-yellow-600 !text-black"
          >
            {isEdit ? "Update" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TableList;
