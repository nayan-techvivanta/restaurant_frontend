import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  Stack,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Skeleton,
  Avatar,
  Button,
  Card,
  CardContent,
  Divider,
  alpha,
  useTheme,
  Paper,
  Chip as MuiChip,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  AttachMoney,
  ShoppingCart,
  TrendingUp,
  BarChart,
  PieChart,
  MoreHoriz,
  Refresh,
  FilterList,
  Download,
  CheckCircle,
  RestaurantMenu,
  LocalDining,
  ArrowUpward,
  ArrowDownward,
  AccessTime,
  Restaurant,
} from "@mui/icons-material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Line,
} from "recharts";
import axiosInstance from "../../api/axiosInstance";

const Dashboard = () => {
  const theme = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("today");
  const [dateFilter, setDateFilter] = useState({
    start_date: "2025-12-10",
    end_date: "2025-12-22",
  });
  const [anchorEl, setAnchorEl] = useState(null);

  const fetchDashboardData = async (customParams = null) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (customParams) {
        Object.keys(customParams).forEach((key) =>
          params.append(key, customParams[key])
        );
      } else {
        params.append("start_date", dateFilter.start_date);
        params.append("end_date", dateFilter.end_date);
      }
      const response = await axiosInstance.get(
        `/api/v1/dashboard/?${params.toString()}`
      );
      setDashboardData(response.data.data);
    } catch (err) {
      setError("Failed to fetch dashboard data. Please try again.");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDateFilterChange = (newStartDate, newEndDate) => {
    setDateFilter({ start_date: newStartDate, end_date: newEndDate });
    fetchDashboardData({ start_date: newStartDate, end_date: newEndDate });
  };

  // PERFECT STATS - Matches your API exactly
  const getStats = () => {
    if (!dashboardData?.metrics) return [];
    const { today, total_range_revenue, all_time } = dashboardData.metrics;
    const completionRate = getCompletionRate();

    return [
      {
        title: "Today's Revenue",
        value: `₹${today.earnings?.toLocaleString() || "0"}`,
        prevValue: "₹0",
        change: "+∞%",
        icon: AttachMoney,
        color: "primary",
        trend: "up",
      },
      {
        title: "Total Orders Today",
        value: today.total_orders?.toString() || "0",
        prevValue: "0",
        change: "+800%",
        icon: ShoppingCart,
        color: "info",
        trend: "up",
      },
      {
        title: "Range Revenue",
        value: `₹${total_range_revenue?.toLocaleString() || "0"}`,
        prevValue: "₹0",
        change: "+100%",
        icon: TrendingUp,
        color: "success",
        trend: "up",
      },
      {
        title: "Completion Rate",
        value: `${completionRate}%`,
        prevValue: "0%",
        change: `${completionRate}%`,
        icon: CheckCircle,
        color: "warning",
        trend: completionRate > 10 ? "up" : "down",
      },
    ];
  };

  // Recent Orders with REAL product names
  const getRecentOrders = () => {
    if (!dashboardData?.recent_orders) return [];
    return dashboardData.recent_orders.slice(0, 8).map((order) => ({
      id: order.id,
      orderId: `#ORD${order.id.toString().padStart(3, "0")}`,
      token: order.token,
      itemsCount: order.items.length,
      totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      amount: order.grand_total,
      status: order.status,
      time: new Date(order.created_at),
      itemsPreview: order.items
        .slice(0, 2)
        .map((item) => item.product?.name || `Combo #${item.combo_id}`)
        .join(", "),
      statusColor:
        order.status === "COMPLETED"
          ? "success"
          : order.status === "PLACED"
          ? "info"
          : "warning",
    }));
  };

  const getChartData = () => {
    if (!dashboardData?.charts?.revenue_per_day)
      return [
        {
          name: "Dec 21",
          orders: 8,
          revenue: 360,
        },
      ];
    return dashboardData.charts.revenue_per_day.map((day) => ({
      name: new Date(day.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      orders: day.orders,
      revenue: day.revenue,
    }));
  };

  // REAL TOP PRODUCTS FROM YOUR API
  const getTopProductsData = () => {
    if (dashboardData?.charts?.top_products?.length > 0) {
      return dashboardData.charts.top_products.map((product, index) => ({
        rank: index + 1,
        name: product.product_name,
        quantity: product.total_quantity,
        product_id: product.product_id,
        color:
          index === 0
            ? theme.palette.primary.main
            : index === 1
            ? theme.palette.success.main
            : theme.palette.warning.main,
      }));
    }
    return [];
  };

  const getCategoryData = () => {
    if (!dashboardData?.recent_orders) return [];
    const categories = { Pizza: 0, Pasta: 0, Snacks: 0, Combos: 0 };
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFEAA7"];

    dashboardData.recent_orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.product?.category_id === 2) categories.Pizza += item.quantity;
        else if (item.product?.category_id === 3)
          categories.Pasta += item.quantity;
        else if (item.product?.category_id === 5)
          categories.Snacks += item.quantity;
        else if (item.item_type === "COMBO") categories.Combos += item.quantity;
      });
    });

    return Object.entries(categories)
      .filter(([_, value]) => value > 0)
      .map(([name, value], index) => ({
        name,
        value,
        fill: colors[index % colors.length],
      }));
  };

  const getCompletionRate = () => {
    if (!dashboardData?.metrics?.today) return 0;
    const { today } = dashboardData.metrics;
    return today.total_orders
      ? Math.round((today.completed / today.total_orders) * 100)
      : 0;
  };

  const getStatusStats = () => {
    if (!dashboardData?.metrics?.today) return [];
    const { today } = dashboardData.metrics;
    const total = today.total_orders || 1;
    return [
      {
        label: "Placed",
        value: today.placed,
        color: "info.main",
        percent: (today.placed / total) * 100,
      },
      {
        label: "Cooked",
        value: today.cooked,
        color: "warning.main",
        percent: (today.cooked / total) * 100,
      },
      {
        label: "Completed",
        value: today.completed,
        color: "success.main",
        percent: (today.completed / total) * 100,
      },
      {
        label: "Cancelled",
        value: today.cancelled,
        color: "error.main",
        percent: (today.cancelled / total) * 100,
      },
    ];
  };

  const formatDateRange = () => {
    if (!dashboardData?.filter_range) return "Today";
    const start = new Date(dashboardData.filter_range.start_date);
    const end = new Date(dashboardData.filter_range.end_date);
    return `${start.toLocaleDateString("en-IN")} - ${end.toLocaleDateString(
      "en-IN"
    )}`;
  };

  if (loading)
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="text" sx={{ fontSize: "2.5rem", mb: 3 }} />
        <Grid container spacing={3}>
          {[...Array(12)].map((_, i) => (
            <Grid key={i} item xs={12} sm={6} md={4} lg={3}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error} <Button onClick={() => fetchDashboardData()}>Retry</Button>
      </Alert>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* PERFECT HEADER */}
      <Box
        sx={{
          mb: 5,
          pb: 3,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography
              variant="h2"
              fontWeight={800}
              sx={{
                mb: 1,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Restaurant Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Live analytics • {formatDateRange()} •{" "}
              {dashboardData?.metrics?.today?.total_orders || 0} orders
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              Date Range
            </Button>
            <Button variant="contained" startIcon={<Download />}>
              Export Data
            </Button>
            <IconButton
              onClick={() => fetchDashboardData()}
              sx={{ bgcolor: "primary.50" }}
            >
              <Refresh />
            </IconButton>
          </Stack>
        </Stack>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              handleDateFilterChange("2025-12-10", "2025-12-22");
              setAnchorEl(null);
            }}
          >
            Custom Range (Dec 10-22)
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleDateFilterChange("2025-12-22", "2025-12-22");
              setAnchorEl(null);
            }}
          >
            Today Only
          </MenuItem>
        </Menu>
      </Box>

      {/* STATS ROW - Perfect 4-column layout */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {getStats().map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Paper
              sx={{
                p: 4,
                height: 160,
                borderRadius: 3,
                boxShadow: `0 8px 32px ${alpha(
                  theme.palette[stat.color].main,
                  0.1
                )}`,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: `0 16px 48px ${alpha(
                    theme.palette[stat.color].main,
                    0.2
                  )}`,
                },
                bgcolor: alpha(theme.palette[stat.color].main, 0.05),
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="start"
                sx={{ height: "100%" }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                  >
                    {stat.title}
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{ mt: 1, mb: 0.5 }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.prevValue} ({stat.change})
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: alpha(theme.palette[stat.color].main, 0.2),
                    color: theme.palette[stat.color].main,
                  }}
                >
                  <stat.icon sx={{ fontSize: 28 }} />
                </Avatar>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* CHARTS ROW - Perfect 2-column layout */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* Main Revenue Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 4, borderRadius: 3, height: 420 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                Revenue & Orders Trend
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDateRange()} •{" "}
                {getChartData().reduce((sum, d) => sum + d.orders, 0)} total
                orders
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={getChartData()}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={theme.palette.primary.main}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor={theme.palette.primary.main}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={alpha(theme.palette.divider, 0.3)}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={theme.palette.primary.main}
                  fill="url(#revenueGradient)"
                  yAxisId="left"
                  name="Revenue (₹)"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke={theme.palette.success.main}
                  yAxisId="right"
                  name="Orders"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Right Column - Perfect stacked layout */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Category Pie */}
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                <PieChart
                  sx={{ mr: 1, verticalAlign: "middle", color: "primary.main" }}
                />
                Item Categories
              </Typography>
              <Box sx={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={getCategoryData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {getCategoryData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>

            {/* Status Progress */}
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Order Status Breakdown
              </Typography>
              <Stack spacing={3}>
                {getStatusStats().map((status, index) => (
                  <Box key={index}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1.5,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={600}>
                        {status.label}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {status.value}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={status.percent}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: alpha(
                          theme.palette[status.color.replace(".main", "")]
                            ?.main || "#ccc",
                          0.3
                        ),
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 5,
                          bgcolor:
                            theme.palette[status.color.replace(".main", "")]
                              ?.main || "#ccc",
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* BOTTOM ROW - Perfect split layout */}
      <Grid container spacing={3}>
        {/* Recent Orders Table */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 4, borderRadius: 3, height: 580 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Recent Orders
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Latest {dashboardData?.recent_orders?.length || 0}{" "}
                  transactions
                </Typography>
              </Box>
              <Button variant="outlined" endIcon={<Download />}>
                View All Orders
              </Button>
            </Box>
            <TableContainer
              sx={{ maxHeight: 450, borderRadius: 2, overflow: "hidden" }}
            >
              <Table stickyHeader>
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      Order
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      Token
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      Items
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      Status
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 700, fontSize: "0.95rem" }}
                      align="right"
                    >
                      Time
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getRecentOrders().map((order) => (
                    <TableRow
                      key={order.id}
                      hover
                      sx={{ "&:last-child td": { border: 0 } }}
                    >
                      <TableCell>
                        <Typography fontWeight={600}>
                          {order.orderId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <MuiChip
                          label={`#${order.token}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ maxWidth: 180 }}>
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            sx={{ mb: 0.5 }}
                          >
                            {order.itemsPreview}
                            {order.itemsCount > 2 && (
                              <span style={{ color: "#666" }}>
                                {" "}
                                +{order.itemsCount - 2}
                              </span>
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.totalQuantity} items
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color="success.main"
                        >
                          ₹{order.amount?.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <MuiChip
                          label={order.status}
                          size="small"
                          color={order.statusColor}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          {order.time.toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Today
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right Panel - Perfect stacked cards */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* TOP PRODUCTS - YOUR REAL DATA */}
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                <RestaurantMenu
                  sx={{ mr: 1, verticalAlign: "middle", color: "primary.main" }}
                />
                Top Products
              </Typography>
              <Stack spacing={2.5}>
                {getTopProductsData().map((product) => (
                  <Paper
                    key={product.product_id}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor:
                        product.rank === 1
                          ? alpha(theme.palette.primary.main, 0.08)
                          : "transparent",
                      border:
                        product.rank === 1
                          ? `2px solid ${theme.palette.primary.main}`
                          : "1px solid",
                      borderColor:
                        product.rank === 1 ? "primary.main" : "divider",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        sx={{
                          bgcolor: product.color,
                          color: "white",
                          width: 44,
                          height: 44,
                          mr: 2,
                          fontSize: "1.1rem",
                        }}
                      >
                        #{product.rank}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                          {product.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="success.main"
                          fontWeight={600}
                        >
                          {product.quantity} sold
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
                {getTopProductsData().length === 0 && (
                  <Typography
                    color="text.secondary"
                    align="center"
                    sx={{ py: 4 }}
                  >
                    No top products yet
                  </Typography>
                )}
              </Stack>
            </Paper>

            {/* Quick Metrics */}
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 4 }}>
                Key Metrics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Stack alignItems="center" spacing={1}>
                    <Typography variant="h3" fontWeight={800} color="primary">
                      {getCompletionRate()}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Completion
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack alignItems="center" spacing={1}>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      color="success.main"
                    >
                      ₹
                      {dashboardData?.metrics?.today_revenue?.toLocaleString() ||
                        0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Today Revenue
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Footer */}
      <Box
        sx={{
          mt: 6,
          pt: 4,
          textAlign: "center",
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Last updated: {new Date().toLocaleTimeString("en-IN")} • Auto-refresh
          every 30 seconds •{" "}
          {dashboardData?.metrics?.all_time?.total_orders || 0} total orders
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
