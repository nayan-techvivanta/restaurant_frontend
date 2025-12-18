import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  ChefHat,
  Printer,
  Eye,
  RefreshCw,
  TrendingUp,
  Calendar,
  Users,
  IndianRupee,
  AlertCircle,
  Loader2,
  Check,
  X,
  Package,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
  });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, pagination.page]);

  const filteredOrders = React.useMemo(() => {
    let result = [...orders];

    if (searchQuery) {
      result = result.filter(
        (order) =>
          order.id
            .toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          order.grand_total.toString().includes(searchQuery)
      );
    }

    // Sort orders
    result = result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "amount-high":
          return b.grand_total - a.grand_total;
        case "amount-low":
          return a.grand_total - b.grand_total;
        default:
          return 0;
      }
    });

    return result;
  }, [orders, searchQuery, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        limit: pagination.limit,
        page: pagination.page,
        ...(statusFilter !== "all" && { status: statusFilter }),
      };

      const response = await axiosInstance.get("/api/v1/order/all", { params });

      if (response.data && response.data.data) {
        setOrders(response.data.data);
        setPagination(
          response.data.pagination || {
            total: response.data.data.length,
            page: 1,
            limit: 10,
            totalPages: 1,
            hasNextPage: false,
          }
        );
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Optionally show error toast/message
    } finally {
      setLoading(false);
    }
  };

  // Fetch order details
  const fetchOrderDetails = async (orderId) => {
    if (orderDetails[orderId]) {
      setExpandedOrder(expandedOrder === orderId ? null : orderId);
      return;
    }

    try {
      setLoadingDetails(true);
      const response = await axiosInstance.get(`/api/v1/order/${orderId}`);

      if (response.data && response.data.data) {
        setOrderDetails((prev) => ({
          ...prev,
          [orderId]: response.data.data,
        }));
        setExpandedOrder(orderId);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Show loading state for the specific order
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, updating: true } : order
        )
      );

      // Make PUT request to update status
      const response = await axiosInstance.put("/api/v1/order/status", {
        id: orderId,
        status: newStatus,
      });

      if (response.data && response.data.message) {
        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: newStatus,
                  updating: false,
                  updated_at: new Date().toISOString(), // Update timestamp
                }
              : order
          )
        );

        // Also update the order details if they are currently expanded
        if (orderDetails[orderId]) {
          setOrderDetails((prev) => ({
            ...prev,
            [orderId]: {
              ...prev[orderId],
              status: newStatus,
              updated_at: new Date().toISOString(),
            },
          }));
        }

        fetchOrders();

        console.log("Order status updated successfully");
      }
    } catch (error) {
      console.error("Error updating order status:", error);

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, updating: false } : order
        )
      );

      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
    }
  };

  const handleRefresh = () => {
    fetchOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PLACED":
        return "bg-blue-100 text-blue-800";
      case "COOKED":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PLACED":
        return <Package className="w-4 h-4" />;
      case "COOKED":
        return <ChefHat className="w-4 h-4" />;
      case "COMPLETED":
        return <Check className="w-4 h-4" />;
      case "CANCELLED":
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PLACED":
        return "Order Placed";
      case "COOKED":
        return "Cooked";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate stats
  const stats = {
    total: orders.length,
    placed: orders.filter((o) => o.status === "PLACED").length,
    cooked: orders.filter((o) => o.status === "COOKED").length,
    completed: orders.filter((o) => o.status === "COMPLETED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    revenue: orders.reduce((sum, order) => sum + (order.grand_total || 0), 0),
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order Management
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage all restaurant orders in real-time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="px-4 py-2 bg-white border border-gray-300 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Loading..." : "Refresh"}
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Placed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.placed}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cooked</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.cooked}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <ChefHat className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completed}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{stats.revenue}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <IndianRupee className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders by ID or amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
                }}
                className="appearance-none w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white"
                disabled={loading}
              >
                <option value="all">All Status</option>
                <option value="PLACED">Placed</option>
                <option value="COOKED">Cooked</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white"
                disabled={loading}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {loading ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Loader2 className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200"
          >
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        ) : (
          <>
            <AnimatePresence>
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  {/* Order Header */}
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            Order #{order.id}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </span>
                          {order.updating && (
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Updating...
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              {formatDate(order.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              Restaurant ID: {order.restaurent_id}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* <IndianRupee  className="w-4 h-4 text-gray-400" /> */}
                            <span className="text-gray-700 font-semibold">
                              ₹{order.grand_total}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              {order.items?.length || 0} items
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => fetchOrderDetails(order.id)}
                          disabled={loadingDetails}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingDetails && expandedOrder === order.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading...
                            </>
                          ) : expandedOrder === order.id ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              View Details
                            </>
                          )}
                        </motion.button>

                       
                        {order.status === "PLACED" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to cancel order #${order.id}?`
                                )
                              ) {
                                updateOrderStatus(order.id, "CANCELLED");
                              }
                            }}
                            disabled={order.updating}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {order.updating ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4" />
                                Cancel Order
                              </>
                            )}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  <AnimatePresence>
                    {expandedOrder === order.id && orderDetails[order.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200"
                      >
                        <div className="p-4 md:p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Order Items */}
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Order Items
                              </h4>
                              <div className="space-y-3">
                                {orderDetails[order.id].items?.map(
                                  (item, idx) => (
                                    <div
                                      key={item.item_id || idx}
                                      className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                                    >
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {item.product_name ||
                                            item.product?.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          Quantity: {item.quantity} × ₹
                                          {item.unit_price || item.price}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          Type: {item.product?.type || "VEG"} |
                                          SKU: {item.product?.sku || "N/A"}
                                        </p>
                                      </div>
                                      <p className="font-semibold text-gray-900">
                                        ₹
                                        {item.total_price ||
                                          item.quantity *
                                            (item.price || item.unit_price)}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Order Information */}
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Order Information
                              </h4>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-4 bg-blue-50 rounded-xl">
                                    <p className="text-sm font-medium text-blue-800 mb-1">
                                      Total Items
                                    </p>
                                    <p className="text-2xl font-bold text-blue-900">
                                      {orderDetails[order.id].items?.length ||
                                        0}
                                    </p>
                                  </div>

                                  <div className="p-4 bg-green-50 rounded-xl">
                                    <p className="text-sm font-medium text-green-800 mb-1">
                                      Grand Total
                                    </p>
                                    <p className="text-2xl font-bold text-green-900">
                                      ₹{orderDetails[order.id].grand_total}
                                    </p>
                                  </div>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-xl">
                                  <p className="text-sm font-medium text-amber-800 mb-2">
                                    Order Timeline
                                  </p>
                                  <p className="text-amber-900">
                                    <span className="font-medium">
                                      Created:
                                    </span>{" "}
                                    {formatDate(
                                      orderDetails[order.id].created_at
                                    )}
                                  </p>
                                  {orderDetails[order.id].updated_at && (
                                    <p className="text-amber-900 mt-1">
                                      <span className="font-medium">
                                        Last Updated:
                                      </span>{" "}
                                      {formatDate(
                                        orderDetails[order.id].updated_at
                                      )}
                                    </p>
                                  )}
                                </div>

                                <div className="flex gap-3">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => window.print()}
                                    className="flex-1 px-4 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Printer className="w-4 h-4" />
                                    Print Receipt
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center items-center gap-4 mt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrevPage}
                  disabled={pagination.page === 1 || loading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-4 h-4 rotate-270" />
                  Previous
                </motion.button>

                <span className="text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextPage}
                  disabled={!pagination.hasNextPage || loading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronUp className="w-4 h-4 rotate-90" />
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 pt-6 border-t border-gray-200"
      >
        <div className="text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-3">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <ChefHat className="w-5 h-5" />
              {stats.cooked} orders cooked
            </div>
            <div className="text-gray-400">•</div>
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Package className="w-5 h-5" />
              {stats.placed} orders placed
            </div>
            <div className="text-gray-400">•</div>
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <IndianRupee className="w-5 h-5" />
              Total Revenue: ₹{stats.revenue}
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Showing {filteredOrders.length} of {pagination.total} orders • Last
            updated:{" "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderList;
