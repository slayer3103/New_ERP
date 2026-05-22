import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid,
  Avatar, Chip, CircularProgress, Alert,
  Divider, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, LinearProgress,
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShowChartIcon from '@mui/icons-material/ShowChart';
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
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend, Label,
} from 'recharts';

const STATUS_COLORS = {
  Paid: tokens.statusPaid,
  Draft: tokens.statusDraft,
  Partial: tokens.statusPartial,
};

/* ─── Custom Pie Center Label ─── */
const PieCenterLabel = ({ viewBox, value }) => {
  const { cx, cy } = viewBox;
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} y={cy - 8} fontSize="11" fill={tokens.textSecondary} fontWeight="500">
        Total
      </tspan>
      <tspan x={cx} y={cy + 12} fontSize="15" fill={tokens.textPrimary} fontWeight="700">
        {value}
      </tspan>
    </text>
  );
};

const SalesAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [periodOffset, setPeriodOffset] = useState(0);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [detailedData, setDetailedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (period, offset) => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, detailRes] = await Promise.all([
        axios.get(`${BASE_URL}/invoice/analytics/sales?period=${period}&offset=${offset}`),
        axios.get(`${BASE_URL}/analytics/sales/detailed?period=${period}&offset=${offset}`),
      ]);
      setAnalyticsData(summaryRes.data[0] || null);
      setDetailedData(detailRes.data || null);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalytics(selectedPeriod, periodOffset); }, [selectedPeriod, periodOffset, fetchAnalytics]);

  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
    setPeriodOffset(0);
  };

  const formatCurrency = (amount) => {
    return `₹${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0)}`;
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const collectionRate = analyticsData?.total_invoices > 0 ? Math.round((analyticsData.completed_invoices / analyticsData.total_invoices) * 100) : 0;
  const revenueRate = analyticsData?.total_amount > 0 ? Math.round((analyticsData.completed_amount / analyticsData.total_amount) * 100) : 0;

  const pieData = detailedData?.statusDistribution?.map(s => ({
    name: s.status, value: parseFloat(s.amount) || 0, count: s.count,
  })) || [];

  const pieTotal = pieData.reduce((sum, d) => sum + d.count, 0);

  return (
    <AppLayout title="Sales Analytics">
      {/* Hero Header */}
      <ReportPageHeader
        title="📊 Sales Performance Dashboard"
        subtitle="Analyze your sales data across different time periods"
        icon={ShowChartIcon}
      />

      {/* ─── Period Filter (Shared Component) ─── */}
      <PeriodFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
        periodOffset={periodOffset}
        onOffsetChange={setPeriodOffset}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} sx={{ color: tokens.primary }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: '12px', mb: 3 }}>{error}</Alert>
      ) : analyticsData ? (
        <>
          {/* Period Info */}
          <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px', mb: 3, border: `1px solid ${tokens.tableBorder}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6" fontWeight="bold" color={tokens.textPrimary}>
                📈 {analyticsData.period_label} Overview
              </Typography>
              <Chip label={analyticsData.period_name} color="primary" variant="outlined" sx={{ borderRadius: '8px' }} />
            </Box>
          </Paper>

          {/* Stat Cards Row 1 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 3 }}>
            <AnalyticsStatCard title="Total Invoices" value={analyticsData.total_invoices} icon={<ReceiptIcon sx={{ fontSize: 28, color: tokens.chartBlue }} />} color={tokens.chartBlue} subtitle="All invoices created" />
            <AnalyticsStatCard title="Completed" value={analyticsData.completed_invoices} icon={<CheckCircleIcon sx={{ fontSize: 28, color: tokens.chartGreen }} />} color={tokens.chartGreen} subtitle="Paid invoices" />
            <AnalyticsStatCard title="Pending" value={analyticsData.pending_invoices} icon={<PendingActionsIcon sx={{ fontSize: 28, color: tokens.chartAmber }} />} color={tokens.chartAmber} subtitle="Awaiting payment" />
            <AnalyticsStatCard title="Avg Invoice" value={formatCurrency(analyticsData.average_invoice_amount)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: tokens.chartViolet }} />} color={tokens.chartViolet} subtitle="Per invoice" />
          </Box>

          {/* Revenue Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 3 }}>
            <AnalyticsStatCard title="Total Revenue" value={formatCurrency(analyticsData.total_amount)} icon={<AttachMoneyIcon sx={{ fontSize: 32, color: '#059669' }} />} color="#059669" subtitle="Total invoice amount" />
            <AnalyticsStatCard title="Collected" value={formatCurrency(analyticsData.completed_amount)} icon={<CheckCircleIcon sx={{ fontSize: 32, color: tokens.chartGreen }} />} color={tokens.chartGreen} subtitle="From paid invoices" />
            <AnalyticsStatCard title="Pending" value={formatCurrency(analyticsData.pending_amount)} icon={<PendingActionsIcon sx={{ fontSize: 32, color: tokens.chartAmber }} />} color={tokens.chartAmber} subtitle="From pending invoices" />
          </Box>

          {/* Charts Row */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Revenue Trend Chart — Enhanced */}
            <Grid item xs={12} md={12}>
              <ChartCard
                title="📈 Revenue Trend"
                subtitle="Daily revenue over the selected period"
                height={400}
                isEmpty={!detailedData?.dailyTrends?.length}
                emptyText="No trend data available for this period"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={detailedData.dailyTrends}>
                    <defs>
                      <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#667eea" stopOpacity={0.35} />
                        <stop offset="50%" stopColor="#764ba2" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#667eea" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="strokeRevenue" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                      </linearGradient>
                      <filter id="glowRevenue" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke={tokens.chartGrid} vertical={false} />
                    <XAxis dataKey="day_label" tick={{ fontSize: 11, fill: tokens.chartAxisText }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: tokens.chartAxisText }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} width={65} axisLine={false} tickLine={false} />
                    <Tooltip content={<GlassTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="url(#strokeRevenue)"
                      fill="url(#gradRevenue)"
                      strokeWidth={3}
                      name="Revenue"
                      filter="url(#glowRevenue)"
                      dot={{ r: 4, fill: '#667eea', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: '#764ba2', stroke: '#fff', strokeWidth: 2.5, filter: 'url(#glowRevenue)' }}
                      animationDuration={1200}
                      animationEasing="ease-in-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>

            {/* Status Pie Chart — Enhanced Donut */}
            <Grid item xs={12} md={12}>
              <ChartCard
                title="🎯 Status Distribution"
                subtitle="Invoice amounts by status"
                height={400}
                isEmpty={pieData.length === 0}
                emptyText="No data"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {Object.entries(STATUS_COLORS).map(([key, color]) => (
                        <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={1} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      cornerRadius={6}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      {pieData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={`url(#grad-${entry.name})`}
                          stroke={STATUS_COLORS[entry.name] || CHART_PALETTE[i % CHART_PALETTE.length]}
                          strokeWidth={1}
                        />
                      ))}
                      <Label content={<PieCenterLabel value={pieTotal} />} position="center" />
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend
                      formatter={(v) => <span style={{ fontSize: 12, color: tokens.textPrimary, fontWeight: 500 }}>{v}</span>}
                      iconType="circle"
                      iconSize={10}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>

          {/* Monthly Breakdown Bar Chart (for multi-month periods) — Enhanced */}
          {detailedData?.trends?.length > 1 && (
            <Box sx={{ mb: 3 }}>
              <ChartCard title="📊 Monthly Breakdown" subtitle="Collected vs pending amounts per month" height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={detailedData.trends} barGap={6} barCategoryGap="20%">
                    <defs>
                      <linearGradient id="gradCollected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={tokens.chartGreen} stopOpacity={1} />
                        <stop offset="100%" stopColor={tokens.chartGreen} stopOpacity={0.65} />
                      </linearGradient>
                      <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={tokens.chartAmber} stopOpacity={1} />
                        <stop offset="100%" stopColor={tokens.chartAmber} stopOpacity={0.65} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke={tokens.chartGrid} vertical={false} />
                    <XAxis dataKey="short_label" tick={{ fontSize: 12, fill: tokens.chartAxisText }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: tokens.chartAxisText }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} width={65} axisLine={false} tickLine={false} />
                    <Tooltip content={<GlassTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 13 }}
                      iconType="circle"
                      iconSize={10}
                    />
                    <Bar
                      dataKey="collected"
                      name="Collected"
                      fill="url(#gradCollected)"
                      radius={[6, 6, 0, 0]}
                      animationDuration={1000}
                    />
                    <Bar
                      dataKey="pending"
                      name="Pending"
                      fill="url(#gradPending)"
                      radius={[6, 6, 0, 0]}
                      animationDuration={1000}
                      animationDelay={200}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Box>
          )}

          {/* Insights + Top Customers + Top Products */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Key Insights */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', height: '100%', border: 'none' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2.5, color: 'white' }}>💡 Key Insights</Typography>
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>Collection Rate</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LinearProgress variant="determinate" value={collectionRate} sx={{ flexGrow: 1, height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.15)', '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: '#fff' } }} />
                    <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 40 }}>{collectionRate}%</Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>Revenue Realization</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LinearProgress variant="determinate" value={revenueRate} sx={{ flexGrow: 1, height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.15)', '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: tokens.chartGreen } }} />
                    <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 40 }}>{revenueRate}%</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.15)' }} />
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Pending Rate: {analyticsData.total_invoices > 0 ? Math.round((analyticsData.pending_invoices / analyticsData.total_invoices) * 100) : 0}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Outstanding: {formatCurrency(analyticsData.pending_amount)}
                </Typography>
              </Paper>
            </Grid>

            {/* Top Customers */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: `1px solid ${tokens.tableBorder}`, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <PeopleIcon sx={{ color: tokens.chartBlue }} />
                  <Typography variant="h6" fontWeight="bold" color={tokens.textPrimary}>Top Customers</Typography>
                </Box>
                {detailedData?.topCustomers?.length > 0 ? detailedData.topCustomers.map((c, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, p: 1.5, borderRadius: '10px', bgcolor: tokens.surfaceSubtle, '&:hover': { bgcolor: tokens.surfaceHover }, transition: 'all 0.2s' }}>
                    <Avatar sx={{ bgcolor: CHART_PALETTE[i], width: 32, height: 32, fontSize: 13 }}>{c.customer_name?.charAt(0)}</Avatar>
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
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: `1px solid ${tokens.tableBorder}`, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <InventoryIcon sx={{ color: tokens.chartViolet }} />
                  <Typography variant="h6" fontWeight="bold" color={tokens.textPrimary}>Top Products</Typography>
                </Box>
                {detailedData?.topProducts?.length > 0 ? detailedData.topProducts.map((p, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, p: 1.5, borderRadius: '10px', bgcolor: tokens.surfaceSubtle, '&:hover': { bgcolor: tokens.surfaceHover }, transition: 'all 0.2s' }}>
                    <Chip label={i + 1} size="small" sx={{ bgcolor: i < 3 ? tokens.chartViolet : tokens.tableBorder, color: i < 3 ? '#fff' : tokens.textPrimary, fontWeight: 'bold', borderRadius: '8px', minWidth: 28 }} />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight="medium" noWrap>{p.product_name || 'N/A'}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.qty_sold} units</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold" color={tokens.chartViolet}>{formatCurrency(p.revenue)}</Typography>
                  </Box>
                )) : <Typography variant="body2" color="text.secondary">No product data</Typography>}
              </Paper>
            </Grid>
          </Grid>

          {/* Recent Invoices Table */}
          {detailedData?.recentInvoices?.length > 0 && (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: `1px solid ${tokens.tableBorder}`, overflowX: 'auto' }}>
              <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Typography variant="h6" fontWeight="bold" color={tokens.textPrimary}>🧾 Recent Invoices</Typography>
              </Box>
              <Divider />
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailedData.recentInvoices.map((inv, i) => (
                    <TableRow key={i} sx={{ '&:hover': { bgcolor: tokens.tableRowHover }, transition: 'background 0.2s' }}>
                      <TableCell><Typography fontWeight="medium">{inv.invoice_number}</Typography></TableCell>
                      <TableCell>{inv.customer_name}</TableCell>
                      <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#059669' }}>{formatCurrency(inv.grand_total)}</TableCell>
                      <TableCell align="center">
                        <Chip label={inv.status} size="small" sx={{ borderRadius: '8px', bgcolor: STATUS_COLORS[inv.status] || tokens.statusDraft, color: '#fff', fontWeight: 'bold' }} />
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
    </AppLayout>
  );
};

export default SalesAnalytics;
