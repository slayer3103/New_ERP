import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Divider,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';
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
  Cell
} from 'recharts';

const COLORS = [tokens.chartGreen, tokens.chartViolet, tokens.chartAmber, tokens.chartBlue];

const GstSummary = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/analytics/tax/gst-summary`);
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch GST summary data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return `₹${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0)}`;
  };

  let pieData = [];
  if (data && data.summary) {
    pieData = [
      { name: 'CGST', value: parseFloat(data.summary.total_cgst || 0) },
      { name: 'SGST', value: parseFloat(data.summary.total_sgst || 0) },
      { name: 'IGST', value: parseFloat(data.summary.total_igst || 0) },
    ].filter(item => item.value > 0);
  }

  return (
    <AppLayout title="GST Summary">
      <ReportPageHeader
        title="🧾 GST Summary Report"
        subtitle="Monthly breakdown of CGST, SGST, and IGST collected"
        gradientStart="#0F766E"
        gradientEnd="#115E59"
        icon={AccountBalanceIcon}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={60} sx={{ color: '#059669' }} /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 3 }}>
            <AnalyticsStatCard title="Total Taxable" value={formatCurrency(data.summary.total_taxable)} icon={<ReceiptIcon sx={{ fontSize: 28, color: tokens.chartBlue }} />} color={tokens.chartBlue} subtitle="Before GST" />
            <AnalyticsStatCard title="CGST Collected" value={formatCurrency(data.summary.total_cgst)} icon={<AccountBalanceIcon sx={{ fontSize: 28, color: tokens.chartGreen }} />} color={tokens.chartGreen} subtitle="Central GST" />
            <AnalyticsStatCard title="SGST Collected" value={formatCurrency(data.summary.total_sgst)} icon={<AccountBalanceIcon sx={{ fontSize: 28, color: tokens.chartViolet }} />} color={tokens.chartViolet} subtitle="State GST" />
            <AnalyticsStatCard title="IGST Collected" value={formatCurrency(data.summary.total_igst)} icon={<AccountBalanceIcon sx={{ fontSize: 28, color: tokens.chartAmber }} />} color={tokens.chartAmber} subtitle="Integrated GST" />
          </Box>

          {/* Total GST highlight and Chart */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <ChartCard title="GST Composition" subtitle="Tax type distribution" height={340} isEmpty={pieData.length === 0} emptyText="No GST data">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
            <Grid item xs={12} md={8}>
              <ChartCard title="Monthly GST Breakdown" subtitle="Stacked CGST, SGST, IGST by month" height={340}>
                <ResponsiveContainer>
                  <BarChart data={data.monthly} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.chartGrid} />
                    <XAxis dataKey="month_label" tick={{ fontSize: 12, fill: tokens.chartAxisText }} />
                    <YAxis tickFormatter={(val) => `₹${val/1000}k`} tick={{ fontSize: 11, fill: tokens.chartAxisText }} width={65} />
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="total_cgst" name="CGST" stackId="a" fill={tokens.chartGreen} />
                    <Bar dataKey="total_sgst" name="SGST" stackId="a" fill={tokens.chartViolet} />
                    <Bar dataKey="total_igst" name="IGST" stackId="a" fill={tokens.chartAmber} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>

          {/* Monthly Breakdown Table */}
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: `1px solid ${tokens.tableBorder}`, overflowX: 'auto' }}>
            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="h6" fontWeight="bold" color={tokens.textPrimary}>Monthly GST Breakdown</Typography>
            </Box>
            <Divider />
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Invoices</TableCell>
                  <TableCell align="right">Taxable Amount</TableCell>
                  <TableCell align="right">CGST</TableCell>
                  <TableCell align="right">SGST</TableCell>
                  <TableCell align="right">IGST</TableCell>
                  <TableCell align="right">Total GST</TableCell>
                  <TableCell align="right">Grand Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.monthly.map((row, index) => (
                  <TableRow key={index} sx={{ '&:hover': { bgcolor: tokens.tableRowHover }, transition: 'background 0.2s' }}>
                    <TableCell>
                      <Typography fontWeight="medium">{row.month_label}</Typography>
                    </TableCell>
                    <TableCell align="right">{row.invoice_count}</TableCell>
                    <TableCell align="right">{formatCurrency(row.taxable_amount)}</TableCell>
                    <TableCell align="right" sx={{ color: tokens.chartGreen }}>{formatCurrency(row.total_cgst)}</TableCell>
                    <TableCell align="right" sx={{ color: tokens.chartViolet }}>{formatCurrency(row.total_sgst)}</TableCell>
                    <TableCell align="right" sx={{ color: tokens.chartAmber }}>{formatCurrency(row.total_igst)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#059669' }}>{formatCurrency(row.total_gst)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(row.total_with_gst)}</TableCell>
                  </TableRow>
                ))}
                {data.monthly.length === 0 && (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: tokens.textSecondary }}>No GST data found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : null}
    </AppLayout>
  );
};

export default GstSummary;
