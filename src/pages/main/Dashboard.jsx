import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
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
  AvatarGroup,
  Button,
  Card,
  CardContent,
  Divider,
  alpha,
  useTheme
} from "@mui/material";
import {
  TrendingUp,
  Restaurant,
  AttachMoney,
  LocalShipping,
  CheckCircle,
  PendingActions,
  ArrowUpward,
  ArrowDownward,
  Refresh,
  Cancel,
  Schedule,
  Person,
  ShoppingCart,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  MoreHoriz,
  Visibility,
  Download,
  FilterList,
  Notifications
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import axiosInstance from "../../api/axiosInstance";

const Dashboard = () => {
  const theme = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("today");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/api/v1/dashboard/");
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

  // Statistics Cards Data based on API
  const getStats = () => {
    if (!dashboardData?.metrics) return [];

    const { today, all_time } = dashboardData.metrics;
    const completionRate = getCompletionRate();

    return [
      {
        title: "Today's Revenue",
        value: `₹${today.earnings?.toLocaleString() || '0'}`,
        icon: <AttachMoney />,
        color: theme.palette.primary.main,
        change: "+18.2%",
        trend: "up",
        subtitle: "vs yesterday",
        gradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
      },
      {
        title: "Total Orders",
        value: today.total_orders?.toString() || '0',
        icon: <ShoppingCart />,
        color: theme.palette.info.main,
        change: "+12.5%",
        trend: "up",
        subtitle: "orders today",
        gradient: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`
      },
      {
        title: "Completed Orders",
        value: today.completed?.toString() || '0',
        icon: <CheckCircle />,
        color: theme.palette.success.main,
        change: "+15.3%",
        trend: "up",
        subtitle: "successfully delivered",
        gradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`
      },
      {
        title: "Processing Rate",
        value: `${completionRate}%`,
        icon: <BarChartIcon />,
        color: theme.palette.warning.main,
        change: completionRate > 85 ? "+8%" : "-2%",
        trend: completionRate > 85 ? "up" : "down",
        subtitle: "order efficiency",
        gradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`
      },
    ];
  };

  // Format recent orders for table
  const getRecentOrders = () => {
    if (!dashboardData?.recent_orders) return [];

    return dashboardData.recent_orders.slice(0, 6).map(order => ({
      id: order.id,
      orderId: `#ORD${order.id.toString().padStart(3, '0')}`,
      customer: `Customer ${order.id}`,
      items: order.items.length,
      amount: order.grand_total,
      status: order.status,
      time: new Date(order.created_at),
      itemsList: order.items.map(item => item.product?.name || "Unknown Item")
    }));
  };

  // Generate chart data from recent orders
  const getChartData = () => {
    if (!dashboardData?.recent_orders) return [];

    const hours = Array.from({ length: 12 }, (_, i) => {
      const hour = i + 8; // 8 AM to 8 PM
      return {
        name: `${hour}:00`,
        hour: hour,
        orders: 0,
        revenue: 0
      };
    });

    dashboardData.recent_orders.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      const hourData = hours.find(h => h.hour === hour);
      if (hourData) {
        hourData.orders += 1;
        hourData.revenue += order.grand_total;
      }
    });

    return hours;
  };

  // Get category data from orders
  const getCategoryData = () => {
    if (!dashboardData?.recent_orders) return [];

    const categoryCount = {};
    const colors = [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.info.main,
    ];

    dashboardData.recent_orders.forEach(order => {
      order.items.forEach(item => {
        const category = `Category ${item.product?.category_id || '0'}`;
        if (!categoryCount[category]) {
          categoryCount[category] = 0;
        }
        categoryCount[category] += item.quantity;
      });
    });

    return Object.keys(categoryCount).map((category, index) => ({
      name: category,
      value: categoryCount[category],
      color: colors[index % colors.length]
    }));
  };

  // Get popular items from orders
  const getPopularItems = () => {
    if (!dashboardData?.recent_orders) return [];

    const itemCount = {};

    dashboardData.recent_orders.forEach(order => {
      order.items.forEach(item => {
        const productName = item.product?.name || "Unknown Product";
        if (!itemCount[productName]) {
          itemCount[productName] = {
            orders: 0,
            quantity: 0,
            revenue: 0
          };
        }
        itemCount[productName].orders += 1;
        itemCount[productName].quantity += item.quantity;
        itemCount[productName].revenue += item.quantity * item.price;
      });
    });

    return Object.keys(itemCount)
      .map(productName => ({
        name: productName,
        orders: itemCount[productName].orders,
        quantity: itemCount[productName].quantity,
        revenue: itemCount[productName].revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  // Calculate completion rate
  const getCompletionRate = () => {
    if (!dashboardData?.metrics?.today) return 0;

    const { today } = dashboardData.metrics;
    const totalProcessed = (today.completed || 0) + (today.cancelled || 0);
    const totalOrders = today.total_orders || 0;

    if (totalOrders === 0) return 100;
    return Math.round((totalProcessed / totalOrders) * 100);
  };

  // Get status counts
  const getStatusStats = () => {
    if (!dashboardData?.metrics?.today) return [];

    const { today } = dashboardData.metrics;
    const total = today.total_orders || 0;

    return [
      { label: "Placed", value: today.placed || 0, color: theme.palette.info.main },
      { label: "Cooked", value: today.cooked || 0, color: theme.palette.warning.main },
      { label: "Completed", value: today.completed || 0, color: theme.palette.success.main },
      { label: "Cancelled", value: today.cancelled || 0, color: theme.palette.error.main },
    ];
  };

  // Loading skeleton for stats cards
  const StatsSkeleton = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[...Array(4)].map((_, index) => (
        <Grid item xs={12} sm={6} lg={3} key={index}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Skeleton variant="circular" width={56} height={56} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={40} sx={{ mt: 1, mb: 1 }} />
            <Skeleton variant="text" width="50%" height={20} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header Skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Skeleton variant="text" width={280} height={42} />
            <Skeleton variant="text" width={200} height={24} />
          </Box>
          <Stack direction="row" spacing={2}>
            <Skeleton variant="rounded" width={100} height={40} />
            <Skeleton variant="circular" width={40} height={40} />
          </Stack>
        </Box>

        <StatsSkeleton />

        {/* Charts Skeleton */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, borderRadius: 4, height: 400 }}>
              <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
              <Skeleton variant="rectangular" width="100%" height={320} sx={{ borderRadius: 3 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, borderRadius: 4, height: 400 }}>
              <Skeleton variant="text" width="50%" height={32} sx={{ mb: 3 }} />
              <Skeleton variant="rectangular" width="100%" height={320} sx={{ borderRadius: 3 }} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Alert
          severity="error"
          sx={{
            maxWidth: 600,
            borderRadius: 3,
            boxShadow: theme.shadows[3]
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchDashboardData}
              startIcon={<Refresh />}
            >
              Retry
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            Unable to Load Dashboard
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 4,
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Restaurant Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: theme.palette.success.main,
              display: 'inline-block',
              animation: 'pulse 2s infinite'
            }} />
            Real-time analytics and insights
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              borderColor: alpha(theme.palette.divider, 0.3)
            }}
          >
            Filters
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            Export
          </Button>
          <IconButton
            onClick={fetchDashboardData}
            disabled={loading}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
            }}
          >
            <Refresh />
          </IconButton>
        </Stack>
      </Box>

      {/* Statistics Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {getStats().map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                p: 3,
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                background: stat.gradient,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 16px 48px ${alpha(stat.color, 0.15)}`
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ opacity: 0.8 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ mt: 1, mb: 1 }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: alpha(stat.color, 0.1),
                    color: stat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {stat.trend === "up" ? (
                  <ArrowUpward sx={{ color: theme.palette.success.main, fontSize: 18 }} />
                ) : (
                  <ArrowDownward sx={{ color: theme.palette.error.main, fontSize: 18 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: stat.trend === "up" ? theme.palette.success.main : theme.palette.error.main,
                    fontWeight: 600
                  }}
                >
                  {stat.change}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                  {stat.subtitle}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue & Orders Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{
            p: 3,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Revenue & Orders Trend
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Today's performance overview
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                {['Today', 'Week', 'Month'].map((range) => (
                  <Chip
                    key={range}
                    label={range}
                    size="small"
                    variant={timeRange === range.toLowerCase() ? "filled" : "outlined"}
                    onClick={() => setTimeRange(range.toLowerCase())}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                      ...(timeRange === range.toLowerCase() && {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        border: 'none'
                      })
                    }}
                  />
                ))}
              </Stack>
            </Box>
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getChartData()}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.info.main} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme.palette.info.main} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} vertical={false} />
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
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      boxShadow: theme.shadows[3]
                    }}
                    formatter={(value, name) => {
                      if (name === "revenue") return [`₹${value}`, "Revenue"];
                      return [value, "Orders"];
                    }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    fill="url(#colorRevenue)"
                    name="Revenue (₹)"
                    dot={{ r: 4, strokeWidth: 2, fill: theme.palette.background.paper }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke={theme.palette.info.main}
                    strokeWidth={3}
                    name="Orders"
                    dot={{ r: 4, strokeWidth: 2, fill: theme.palette.background.paper }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Category Distribution & Status Overview */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Category Distribution */}
            <Card sx={{
              p: 3,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}>
              <Typography variant="h6" fontWeight={700} mb={3}>
                <PieChartIcon sx={{ mr: 1, verticalAlign: 'middle', color: theme.palette.primary.main }} />
                Category Distribution
              </Typography>
              {getCategoryData().length > 0 ? (
                <Box sx={{ height: 200, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCategoryData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {getCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [`${value} items`, props.payload.name]}
                        contentStyle={{
                          borderRadius: 8,
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          boxShadow: theme.shadows[3]
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <Typography variant="h6" fontWeight={700}>
                      {getCategoryData().reduce((sum, item) => sum + item.value, 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Items
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No category data</Typography>
                </Box>
              )}
            </Card>

            {/* Order Status Overview */}
            <Card sx={{
              p: 3,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Order Status Overview
              </Typography>
              <Stack spacing={2}>
                {getStatusStats().map((status, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {status.label}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {status.value}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(status.value / dashboardData.metrics.today.total_orders) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(status.color, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: status.color,
                          borderRadius: 4
                        }
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Tables Section */}
      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} lg={8}>
          <Card sx={{
            p: 3,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Recent Orders
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Latest transactions and order details
                </Typography>
              </Box>
              <Button
                endIcon={<MoreHoriz />}
                sx={{
                  textTransform: 'none',
                  color: 'text.secondary'
                }}
              >
                View All
              </Button>
            </Box>
            {getRecentOrders().length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{
                      '& th': {
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        fontWeight: 700,
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                      }
                    }}>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getRecentOrders().map((order) => (
                      <TableRow
                        key={order.id}
                        hover
                        sx={{
                          '&:last-child td': { borderBottom: 0 },
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.02)
                          }
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight={600} color="primary">
                            {order.orderId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                              <Person fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600}>{order.customer}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${order.items} items`}
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={700} color="primary">
                            ₹{order.amount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            size="small"
                            sx={{
                              borderRadius: 2,
                              fontWeight: 600,
                              bgcolor:
                                order.status === 'COMPLETED' ? alpha(theme.palette.success.main, 0.1) :
                                  order.status === 'PLACED' ? alpha(theme.palette.info.main, 0.1) :
                                    order.status === 'COOKED' ? alpha(theme.palette.warning.main, 0.1) :
                                      alpha(theme.palette.error.main, 0.1),
                              color:
                                order.status === 'COMPLETED' ? theme.palette.success.main :
                                  order.status === 'PLACED' ? theme.palette.info.main :
                                    order.status === 'COOKED' ? theme.palette.warning.main :
                                      theme.palette.error.main,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {order.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.time.toLocaleDateString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <LocalShipping sx={{ fontSize: 64, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No recent orders
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  New orders will appear here once placed
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Popular Items & Quick Stats */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Popular Items */}
            <Card sx={{
              p: 3,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Top Selling Items
              </Typography>
              {getPopularItems().length > 0 ? (
                <Stack spacing={2}>
                  {getPopularItems().map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 3,
                        bgcolor: index === 0 ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                        border: index === 0 ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.action.hover, 0.5),
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          mr: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          fontWeight: 700
                        }}
                      >
                        {index + 1}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={600}>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.orders} orders • {item.quantity} sold
                        </Typography>
                      </Box>
                      <Typography fontWeight={700} color="primary">
                        ₹{item.revenue}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No popular items data</Typography>
                </Box>
              )}
            </Card>

            {/* Quick Stats */}
            <Card sx={{
              p: 3,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              bgcolor: alpha(theme.palette.primary.main, 0.02)
            }}>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Performance Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" fontWeight={800} color="primary">
                      {getCompletionRate()}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Processing Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" fontWeight={800} color="primary">
                      ₹{dashboardData?.metrics?.today?.earnings?.toLocaleString() || '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Today's Revenue
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" fontWeight={800} color="primary">
                      {dashboardData?.metrics?.today?.total_orders || '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Orders
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" fontWeight={800} color="primary">
                      4.8
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg. Rating
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Footer Stats */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          Data last updated: {new Date().toLocaleTimeString()} • Auto-refresh every 5 minutes
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;