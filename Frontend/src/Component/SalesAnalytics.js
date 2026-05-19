import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Button, Card, CardContent,
  InputBase, IconButton, Avatar, Chip, CircularProgress, Alert,
  Divider, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, LinearProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';
import axios from 'axios';
import BASE_URL from '../config/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const STATUS_COLORS = { Paid: '#10b981', Draft: '#94a3b8', Partial: '#f59e0b' };

const SalesAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [detailedData, setDetailedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const periods = [
    { value: 'monthly', label: 'Monthly', icon: '📅' },
    { value: 'quarterly', label: 'Quarterly', icon: '📊' },
    { value: 'six_months', label: '6 Months', icon: '📈' },
    { value: 'yearly', label: 'Yearly', icon: '🗓️' },
  ];

  const fetchAnalytics = async (period) => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, detailRes] = await Promise.all([
        axios.get(`${BASE_URL}/invoice/analytics/sales?period=${period}`),
        axios.get(`${BASE_URL}/analytics/sales/detailed?period=${period}`),
      ]);
      setAnalyticsData(summaryRes.data[0] || null);
      setDetailedData(detailRes.data || null);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(selectedPeriod); }, [selectedPeriod]);

  const formatCurrency = (amount) => {
    return `₹${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0)}`;
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <Paper sx={{ p: 1.5, borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <Typography variant="caption" fontWeight="bold">{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="caption" display="block" sx={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' && p.value > 100 ? formatCurrency(p.value) : p.value}
          </Typography>
        ))}
      </Paper>
    );
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}20`,
      transition: 'all 0.3s ease',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 25px ${color}25` },
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</Box>
        </Box>
        <Typography variant="h4" fontWeight="bold" color={color} sx={{ mb: 1 }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary" fontWeight="medium">{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{subtitle}</Typography>}
      </CardContent>
    </Card>
  );

  const collectionRate = analyticsData?.total_invoices > 0 ? Math.round((analyticsData.completed_invoices / analyticsData.total_invoices) * 100) : 0;
  const revenueRate = analyticsData?.total_amount > 0 ? Math.round((analyticsData.completed_amount / analyticsData.total_amount) * 100) : 0;

  const pieData = detailedData?.statusDistribution?.map(s => ({
    name: s.status, value: parseFloat(s.amount) || 0, count: s.count,
  })) || [];

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ backgroundColor: '#fff', p: 2, px: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarTodayIcon sx={{ color: '#3b82f6' }} />
            <Typography variant="h5" fontWeight="bold" color="#1e293b">Sales Analytics</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9', px: 2, py: 0.5, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <SearchIcon fontSize="small" sx={{ mr: 1, color: '#64748b' }} />
              <InputBase placeholder="Search analytics..." sx={{ fontSize: '14px' }} />
            </Box>
            <IconButton sx={{ color: '#64748b' }}><NotificationsNoneIcon /></IconButton>
            <UserMenu />
            <Avatar src="/avatar.png" sx={{ width: 32, height: 32 }} />
            <Typography fontSize={14} color="#64748b">Admin</Typography>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, flexGrow: 1 }}>
          {/* Period Filter */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: 'white' }}>📊 Sales Performance Dashboard</Typography>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>Analyze your sales data across different time periods</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {periods.map((p) => (
                <Button key={p.value} variant={selectedPeriod === p.value ? 'contained' : 'outlined'}
                  onClick={() => setSelectedPeriod(p.value)}
                  sx={{
                    borderRadius: '12px', px: 3, py: 1, textTransform: 'none', fontWeight: 'bold',
                    backgroundColor: selectedPeriod === p.value ? 'rgba(255,255,255,0.2)' : 'transparent',
                    borderColor: 'rgba(255,255,255,0.3)', color: 'white',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.5)' },
                  }}
                  startIcon={<span style={{ fontSize: '16px' }}>{p.icon}</span>}
                >{p.label}</Button>
              ))}
            </Box>
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={60} sx={{ color: '#3b82f6' }} /></Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: '12px', mb: 3 }}>{error}</Alert>
          ) : analyticsData ? (
            <>
              {/* Period Info */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', mb: 3, border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="#1e293b">📈 {analyticsData.period_label} Overview</Typography>
                  <Chip label={analyticsData.period_name} color="primary" variant="outlined" sx={{ borderRadius: '8px' }} />
                </Box>
              </Paper>

              {/* Stat Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard title="Total Invoices" value={analyticsData.total_invoices} icon={<ReceiptIcon sx={{ fontSize: 28, color: '#3b82f6' }} />} color="#3b82f6" subtitle="All invoices created" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard title="Completed" value={analyticsData.completed_invoices} icon={<CheckCircleIcon sx={{ fontSize: 28, color: '#10b981' }} />} color="#10b981" subtitle="Paid invoices" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard title="Pending" value={analyticsData.pending_invoices} icon={<PendingActionsIcon sx={{ fontSize: 28, color: '#f59e0b' }} />} color="#f59e0b" subtitle="Awaiting payment" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard title="Avg Invoice" value={formatCurrency(analyticsData.average_invoice_amount)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: '#8b5cf6' }} />} color="#8b5cf6" subtitle="Per invoice" />
                </Grid>
              </Grid>

              {/* Revenue Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <StatCard title="Total Revenue" value={formatCurrency(analyticsData.total_amount)} icon={<AttachMoneyIcon sx={{ fontSize: 32, color: '#059669' }} />} color="#059669" subtitle="Total invoice amount" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <StatCard title="Collected" value={formatCurrency(analyticsData.completed_amount)} icon={<CheckCircleIcon sx={{ fontSize: 32, color: '#10b981' }} />} color="#10b981" subtitle="From paid invoices" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <StatCard title="Pending" value={formatCurrency(analyticsData.pending_amount)} icon={<PendingActionsIcon sx={{ fontSize: 32, color: '#f59e0b' }} />} color="#f59e0b" subtitle="From pending invoices" />
                </Grid>
              </Grid>

              {/* Charts Row */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Revenue Trend Chart */}
                <Grid item xs={12} md={8}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                    <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 2 }}>📈 Revenue Trend</Typography>
                    {detailedData?.dailyTrends?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={detailedData.dailyTrends}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="day_label" tick={{ fontSize: 11, fill: '#64748b' }} />
                          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="revenue" stroke="#667eea" fill="url(#colorRevenue)" strokeWidth={2.5} name="Revenue" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280, color: '#94a3b8' }}>
                        <Typography>No trend data available for this period</Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Status Pie Chart */}
                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                    <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 2 }}>🎯 Status Distribution</Typography>
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                            {pieData.map((entry, i) => (
                              <Cell key={i} fill={STATUS_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => formatCurrency(v)} />
                          <Legend formatter={(v) => <span style={{ fontSize: 12, color: '#334155' }}>{v}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280, color: '#94a3b8' }}>
                        <Typography>No data</Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {/* Monthly Breakdown Bar Chart (for multi-month periods) */}
              {detailedData?.trends?.length > 1 && (
                <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', mb: 3, border: '1px solid #e2e8f0' }}>
                  <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 2 }}>📊 Monthly Breakdown</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={detailedData.trends} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="short_label" tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              )}

              {/* Insights + Top Customers + Top Products */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Key Insights */}
                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>💡 Key Insights</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>Collection Rate</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LinearProgress variant="determinate" value={collectionRate} sx={{ flexGrow: 1, height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: '#fff' } }} />
                        <Typography variant="body2" fontWeight="bold">{collectionRate}%</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>Revenue Realization</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LinearProgress variant="determinate" value={revenueRate} sx={{ flexGrow: 1, height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: '#10b981' } }} />
                        <Typography variant="body2" fontWeight="bold">{revenueRate}%</Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Pending Rate: {analyticsData.total_invoices > 0 ? Math.round((analyticsData.pending_invoices / analyticsData.total_invoices) * 100) : 0}%</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Outstanding: {formatCurrency(analyticsData.pending_amount)}</Typography>
                  </Paper>
                </Grid>

                {/* Top Customers */}
                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PeopleIcon sx={{ color: '#3b82f6' }} />
                      <Typography variant="h6" fontWeight="bold" color="#1e293b">Top Customers</Typography>
                    </Box>
                    {detailedData?.topCustomers?.length > 0 ? detailedData.topCustomers.map((c, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, p: 1.5, borderRadius: '10px', bgcolor: '#f8fafc', '&:hover': { bgcolor: '#f1f5f9' }, transition: 'all 0.2s' }}>
                        <Avatar sx={{ bgcolor: COLORS[i], width: 32, height: 32, fontSize: 13 }}>{c.customer_name?.charAt(0)}</Avatar>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight="medium" noWrap>{c.customer_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{c.invoice_count} invoices</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold" color="#059669">{formatCurrency(c.total_revenue)}</Typography>
                      </Box>
                    )) : <Typography variant="body2" color="text.secondary">No customer data</Typography>}
                  </Paper>
                </Grid>

                {/* Top Products */}
                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <InventoryIcon sx={{ color: '#8b5cf6' }} />
                      <Typography variant="h6" fontWeight="bold" color="#1e293b">Top Products</Typography>
                    </Box>
                    {detailedData?.topProducts?.length > 0 ? detailedData.topProducts.map((p, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, p: 1.5, borderRadius: '10px', bgcolor: '#f8fafc', '&:hover': { bgcolor: '#f1f5f9' }, transition: 'all 0.2s' }}>
                        <Chip label={i + 1} size="small" sx={{ bgcolor: i < 3 ? '#8b5cf6' : '#e2e8f0', color: i < 3 ? '#fff' : '#334155', fontWeight: 'bold', borderRadius: '8px', minWidth: 28 }} />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight="medium" noWrap>{p.product_name || 'N/A'}</Typography>
                          <Typography variant="caption" color="text.secondary">{p.qty_sold} units</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold" color="#8b5cf6">{formatCurrency(p.revenue)}</Typography>
                      </Box>
                    )) : <Typography variant="body2" color="text.secondary">No product data</Typography>}
                  </Paper>
                </Grid>
              </Grid>

              {/* Recent Invoices Table */}
              {detailedData?.recentInvoices?.length > 0 && (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight="bold" color="#1e293b">🧾 Recent Invoices</Typography>
                  </Box>
                  <Divider />
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Invoice #</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Customer</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Date</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Amount</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', color: '#334155' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detailedData.recentInvoices.map((inv, i) => (
                        <TableRow key={i} sx={{ '&:hover': { bgcolor: '#f1f5f9' }, transition: 'background 0.2s' }}>
                          <TableCell><Typography fontWeight="medium">{inv.invoice_number}</Typography></TableCell>
                          <TableCell>{inv.customer_name}</TableCell>
                          <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: '#059669' }}>{formatCurrency(inv.grand_total)}</TableCell>
                          <TableCell align="center">
                            <Chip label={inv.status} size="small" sx={{ borderRadius: '8px', bgcolor: STATUS_COLORS[inv.status] || '#94a3b8', color: '#fff', fontWeight: 'bold' }} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          ) : (
            <Paper elevation={0} sx={{ p: 6, borderRadius: '16px', textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>📊 No Data Available</Typography>
              <Typography variant="body2" color="text.secondary">No sales data found for the selected period.</Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SalesAnalytics;
