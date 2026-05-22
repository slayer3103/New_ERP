import React, { useState, useEffect, useCallback } from 'react';
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
import PeriodFilter from '../components/common/PeriodFilter';
import GlassTooltip from '../components/common/GlassTooltip';
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
  Label,
} from 'recharts';

/* ─── Donut Center Label ─── */
const PieCenterLabel = ({ viewBox, value }) => {
  const { cx, cy } = viewBox;
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} y={cy - 8} fontSize="11" fill={tokens.textSecondary} fontWeight="500">
        Customers
      </tspan>
      <tspan x={cx} y={cy + 12} fontSize="15" fill={tokens.textPrimary} fontWeight="700">
        {value}
      </tspan>
    </text>
  );
};

const SalesByCustomers = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chartView, setChartView] = useState('bar');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [periodOffset, setPeriodOffset] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${BASE_URL}/analytics/sales/by-customers?period=${selectedPeriod}&offset=${periodOffset}`
      );
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch sales by customer data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, periodOffset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
    setPeriodOffset(0);
  };

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

      {/* ─── Period Filter ─── */}
      <PeriodFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
        periodOffset={periodOffset}
        onOffsetChange={setPeriodOffset}
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
                      <defs>
                        <linearGradient id="gradCustPaid" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={tokens.chartGreen} stopOpacity={1} />
                          <stop offset="100%" stopColor={tokens.chartGreen} stopOpacity={0.6} />
                        </linearGradient>
                        <linearGradient id="gradCustOutstanding" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={tokens.chartAmber} stopOpacity={1} />
                          <stop offset="100%" stopColor={tokens.chartAmber} stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={tokens.chartGrid} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: tokens.chartAxisText }} angle={-35} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(val) => `₹${val / 1000}k`} tick={{ fontSize: 11, fill: tokens.chartAxisText }} width={65} axisLine={false} tickLine={false} />
                      <RechartsTooltip content={<GlassTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13 }} iconType="circle" iconSize={10} />
                      <Bar dataKey="Paid" fill="url(#gradCustPaid)" radius={[5, 5, 0, 0]} maxBarSize={36} stackId="a" animationDuration={1000} />
                      <Bar dataKey="Outstanding" fill="url(#gradCustOutstanding)" radius={[5, 5, 0, 0]} maxBarSize={36} stackId="a" animationDuration={1000} animationDelay={200} />
                    </BarChart>
                  ) : (
                    <PieChart>
                      <defs>
                        {CHART_PALETTE.map((color, i) => (
                          <linearGradient key={i} id={`gradCustPie${i}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={1} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        innerRadius={55}
                        paddingAngle={4}
                        dataKey="value"
                        cornerRadius={5}
                        animationDuration={1000}
                        animationEasing="ease-out"
                      >
                        {pieChartData.map((_, i) => (
                          <Cell key={i} fill={`url(#gradCustPie${i % CHART_PALETTE.length})`} stroke={CHART_PALETTE[i % CHART_PALETTE.length]} strokeWidth={1} />
                        ))}
                        <Label content={<PieCenterLabel value={pieChartData.length} />} position="center" />
                      </Pie>
                      <RechartsTooltip formatter={(val) => formatCurrency(val)} />
                      <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
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
                            '& .MuiLinearProgress-bar': { borderRadius: 3, background: `linear-gradient(90deg, ${CHART_PALETTE[i % CHART_PALETTE.length]}, ${CHART_PALETTE[(i + 1) % CHART_PALETTE.length]})` },
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
