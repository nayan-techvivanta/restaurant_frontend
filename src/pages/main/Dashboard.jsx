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
  Badge,
  Tooltip,
  CircularProgress,
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
  People,
  Timer,
  Cancel,
  DeliveryDining,
  ReceiptLong,
} from "@mui/icons-material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Line,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts";
import axiosInstance from "../../api/axiosInstance";

// Yellow Theme Colors
const YELLOW_THEME_COLORS = {
  primary: "#FFC107", // Amber 500 - Main Yellow
  secondary: "#FF9800", // Orange 500 - Accent
  info: "#2196F3", // Blue 500
  success: "#4CAF50", // Green 500
  warning: "#FF5722", // Deep Orange 500
  error: "#F44336", // Red 500
  neutral: "#9E9E9E", // Grey 500
  darkYellow: "#FFA000", // Amber 700
  lightYellow: "#FFECB3", // Amber 100
};

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
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (customParams = null) => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError(null);
      const params = new URLSearchParams();
      if (customParams) {
        Object.keys(customParams).forEach((key) =>
          params.append(key, customParams[key]),
        );
      } else {
        params.append("start_date", dateFilter.start_date);
        params.append("end_date", dateFilter.end_date);
      }
      const response = await axiosInstance.get(
        `/api/v1/dashboard/?${params.toString()}`,
      );
      setDashboardData(response.data.data);
    } catch (err) {
      setError("Failed to fetch dashboard data. Please try again.");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleDateFilterChange = (newStartDate, newEndDate) => {
    setDateFilter({ start_date: newStartDate, end_date: newEndDate });
    fetchDashboardData({ start_date: newStartDate, end_date: newEndDate });
  };

  // Safe alpha function that handles color names
  const safeAlpha = (colorValue, opacity) => {
    if (
      typeof colorValue === "string" &&
      (colorValue.startsWith("#") || colorValue.startsWith("rgb"))
    ) {
      return alpha(colorValue, opacity);
    }

    if (YELLOW_THEME_COLORS[colorValue]) {
      return alpha(YELLOW_THEME_COLORS[colorValue], opacity);
    }

    return alpha(YELLOW_THEME_COLORS.primary, opacity);
  };

  // Calculate stats from API data
  const getStats = () => {
    if (!dashboardData?.metrics) return getDefaultStats();
    const { today, total_range_revenue } = dashboardData.metrics;
    const completionRate = getCompletionRate();
    const avgOrderValue =
      today.total_orders > 0 ? today.earnings / today.total_orders : 0;

    return [
      {
        title: "Today's Revenue",
        value: `₹${(today.earnings || 0).toLocaleString()}`,
        subtitle: `from ${today.total_orders || 0} orders`,
        change: `+${today.earnings > 0 ? "∞%" : "0%"}`,
        icon: AttachMoney,
        color: "primary",
        colorValue: YELLOW_THEME_COLORS.primary,
        trend: today.earnings > 0 ? "up" : "neutral",
        iconColor: YELLOW_THEME_COLORS.primary,
      },
      {
        title: "Total Orders",
        value: (today.total_orders || 0).toString(),
        subtitle: `${today.completed || 0} completed`,
        change: "+∞%",
        icon: ShoppingCart,
        color: "info",
        colorValue: YELLOW_THEME_COLORS.info,
        trend: today.total_orders > 0 ? "up" : "neutral",
        iconColor: YELLOW_THEME_COLORS.info,
      },
      {
        title: "Avg Order Value",
        value: `₹${avgOrderValue.toFixed(0)}`,
        subtitle: "per order",
        change: "+12.5%",
        icon: TrendingUp,
        color: "success",
        colorValue: YELLOW_THEME_COLORS.success,
        trend: avgOrderValue > 0 ? "up" : "neutral",
        iconColor: YELLOW_THEME_COLORS.success,
      },
      {
        title: "Completion Rate",
        value: `${completionRate}%`,
        subtitle: `${today.completed || 0}/${today.total_orders || 0}`,
        change: `${completionRate > 0 ? "+" : ""}${completionRate}%`,
        icon: CheckCircle,
        color: "warning",
        colorValue: YELLOW_THEME_COLORS.warning,
        trend:
          completionRate > 50 ? "up" : completionRate > 0 ? "neutral" : "down",
        iconColor: YELLOW_THEME_COLORS.warning,
      },
    ];
  };

  const getDefaultStats = () => [
    {
      title: "Today's Revenue",
      value: "₹0",
      subtitle: "No orders today",
      change: "0%",
      icon: AttachMoney,
      color: "primary",
      colorValue: YELLOW_THEME_COLORS.primary,
      trend: "neutral",
      iconColor: YELLOW_THEME_COLORS.primary,
    },
    {
      title: "Total Orders",
      value: "0",
      subtitle: "0 completed",
      change: "0%",
      icon: ShoppingCart,
      color: "info",
      colorValue: YELLOW_THEME_COLORS.info,
      trend: "neutral",
      iconColor: YELLOW_THEME_COLORS.info,
    },
    {
      title: "Avg Order Value",
      value: "₹0",
      subtitle: "per order",
      change: "0%",
      icon: TrendingUp,
      color: "success",
      colorValue: YELLOW_THEME_COLORS.success,
      trend: "neutral",
      iconColor: YELLOW_THEME_COLORS.success,
    },
    {
      title: "Completion Rate",
      value: "0%",
      subtitle: "0/0",
      change: "0%",
      icon: CheckCircle,
      color: "warning",
      colorValue: YELLOW_THEME_COLORS.warning,
      trend: "neutral",
      iconColor: YELLOW_THEME_COLORS.warning,
    },
  ];

  // Extract recent orders from API
  const getRecentOrders = () => {
    if (!dashboardData?.recent_orders) return [];
    return dashboardData.recent_orders.slice(0, 8).map((order) => ({
      id: order.id,
      orderId: `#${order.id.toString().padStart(3, "0")}`,
      token: order.token,
      itemsCount: order.items.length,
      totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      amount: order.grand_total,
      status: order.status,
      orderType: order.order_type,
      time: new Date(order.created_at),
      items: order.items,
      statusColor:
        order.status === "COMPLETED"
          ? "success"
          : order.status === "PLACED"
            ? "primary"
            : order.status === "CANCELLED"
              ? "error"
              : "warning",
    }));
  };

  // Generate chart data from recent orders
  const getChartData = () => {
    if (
      !dashboardData?.recent_orders ||
      dashboardData.recent_orders.length === 0
    ) {
      return generateMockChartData();
    }

    // Group orders by hour
    const ordersByHour = {};
    dashboardData.recent_orders.forEach((order) => {
      const hour = new Date(order.created_at).getHours();
      const hourLabel = `${hour}:00`;
      if (!ordersByHour[hourLabel]) {
        ordersByHour[hourLabel] = {
          orders: 0,
          revenue: 0,
          count: 0,
        };
      }
      ordersByHour[hourLabel].orders += 1;
      ordersByHour[hourLabel].revenue += order.grand_total;
      ordersByHour[hourLabel].count += 1;
    });

    return Object.keys(ordersByHour)
      .sort()
      .map((hour) => ({
        name: hour,
        orders: ordersByHour[hour].orders,
        revenue: ordersByHour[hour].revenue,
        average: ordersByHour[hour].revenue / ordersByHour[hour].orders,
      }));
  };

  const generateMockChartData = () => {
    const hours = [
      "9:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ];
    return hours.map((hour) => ({
      name: hour,
      orders: Math.floor(Math.random() * 10) + 1,
      revenue: Math.floor(Math.random() * 5000) + 1000,
      average: Math.floor(Math.random() * 300) + 100,
    }));
  };

  // Get top products from recent orders
  const getTopProductsData = () => {
    if (!dashboardData?.recent_orders) return [];

    const productSales = {};
    dashboardData.recent_orders.forEach((order) => {
      order.items.forEach((item) => {
        let productName = "Unknown Item";
        let productId = null;

        if (item.product) {
          productName = item.product.name;
          productId = item.product.id;
        } else if (item.combo) {
          productName = item.combo.name;
          productId = `combo_${item.combo.id}`;
        }

        if (!productSales[productId]) {
          productSales[productId] = {
            name: productName,
            quantity: 0,
            revenue: 0,
            id: productId,
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.price * item.quantity;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map((product, index) => ({
        rank: index + 1,
        name: product.name,
        quantity: product.quantity,
        revenue: product.revenue,
        id: product.id,
        color: [
          YELLOW_THEME_COLORS.primary,
          YELLOW_THEME_COLORS.success,
          YELLOW_THEME_COLORS.info,
          YELLOW_THEME_COLORS.warning,
          YELLOW_THEME_COLORS.secondary,
        ][index % 5],
      }));
  };

  // Get category distribution from recent orders
  const getCategoryData = () => {
    if (!dashboardData?.recent_orders) return [];

    const categories = {};
    // Yellow theme friendly colors
    const colors = [
      YELLOW_THEME_COLORS.primary,
      YELLOW_THEME_COLORS.secondary,
      YELLOW_THEME_COLORS.info,
      YELLOW_THEME_COLORS.success,
      "#FFD54F", // Amber 300
      "#FFB300", // Amber 600
    ];
    let colorIndex = 0;

    dashboardData.recent_orders.forEach((order) => {
      order.items.forEach((item) => {
        let categoryName = "Other";

        if (item.product?.category_id) {
          const categoryMap = {
            14: "Indian Snacks",
          };
          categoryName =
            categoryMap[item.product.category_id] ||
            `Category ${item.product.category_id}`;
        } else if (item.combo) {
          categoryName = "Combos";
        }

        if (!categories[categoryName]) {
          categories[categoryName] = {
            name: categoryName,
            value: 0,
            fill: colors[colorIndex % colors.length],
          };
          colorIndex++;
        }
        categories[categoryName].value += item.quantity;
      });
    });

    return Object.values(categories).sort((a, b) => b.value - a.value);
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
        color: YELLOW_THEME_COLORS.primary,
        percent: (today.placed / total) * 100,
        icon: AccessTime,
      },
      {
        label: "Completed",
        value: today.completed,
        color: YELLOW_THEME_COLORS.success,
        percent: (today.completed / total) * 100,
        icon: CheckCircle,
      },
      {
        label: "Cancelled",
        value: today.cancelled,
        color: YELLOW_THEME_COLORS.error,
        percent: (today.cancelled / total) * 100,
        icon: Cancel,
      },
    ];
  };

  const getOrderTypeStats = () => {
    if (!dashboardData?.recent_orders) return [];
    const types = { DELIVERY: 0, DINE_IN: 0, TAKEAWAY: 0 };

    dashboardData.recent_orders.forEach((order) => {
      const type = order.order_type;
      if (types[type] !== undefined) {
        types[type]++;
      }
    });

    return Object.entries(types)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round(
          (count / dashboardData.recent_orders.length) * 100,
        ),
      }));
  };

  const formatDateRange = () => {
    if (!dashboardData?.filter_range) return "Today";
    const start = new Date(dashboardData.filter_range.start_date);
    const end = new Date(dashboardData.filter_range.end_date);
    return `${start.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    })} - ${end.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    })}`;
  };

  if (loading && !dashboardData)
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton
          variant="text"
          sx={{ fontSize: "2.5rem", mb: 3, width: 300 }}
        />
        <Grid container spacing={3}>
          {[...Array(4)].map((_, i) => (
            <Grid key={i} item xs={12} sm={6} md={3}>
              <Skeleton
                variant="rectangular"
                height={140}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
          <Grid item xs={12} lg={8}>
            <Skeleton
              variant="rectangular"
              height={400}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Skeleton
              variant="rectangular"
              height={400}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        </Grid>
      </Box>
    );

  if (error)
    return (
      <Box sx={{ p: 4 }}>
        <Alert
          severity="error"
          sx={{
            mb: 3,
            "& .MuiAlert-message": {
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            },
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => fetchDashboardData()}
              disabled={refreshing}
            >
              {refreshing ? "Loading..." : "Retry"}
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* HEADER - Yellow Theme */}
      <Box
        sx={{
          mb: 4,
          pb: 3,
          borderBottom: `2px solid ${alpha(YELLOW_THEME_COLORS.primary, 0.3)}`,
          background: `linear-gradient(90deg, ${alpha(YELLOW_THEME_COLORS.primary, 0.1)} 0%, transparent 100%)`,
          borderRadius: 2,
          px: 3,
          pt: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={900}
              sx={{
                mb: 1,
                background: `linear-gradient(45deg, ${YELLOW_THEME_COLORS.primary}, ${YELLOW_THEME_COLORS.secondary})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Restaurant
                sx={{
                  fontSize: 40,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                }}
              />
              <Box>
                <Box>Restaurant Dashboard</Box>
                <Typography
                  variant="caption"
                  sx={{
                    background: `linear-gradient(45deg, ${YELLOW_THEME_COLORS.primary}, ${YELLOW_THEME_COLORS.secondary})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 600,
                    display: "block",
                    mt: 0.5,
                  }}
                >
                  Real-time Analytics & Insights
                </Typography>
              </Box>
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="body1" color="text.secondary">
                <Badge color="warning" variant="dot" sx={{ mr: 1 }} />
                Live updates • {formatDateRange()} •
                <Box
                  component="span"
                  sx={{
                    color: YELLOW_THEME_COLORS.primary,
                    fontWeight: 600,
                    ml: 1,
                  }}
                >
                  {dashboardData?.metrics?.today?.total_orders || 0} orders
                  today
                </Box>
              </Typography>
              {refreshing && (
                <CircularProgress
                  size={16}
                  sx={{ color: YELLOW_THEME_COLORS.primary }}
                />
              )}
            </Stack>
          </Box>
          <Stack direction="row" spacing={1.5} sx={{ mt: { xs: 2, md: 0 } }}>
            <Tooltip title="Filter by date">
              <Button
                variant="contained"
                startIcon={<FilterList />}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                size="small"
                sx={{
                  bgcolor: YELLOW_THEME_COLORS.primary,
                  color: "#000",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: YELLOW_THEME_COLORS.darkYellow,
                  },
                }}
              >
                {formatDateRange()}
              </Button>
            </Tooltip>
            <Tooltip title="Export data">
              <Button
                variant="outlined"
                startIcon={<Download />}
                size="small"
                sx={{
                  borderColor: YELLOW_THEME_COLORS.primary,
                  color: YELLOW_THEME_COLORS.primary,
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: YELLOW_THEME_COLORS.darkYellow,
                    bgcolor: alpha(YELLOW_THEME_COLORS.primary, 0.1),
                  },
                }}
              >
                Export
              </Button>
            </Tooltip>
            <Tooltip title="Refresh data">
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  bgcolor: alpha(YELLOW_THEME_COLORS.primary, 0.2),
                  color: YELLOW_THEME_COLORS.primary,
                  "&:hover": {
                    bgcolor: alpha(YELLOW_THEME_COLORS.primary, 0.3),
                  },
                }}
              >
                <Refresh
                  sx={{
                    animation: refreshing ? "spin 1s linear infinite" : "none",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </IconButton>
            </Tooltip>
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
            sx={{
              "&:hover": {
                bgcolor: alpha(YELLOW_THEME_COLORS.primary, 0.1),
              },
            }}
          >
            Last 30 days
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleDateFilterChange("2025-12-22", "2025-12-22");
              setAnchorEl(null);
            }}
            sx={{
              "&:hover": {
                bgcolor: alpha(YELLOW_THEME_COLORS.primary, 0.1),
              },
            }}
          >
            Today Only
          </MenuItem>
          <MenuItem
            onClick={() => {
              const today = new Date().toISOString().split("T")[0];
              handleDateFilterChange(today, today);
              setAnchorEl(null);
            }}
            sx={{
              "&:hover": {
                bgcolor: alpha(YELLOW_THEME_COLORS.primary, 0.1),
              },
            }}
          >
            Current Day
          </MenuItem>
        </Menu>
      </Box>

      {/* STATS CARDS - Yellow Theme */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {getStats().map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Paper
              sx={{
                p: 3,
                height: "100%",
                borderRadius: 3,
                border: `2px solid ${safeAlpha(stat.colorValue, 0.3)}`,
                background: `linear-gradient(135deg, ${safeAlpha(stat.colorValue, 0.08)} 0%, ${safeAlpha(stat.colorValue, 0.03)} 100%)`,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: `0 12px 28px ${safeAlpha(stat.colorValue, 0.2)}`,
                  borderColor: stat.colorValue,
                },
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 5,
                  background: `linear-gradient(90deg, ${stat.colorValue}, ${safeAlpha(stat.colorValue, 0.7)})`,
                  borderRadius: "3px 3px 0 0",
                },
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontWeight: 600 }}
                  >
                    {stat.title}
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{
                      mb: 0.5,
                      color:
                        stat.color === "primary"
                          ? YELLOW_THEME_COLORS.primary
                          : stat.color === "warning"
                            ? YELLOW_THEME_COLORS.warning
                            : "text.primary",
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      {stat.subtitle}
                    </Typography>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor:
                          stat.trend === "up"
                            ? safeAlpha(YELLOW_THEME_COLORS.success, 0.15)
                            : stat.trend === "down"
                              ? safeAlpha(YELLOW_THEME_COLORS.error, 0.15)
                              : safeAlpha(YELLOW_THEME_COLORS.neutral, 0.15),
                        color:
                          stat.trend === "up"
                            ? YELLOW_THEME_COLORS.success
                            : stat.trend === "down"
                              ? YELLOW_THEME_COLORS.error
                              : YELLOW_THEME_COLORS.neutral,
                        fontWeight: 700,
                        fontSize: "0.7rem",
                      }}
                    >
                      {stat.trend === "up" && (
                        <ArrowUpward sx={{ fontSize: 12, mr: 0.25 }} />
                      )}
                      {stat.trend === "down" && (
                        <ArrowDownward sx={{ fontSize: 12, mr: 0.25 }} />
                      )}
                      {stat.change}
                    </Box>
                  </Stack>
                </Box>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: safeAlpha(stat.colorValue, 0.15),
                    color: stat.colorValue,
                    border: `2px solid ${safeAlpha(stat.colorValue, 0.3)}`,
                    boxShadow: `0 4px 12px ${safeAlpha(stat.colorValue, 0.2)}`,
                  }}
                >
                  <stat.icon sx={{ fontSize: 28 }} />
                </Avatar>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* MAIN CHARTS ROW - Yellow Theme */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue & Orders Chart */}
        <Grid item xs={12} lg={8}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              height: "100%",
              border: `2px solid ${alpha(YELLOW_THEME_COLORS.primary, 0.2)}`,
              background: `linear-gradient(135deg, ${alpha(YELLOW_THEME_COLORS.primary, 0.05)} 0%, transparent 100%)`,
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ mb: 0.5, color: YELLOW_THEME_COLORS.primary }}
                  >
                    Revenue & Orders Trend
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Real-time performance for {formatDateRange()}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Chip
                    label="Revenue"
                    size="small"
                    sx={{
                      bgcolor: safeAlpha(YELLOW_THEME_COLORS.primary, 0.15),
                      color: YELLOW_THEME_COLORS.primary,
                      fontWeight: 600,
                      border: `1px solid ${alpha(YELLOW_THEME_COLORS.primary, 0.3)}`,
                    }}
                  />
                  <Chip
                    label="Orders"
                    size="small"
                    sx={{
                      bgcolor: safeAlpha(YELLOW_THEME_COLORS.success, 0.15),
                      color: YELLOW_THEME_COLORS.success,
                      fontWeight: 600,
                      border: `1px solid ${alpha(YELLOW_THEME_COLORS.success, 0.3)}`,
                    }}
                  />
                </Box>
              </Stack>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
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
                        offset="5%"
                        stopColor={YELLOW_THEME_COLORS.primary}
                        stopOpacity={0.6}
                      />
                      <stop
                        offset="95%"
                        stopColor={YELLOW_THEME_COLORS.primary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="ordersGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={YELLOW_THEME_COLORS.success}
                        stopOpacity={0.6}
                      />
                      <stop
                        offset="95%"
                        stopColor={YELLOW_THEME_COLORS.success}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={alpha(YELLOW_THEME_COLORS.primary, 0.2)}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${value}`}
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <RechartsTooltip
                    formatter={(value, name) => {
                      if (name === "revenue")
                        return [
                          `₹${Number(value).toLocaleString()}`,
                          "Revenue",
                        ];
                      if (name === "orders") return [value, "Orders"];
                      return [value, name];
                    }}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${alpha(YELLOW_THEME_COLORS.primary, 0.2)}`,
                      borderRadius: 8,
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke={YELLOW_THEME_COLORS.primary}
                    fill="url(#revenueGradient)"
                    strokeWidth={3}
                    name="Revenue"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke={YELLOW_THEME_COLORS.success}
                    fill="url(#ordersGradient)"
                    strokeWidth={3}
                    name="Orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Category & Status */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Category Distribution */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: `2px solid ${alpha(YELLOW_THEME_COLORS.secondary, 0.2)}`,
                background: `linear-gradient(135deg, ${alpha(YELLOW_THEME_COLORS.secondary, 0.05)} 0%, transparent 100%)`,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 3, color: YELLOW_THEME_COLORS.secondary }}
              >
                <PieChart
                  sx={{ mr: 1.5, fontSize: 20, verticalAlign: "middle" }}
                />
                Category Distribution
              </Typography>
              <Box sx={{ height: 200 }}>
                {getCategoryData().length > 0 ? (
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
                        label={(entry) => `${entry.name}: ${entry.value}`}
                      >
                        {getCategoryData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.fill}
                            stroke={alpha(entry.fill, 0.8)}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value) => [`${value} items`, "Quantity"]}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${alpha(YELLOW_THEME_COLORS.primary, 0.2)}`,
                          borderRadius: 8,
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography color="text.secondary">
                      No category data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Order Status Progress */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: `2px solid ${alpha(YELLOW_THEME_COLORS.warning, 0.2)}`,
                background: `linear-gradient(135deg, ${alpha(YELLOW_THEME_COLORS.warning, 0.05)} 0%, transparent 100%)`,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 3, color: YELLOW_THEME_COLORS.warning }}
              >
                Order Status Overview
              </Typography>
              <Stack spacing={2}>
                {getStatusStats().map((status, index) => (
                  <Box key={index}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <status.icon
                          sx={{ fontSize: 18, color: status.color }}
                        />
                        <Typography variant="subtitle2" fontWeight={600}>
                          {status.label}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        color={status.color}
                      >
                        {status.value} ({Math.round(status.percent)}%)
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={status.percent}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: safeAlpha(status.color, 0.15),
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          bgcolor: status.color,
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

      {/* BOTTOM ROW - Yellow Theme */}
      <Grid container spacing={3}>
        {/* Recent Orders Table */}
        <Grid item xs={12} lg={8}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              height: "100%",
              border: `2px solid ${alpha(YELLOW_THEME_COLORS.primary, 0.2)}`,
              background: `linear-gradient(135deg, ${alpha(YELLOW_THEME_COLORS.primary, 0.03)} 0%, transparent 100%)`,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ mb: 0.5, color: YELLOW_THEME_COLORS.primary }}
                >
                  Recent Orders
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Latest{" "}
                  {Math.min(8, dashboardData?.recent_orders?.length || 0)} of{" "}
                  {dashboardData?.recent_orders?.length || 0} orders
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<ReceiptLong />}
                  sx={{
                    bgcolor: YELLOW_THEME_COLORS.primary,
                    color: "#000",
                    fontWeight: 600,
                    "&:hover": {
                      bgcolor: YELLOW_THEME_COLORS.darkYellow,
                    },
                  }}
                >
                  View All
                </Button>
                <IconButton
                  size="small"
                  sx={{
                    border: `1px solid ${alpha(YELLOW_THEME_COLORS.primary, 0.3)}`,
                    color: YELLOW_THEME_COLORS.primary,
                  }}
                >
                  <MoreHoriz />
                </IconButton>
              </Stack>
            </Stack>
            <TableContainer
              sx={{
                maxHeight: 400,
                borderRadius: 2,
                border: `1px solid ${alpha(YELLOW_THEME_COLORS.primary, 0.1)}`,
              }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: alpha(YELLOW_THEME_COLORS.primary, 0.08),
                      "& th": {
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        color: YELLOW_THEME_COLORS.darkYellow,
                        borderBottom: `2px solid ${alpha(YELLOW_THEME_COLORS.primary, 0.3)}`,
                      },
                    }}
                  >
                    <TableCell>Order ID</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getRecentOrders().length > 0 ? (
                    getRecentOrders().map((order, index) => (
                      <TableRow
                        key={order.id}
                        hover
                        sx={{
                          "&:last-child td": { border: 0 },
                          "&:hover": {
                            bgcolor: alpha(YELLOW_THEME_COLORS.primary, 0.05),
                          },
                          bgcolor:
                            index % 2 === 0
                              ? "transparent"
                              : alpha(YELLOW_THEME_COLORS.primary, 0.02),
                        }}
                      >
                        <TableCell>
                          <Stack>
                            <Typography fontWeight={700} variant="body2">
                              {order.orderId}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Token #{order.token}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2" fontWeight={500}>
                              {order.items.slice(0, 2).map((item, idx) => (
                                <span key={idx}>
                                  {item.product?.name ||
                                    item.combo?.name ||
                                    "Unknown"}
                                  {idx < order.items.slice(0, 2).length - 1
                                    ? ", "
                                    : ""}
                                </span>
                              ))}
                              {order.itemsCount > 2 && (
                                <span
                                  style={{
                                    color: YELLOW_THEME_COLORS.primary,
                                    fontWeight: 600,
                                  }}
                                >
                                  {" "}
                                  +{order.itemsCount - 2} more
                                </span>
                              )}
                            </Typography>
                            <Typography
                              variant="caption"
                              color={YELLOW_THEME_COLORS.darkYellow}
                              fontWeight={600}
                            >
                              {order.totalQuantity} items • {order.itemsCount}{" "}
                              types
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.orderType}
                            size="small"
                            icon={<DeliveryDining sx={{ fontSize: 14 }} />}
                            variant="outlined"
                            sx={{
                              borderColor: YELLOW_THEME_COLORS.primary,
                              color: YELLOW_THEME_COLORS.darkYellow,
                              fontWeight: 600,
                              bgcolor: alpha(YELLOW_THEME_COLORS.primary, 0.1),
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="h6"
                            fontWeight={800}
                            color={YELLOW_THEME_COLORS.success}
                          >
                            ₹{order.amount?.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            size="small"
                            color={order.statusColor}
                            sx={{
                              fontWeight: 700,
                              minWidth: 90,
                              bgcolor:
                                order.status === "COMPLETED"
                                  ? alpha(YELLOW_THEME_COLORS.success, 0.15)
                                  : order.status === "PLACED"
                                    ? alpha(YELLOW_THEME_COLORS.primary, 0.15)
                                    : alpha(YELLOW_THEME_COLORS.error, 0.15),
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack alignItems="flex-end">
                            <Typography variant="body2" fontWeight={700}>
                              {order.time.toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {order.time.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No recent orders
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right Column - Top Products & Order Types */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Top Products */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: `2px solid ${alpha(YELLOW_THEME_COLORS.secondary, 0.2)}`,
                background: `linear-gradient(135deg, ${alpha(YELLOW_THEME_COLORS.secondary, 0.05)} 0%, transparent 100%)`,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 3, color: YELLOW_THEME_COLORS.secondary }}
              >
                <RestaurantMenu
                  sx={{ mr: 1.5, fontSize: 20, verticalAlign: "middle" }}
                />
                Top Products
              </Typography>
              <Stack spacing={2}>
                {getTopProductsData().length > 0 ? (
                  getTopProductsData().map((product) => (
                    <Stack
                      key={product.id}
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: `2px solid ${safeAlpha(product.color, 0.3)}`,
                        bgcolor: safeAlpha(product.color, 0.08),
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateX(8px)",
                          borderColor: product.color,
                          bgcolor: safeAlpha(product.color, 0.15),
                          boxShadow: `0 4px 12px ${safeAlpha(product.color, 0.2)}`,
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: product.color,
                          color: "#000",
                          width: 40,
                          height: 40,
                          fontSize: "0.9rem",
                          fontWeight: 800,
                          boxShadow: `0 3px 8px ${safeAlpha(product.color, 0.4)}`,
                        }}
                      >
                        #{product.rank}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          fontWeight={800}
                          variant="body2"
                          sx={{ mb: 0.25, color: product.color }}
                        >
                          {product.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={600}
                        >
                          {product.quantity} sold • ₹
                          {product.revenue.toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>
                  ))
                ) : (
                  <Typography
                    color="text.secondary"
                    align="center"
                    sx={{ py: 2 }}
                  >
                    No product data available
                  </Typography>
                )}
              </Stack>
            </Paper>

            {/* Order Types Distribution */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: `2px solid ${alpha(YELLOW_THEME_COLORS.primary, 0.2)}`,
                background: `linear-gradient(135deg, ${alpha(YELLOW_THEME_COLORS.primary, 0.05)} 0%, transparent 100%)`,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 3, color: YELLOW_THEME_COLORS.primary }}
              >
                Order Types
              </Typography>
              <Stack spacing={2}>
                {getOrderTypeStats().map((type) => (
                  <Box key={type.type} sx={{ mb: 2 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mb: 1 }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={YELLOW_THEME_COLORS.darkYellow}
                      >
                        {type.type.replace("_", " ")}
                      </Typography>
                      <Typography variant="body2" fontWeight={800}>
                        {type.count} ({type.percentage}%)
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={type.percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: safeAlpha(YELLOW_THEME_COLORS.primary, 0.15),
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          bgcolor: YELLOW_THEME_COLORS.primary,
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

      {/* FOOTER - Yellow Theme */}
      <Box
        sx={{
          mt: 4,
          pt: 3,
          borderTop: `2px solid ${alpha(YELLOW_THEME_COLORS.primary, 0.3)}`,
          background: `linear-gradient(90deg, ${alpha(YELLOW_THEME_COLORS.primary, 0.1)} 0%, transparent 100%)`,
          borderRadius: 2,
          px: 3,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            <Box
              component="span"
              sx={{ color: YELLOW_THEME_COLORS.primary, mr: 1 }}
            >
              Last updated:
            </Box>
            {new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}{" "}
            • Auto-refresh every 30s •
            <Box
              component="span"
              sx={{
                color: YELLOW_THEME_COLORS.primary,
                ml: 1,
                fontWeight: 700,
              }}
            >
              Total orders:{" "}
              {dashboardData?.metrics?.all_time?.total_orders || 0}
            </Box>
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              <Box component="span" sx={{ color: YELLOW_THEME_COLORS.primary }}>
                Data source:
              </Box>{" "}
              Live API
            </Typography>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: refreshing
                  ? YELLOW_THEME_COLORS.warning
                  : YELLOW_THEME_COLORS.success,
                animation: refreshing ? "pulse 1s infinite" : "none",
                boxShadow: `0 0 8px ${refreshing ? YELLOW_THEME_COLORS.warning : YELLOW_THEME_COLORS.success}`,
                "@keyframes pulse": {
                  "0%, 100%": {
                    transform: "scale(1)",
                    opacity: 1,
                  },
                  "50%": {
                    transform: "scale(1.2)",
                    opacity: 0.7,
                  },
                },
              }}
            />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default Dashboard;
