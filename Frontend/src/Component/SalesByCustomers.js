import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  InputBase,
  IconButton,
  Avatar,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  LinearProgress,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import StarIcon from '@mui/icons-material/Star';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';
import axios from 'axios';
import BASE_URL from '../config/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts';

const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#6366f1', '#f97316', '#06b6d4'];

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', minWidth: 200 }}>
        <Typography variant="subtitle2" fontWeight="bold" color="#1e293b" mb={1}>{label}</Typography>
        {payload.map((entry, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entry.color }} />
            <Typography variant="caption" color="text.secondary">{entry.name}:</Typography>
            <Typography variant="caption" fontWeight="bold">
              {entry.name === 'Invoices' ? entry.value : formatCurrency(entry.value)}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

const SalesByCustomers = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chartView, setChartView] = useState('bar');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/analytics/sales/by-customers`);
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch sales by customer data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return `₹${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0)}`;
  };

  const filteredCustomers = data?.customers?.filter(c =>
    c.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const top10 = data?.customers?.slice(0, 10) || [];
  const maxRevenue = Math.max(...(data?.customers?.map(c => parseFloat(c.total_revenue) || 0) || [1]));

  const barChartData = top10.map(c => ({
    name: c.customer_name?.length > 12 ? c.customer_name.slice(0, 12) + '…' : c.customer_name,
    Revenue: parseFloat(c.total_revenue) || 0,
    Paid: parseFloat(c.paid_amount) || 0,
    Outstanding: parseFloat(c.outstanding_amount) || 0,
    Invoices: parseInt(c.total_invoices) || 0,
  }));

  const pieChartData = top10.map(c => ({
    name: c.customer_name?.length > 16 ? c.customer_name.slice(0, 16) + '…' : c.customer_name,
    value: parseFloat(c.total_revenue) || 0,
  }));

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
          <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" fontWeight="bold" color={color} sx={{ mb: 0.5 }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary" fontWeight="medium">{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{subtitle}</Typography>}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <Box sx={{ backgroundColor: '#fff', p: 2, px: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#3b82f615', display: 'flex' }}>
              <PeopleIcon sx={{ color: '#3b82f6' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#1e293b" lineHeight={1.2}>Sales By Customers</Typography>
              <Typography variant="caption" color="text.secondary">Customer revenue analytics & insights</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9', px: 2, py: 0.5, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <SearchIcon fontSize="small" sx={{ mr: 1, color: '#64748b' }} />
              <InputBase placeholder="Search analytics..." sx={{ fontSize: '14px' }} />
            </Box>
            <IconButton sx={{ color: '#64748b' }}><NotificationsNoneIcon /></IconButton>
            <UserMenu />
            <Avatar src="/avatar.png" sx={{ width: 32, height: 32 }} />
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, flexGrow: 1 }}>

          {/* Hero Banner */}
          <Paper elevation={0} sx={{
            p: 4, borderRadius: '20px', mb: 3,
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white', position: 'relative', overflow: 'hidden'
          }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h5" fontWeight="bold" mb={0.5}>👥 Customer Sales Analytics</Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Analyze revenue contribution, payment status, and outstanding amounts from every customer.
              </Typography>
            </Box>
            <Box sx={{ position: 'absolute', right: -30, top: -30, opacity: 0.08 }}>
              <PeopleIcon sx={{ fontSize: 180 }} />
            </Box>
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
              <CircularProgress size={60} sx={{ color: '#3b82f6' }} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
          ) : data ? (
            <>
              {/* KPI Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2.5, mb: 3 }}>
                <StatCard title="Total Customers" value={data.summary.total_customers} icon={<PeopleIcon sx={{ fontSize: 26, color: '#3b82f6' }} />} color="#3b82f6" subtitle="Unique customers" />
                <StatCard title="Total Revenue" value={formatCurrency(data.summary.total_revenue)} icon={<AttachMoneyIcon sx={{ fontSize: 26, color: '#10b981' }} />} color="#10b981" subtitle="All invoices" />
                <StatCard title="Total Invoices" value={data.summary.total_invoices} icon={<ReceiptIcon sx={{ fontSize: 26, color: '#8b5cf6' }} />} color="#8b5cf6" subtitle="Invoices generated" />
                <StatCard title="Outstanding" value={formatCurrency(data.summary.total_outstanding)} icon={<PendingActionsIcon sx={{ fontSize: 26, color: '#f59e0b' }} />} color="#f59e0b" subtitle="Pending payments" />
              </Box>

              {/* Charts Section */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Main Chart */}
                <Grid item xs={12} lg={8}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" color="#1e293b">Top 10 Customers — Revenue Breakdown</Typography>
                        <Typography variant="caption" color="text.secondary">Revenue, paid amount, and outstanding per customer</Typography>
                      </Box>
                      <ToggleButtonGroup size="small" value={chartView} exclusive onChange={(e, v) => v && setChartView(v)} sx={{ '& .MuiToggleButton-root': { borderRadius: '8px', border: '1px solid #e2e8f0', px: 1.5 } }}>
                        <ToggleButton value="bar"><BarChartIcon fontSize="small" /></ToggleButton>
                        <ToggleButton value="pie"><PieChartIcon fontSize="small" /></ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                    <Box sx={{ height: 320, width: '100%' }}>
                      <ResponsiveContainer>
                        {chartView === 'bar' ? (
                          <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-35} textAnchor="end" interval={0} />
                            <YAxis tickFormatter={(val) => `₹${val / 1000}k`} tick={{ fontSize: 11, fill: '#64748b' }} />
                            <RechartsTooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                            <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13 }} />
                            <Bar dataKey="Paid" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} stackId="a" />
                            <Bar dataKey="Outstanding" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={36} stackId="a" />
                          </BarChart>
                        ) : (
                          <PieChart>
                            <Pie data={pieChartData} cx="50%" cy="50%" outerRadius={110} innerRadius={55} paddingAngle={3} dataKey="value">
                              {pieChartData.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(val) => formatCurrency(val)} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                          </PieChart>
                        )}
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>

                {/* Top Customers Leaderboard */}
                <Grid item xs={12} lg={4}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                      <StarIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                      <Typography variant="subtitle1" fontWeight="bold" color="#1e293b">Top Customer Revenues</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {(data?.customers || []).slice(0, 6).map((c, i) => {
                        const pct = maxRevenue > 0 ? (parseFloat(c.total_revenue) / maxRevenue) * 100 : 0;
                        return (
                          <Box key={i}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 26, height: 26, fontSize: 11, bgcolor: `${PIE_COLORS[i % PIE_COLORS.length]}20`, color: PIE_COLORS[i % PIE_COLORS.length] }}>
                                  {c.customer_name?.charAt(0) || '?'}
                                </Avatar>
                                <Typography variant="body2" fontWeight="medium" color="#1e293b" noWrap sx={{ maxWidth: 110 }}>
                                  {c.customer_name}
                                </Typography>
                              </Box>
                              <Typography variant="caption" fontWeight="bold" color="#3b82f6">
                                {formatCurrency(c.total_revenue)}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{
                                height: 5, borderRadius: 3,
                                bgcolor: '#f1f5f9',
                                '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: PIE_COLORS[i % PIE_COLORS.length] },
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    {/* Payment health summary */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                      <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#10b98115', textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" display="block">Collected</Typography>
                        <Typography variant="body2" fontWeight="bold" color="#10b981" sx={{ mt: 0.3 }}>
                          {data.summary.total_customers > 0
                            ? `${Math.round(((data.summary.total_revenue - data.summary.total_outstanding) / data.summary.total_revenue) * 100)}%`
                            : '0%'}
                        </Typography>
                      </Box>
                      <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#f59e0b15', textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" display="block">Pending</Typography>
                        <Typography variant="body2" fontWeight="bold" color="#f59e0b" sx={{ mt: 0.3 }}>
                          {data.summary.total_revenue > 0
                            ? `${Math.round((data.summary.total_outstanding / data.summary.total_revenue) * 100)}%`
                            : '0%'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Table Section */}
              <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TableChartIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight="bold" color="#1e293b">Customer Details</Typography>
                    <Chip label={`${filteredCustomers.length} customers`} size="small" sx={{ bgcolor: '#3b82f615', color: '#3b82f6', fontWeight: 'bold' }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f8fafc', px: 2, py: 0.75, borderRadius: '10px', border: '1px solid #e2e8f0', minWidth: 240 }}>
                    <SearchIcon fontSize="small" sx={{ mr: 1, color: '#94a3b8' }} />
                    <InputBase
                      placeholder="Search customers..."
                      fullWidth
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{ fontSize: '13px' }}
                    />
                  </Box>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: '#334155', py: 1.5 }}>Customer</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Invoices</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Total Revenue</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Paid</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Outstanding</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Avg Invoice</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', color: '#334155' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#334155', minWidth: 140 }}>Payment Health</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCustomers.map((customer, index) => {
                        const paid = parseFloat(customer.paid_amount) || 0;
                        const total = parseFloat(customer.total_revenue) || 1;
                        const paidPct = Math.round((paid / total) * 100);
                        return (
                          <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f8fafc' }, transition: 'background 0.2s', '&:last-child td': { border: 0 } }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ bgcolor: `${PIE_COLORS[index % PIE_COLORS.length]}20`, color: PIE_COLORS[index % PIE_COLORS.length], width: 36, height: 36, fontSize: 14, fontWeight: 'bold' }}>
                                  {customer.customer_name?.charAt(0) || '?'}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="medium" color="#1e293b">{customer.customer_name}</Typography>
                                  {index < 3 && (
                                    <Chip label={index === 0 ? '🥇 Top' : index === 1 ? '🥈 2nd' : '🥉 3rd'} size="small" sx={{ height: 16, fontSize: '10px', mt: 0.2 }} />
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Chip label={customer.total_invoices} size="small" variant="outlined" sx={{ borderRadius: '6px', fontSize: '12px' }} />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold" color="#059669">{formatCurrency(customer.total_revenue)}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="#10b981" fontWeight="medium">{formatCurrency(customer.paid_amount)}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color={parseFloat(customer.outstanding_amount) > 0 ? '#f59e0b' : '#10b981'} fontWeight="medium">
                                {formatCurrency(customer.outstanding_amount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="#475569">{formatCurrency(customer.avg_invoice_value)}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={customer.pending_invoices > 0 ? `${customer.pending_invoices} Pending` : '✓ All Paid'}
                                color={customer.pending_invoices > 0 ? 'warning' : 'success'}
                                size="small"
                                variant="outlined"
                                sx={{ borderRadius: '8px', fontWeight: 'medium', fontSize: '11px' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={paidPct}
                                  sx={{
                                    flexGrow: 1, height: 6, borderRadius: 3,
                                    bgcolor: '#fef3c7',
                                    '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: paidPct === 100 ? '#10b981' : '#3b82f6' },
                                  }}
                                />
                                <Typography variant="caption" fontWeight="bold" color={paidPct === 100 ? '#10b981' : '#3b82f6'} sx={{ minWidth: 34, textAlign: 'right' }}>
                                  {paidPct}%
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {filteredCustomers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                              <PeopleIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
                              <Typography color="text.secondary">No customer data found</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default SalesByCustomers;
