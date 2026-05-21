import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  InputBase,
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
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import StarIcon from '@mui/icons-material/Star';
import AppLayout from '../layouts/AppLayout';
import ReportPageHeader from '../components/common/ReportPageHeader';
import AnalyticsStatCard from '../components/common/AnalyticsStatCard';
import ChartCard from '../components/common/ChartCard';
import axios from 'axios';
import BASE_URL from '../config/api';
import { tokens, CHART_PALETTE } from '../theme/paletteTokens';
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
} from 'recharts';

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', minWidth: 200 }}>
        <Typography variant="subtitle2" fontWeight="bold" color={tokens.textPrimary} mb={1}>{label}</Typography>
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

  return (
    <AppLayout title="Sales By Customers">
      {/* Hero Banner */}
      <ReportPageHeader
        title="👥 Customer Sales Analytics"
        subtitle="Analyze revenue contribution, payment status, and outstanding amounts from every customer."
        gradientStart={tokens.chartBlue}
        gradientEnd="#1D4ED8"
        icon={PeopleIcon}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
          <CircularProgress size={60} sx={{ color: tokens.chartBlue }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
      ) : data ? (
        <>
          {/* KPI Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 2.5 }, mb: 3 }}>
            <AnalyticsStatCard title="Total Customers" value={data.summary.total_customers} icon={<PeopleIcon sx={{ fontSize: 26, color: tokens.chartBlue }} />} color={tokens.chartBlue} subtitle="Unique customers" />
            <AnalyticsStatCard title="Total Revenue" value={formatCurrency(data.summary.total_revenue)} icon={<AttachMoneyIcon sx={{ fontSize: 26, color: tokens.chartGreen }} />} color={tokens.chartGreen} subtitle="All invoices" />
            <AnalyticsStatCard title="Total Invoices" value={data.summary.total_invoices} icon={<ReceiptIcon sx={{ fontSize: 26, color: tokens.chartViolet }} />} color={tokens.chartViolet} subtitle="Invoices generated" />
            <AnalyticsStatCard title="Outstanding" value={formatCurrency(data.summary.total_outstanding)} icon={<PendingActionsIcon sx={{ fontSize: 26, color: tokens.chartAmber }} />} color={tokens.chartAmber} subtitle="Pending payments" />
          </Box>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Main Chart */}
            <Grid item xs={12} lg={8}>
              <ChartCard
                title="Top 10 Customers — Revenue Breakdown"
                subtitle="Revenue, paid amount, and outstanding per customer"
                height={400}
                actions={
                  <ToggleButtonGroup size="small" value={chartView} exclusive onChange={(e, v) => v && setChartView(v)} sx={{ '& .MuiToggleButton-root': { borderRadius: '8px', border: `1px solid ${tokens.tableBorder}`, px: 1.5 } }}>
                    <ToggleButton value="bar"><BarChartIcon fontSize="small" /></ToggleButton>
                    <ToggleButton value="pie"><PieChartIcon fontSize="small" /></ToggleButton>
                  </ToggleButtonGroup>
                }
              >
                <ResponsiveContainer>
                  {chartView === 'bar' ? (
                    <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 10, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.chartGrid} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: tokens.chartAxisText }} angle={-35} textAnchor="end" interval={0} />
                      <YAxis tickFormatter={(val) => `₹${val / 1000}k`} tick={{ fontSize: 11, fill: tokens.chartAxisText }} width={65} />
                      <RechartsTooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                      <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13 }} />
                      <Bar dataKey="Paid" fill={tokens.chartGreen} radius={[4, 4, 0, 0]} maxBarSize={36} stackId="a" />
                      <Bar dataKey="Outstanding" fill={tokens.chartAmber} radius={[4, 4, 0, 0]} maxBarSize={36} stackId="a" />
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie data={pieChartData} cx="50%" cy="50%" outerRadius={110} innerRadius={55} paddingAngle={3} dataKey="value">
                        {pieChartData.map((_, i) => (
                          <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val) => formatCurrency(val)} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </ChartCard>
            </Grid>

            {/* Top Customers Leaderboard */}
            <Grid item xs={12} lg={4}>
              <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '16px', border: `1px solid ${tokens.tableBorder}`, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <StarIcon sx={{ color: tokens.chartAmber, fontSize: 20 }} />
                  <Typography variant="subtitle1" fontWeight="bold" color={tokens.textPrimary}>Top Customer Revenues</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {(data?.customers || []).slice(0, 6).map((c, i) => {
                    const pct = maxRevenue > 0 ? (parseFloat(c.total_revenue) / maxRevenue) * 100 : 0;
                    return (
                      <Box key={i}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                            <Avatar sx={{ width: 26, height: 26, fontSize: 11, bgcolor: `${CHART_PALETTE[i % CHART_PALETTE.length]}20`, color: CHART_PALETTE[i % CHART_PALETTE.length] }}>
                              {c.customer_name?.charAt(0) || '?'}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium" color={tokens.textPrimary} noWrap sx={{ maxWidth: { xs: 100, lg: 110 } }}>
                              {c.customer_name}
                            </Typography>
                          </Box>
                          <Typography variant="caption" fontWeight="bold" color={tokens.chartBlue} sx={{ flexShrink: 0 }}>
                            {formatCurrency(c.total_revenue)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 6, borderRadius: 3,
                            bgcolor: tokens.surfaceHover,
                            '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: CHART_PALETTE[i % CHART_PALETTE.length] },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
                <Divider sx={{ my: 2 }} />
                {/* Payment health summary */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: `${tokens.chartGreen}10`, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" display="block">Collected</Typography>
                    <Typography variant="body2" fontWeight="bold" color={tokens.chartGreen} sx={{ mt: 0.3 }}>
                      {data.summary.total_customers > 0
                        ? `${Math.round(((data.summary.total_revenue - data.summary.total_outstanding) / data.summary.total_revenue) * 100)}%`
                        : '0%'}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: `${tokens.chartAmber}10`, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" display="block">Pending</Typography>
                    <Typography variant="body2" fontWeight="bold" color={tokens.chartAmber} sx={{ mt: 0.3 }}>
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
          <Paper elevation={0} sx={{ borderRadius: '16px', border: `1px solid ${tokens.tableBorder}`, overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 }, borderBottom: `1px solid ${tokens.surfaceHover}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TableChartIcon sx={{ color: tokens.chartBlue, fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight="bold" color={tokens.textPrimary}>Customer Details</Typography>
                <Chip label={`${filteredCustomers.length} customers`} size="small" sx={{ bgcolor: `${tokens.chartBlue}12`, color: tokens.chartBlue, fontWeight: 'bold' }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: tokens.surfaceSubtle, px: 2, py: 0.75, borderRadius: '10px', border: `1px solid ${tokens.tableBorder}`, width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 240 } }}>
                <SearchIcon fontSize="small" sx={{ mr: 1, color: tokens.textSecondary }} />
                <InputBase
                  placeholder="Search customers..."
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ fontSize: '13px' }}
                />
              </Box>
            </Box>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Invoices</TableCell>
                    <TableCell align="right">Total Revenue</TableCell>
                    <TableCell align="right">Paid</TableCell>
                    <TableCell align="right">Outstanding</TableCell>
                    <TableCell align="right">Avg Invoice</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell sx={{ minWidth: 140 }}>Payment Health</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.map((customer, index) => {
                    const paid = parseFloat(customer.paid_amount) || 0;
                    const total = parseFloat(customer.total_revenue) || 1;
                    const paidPct = Math.round((paid / total) * 100);
                    return (
                      <TableRow key={index} sx={{ '&:hover': { bgcolor: tokens.tableRowHover }, transition: 'background 0.2s', '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: `${CHART_PALETTE[index % CHART_PALETTE.length]}20`, color: CHART_PALETTE[index % CHART_PALETTE.length], width: 36, height: 36, fontSize: 14, fontWeight: 'bold' }}>
                              {customer.customer_name?.charAt(0) || '?'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium" color={tokens.textPrimary}>{customer.customer_name}</Typography>
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
                          <Typography variant="body2" color={tokens.chartGreen} fontWeight="medium">{formatCurrency(customer.paid_amount)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color={parseFloat(customer.outstanding_amount) > 0 ? tokens.chartAmber : tokens.chartGreen} fontWeight="medium">
                            {formatCurrency(customer.outstanding_amount)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color={tokens.textSecondary}>{formatCurrency(customer.avg_invoice_value)}</Typography>
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
                                flexGrow: 1, height: 8, borderRadius: 4,
                                bgcolor: `${tokens.chartAmber}15`,
                                '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: paidPct === 100 ? tokens.chartGreen : tokens.chartBlue },
                              }}
                            />
                            <Typography variant="caption" fontWeight="bold" color={paidPct === 100 ? tokens.chartGreen : tokens.chartBlue} sx={{ minWidth: 34, textAlign: 'right' }}>
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
                          <PeopleIcon sx={{ fontSize: 40, color: tokens.textSecondary, opacity: 0.4 }} />
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
    </AppLayout>
  );
};

export default SalesByCustomers;
