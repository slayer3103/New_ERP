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
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AppLayout from '../layouts/AppLayout';
import ReportPageHeader from '../components/common/ReportPageHeader';
import AnalyticsStatCard from '../components/common/AnalyticsStatCard';
import ChartCard from '../components/common/ChartCard';
import ReportSearchBar from '../components/common/ReportSearchBar';
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

const PaymentReceipts = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/analytics/payments/receipts`);
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch payment receipts data');
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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filteredPayments = data?.payments?.filter(p =>
    p.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getModeColor = (mode) => {
    switch (mode) {
      case 'Cash': return 'success';
      case 'Online': return 'info';
      case 'Cheque': return 'warning';
      default: return 'default';
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'Cash': return '💵';
      case 'Online': return '💳';
      case 'Cheque': return '📄';
      default: return '💰';
    }
  };

  let pieData = [];
  let customerData = [];
  if (data && data.summary) {
    pieData = [
      { name: 'Cash', value: parseFloat(data.summary.cash_amount || 0) },
      { name: 'Online', value: parseFloat(data.summary.online_amount || 0) },
      { name: 'Cheque', value: parseFloat(data.summary.cheque_amount || 0) },
    ].filter(item => item.value > 0);
  }

  if (data && data.payments) {
    const custMap = {};
    data.payments.forEach(p => {
      const cust = p.customer_name || 'Unknown';
      if (!custMap[cust]) {
        custMap[cust] = { name: cust, amount: 0 };
      }
      custMap[cust].amount += parseFloat(p.amount || 0);
    });
    customerData = Object.values(custMap).sort((a, b) => b.amount - a.amount).slice(0, 10);
  }

  return (
    <AppLayout title="Payment Receipts">
      <ReportPageHeader
        title="💳 Payment Receipts"
        subtitle="Complete log of all payment receipts with mode-wise breakdown"
        gradientStart={tokens.chartGreen}
        gradientEnd="#059669"
        icon={PaymentsIcon}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={60} sx={{ color: tokens.chartGreen }} /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
      ) : data ? (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 3 }}>
            <AnalyticsStatCard title="Total Collected" value={formatCurrency(data.summary.total_collected)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: tokens.chartGreen }} />} color={tokens.chartGreen} subtitle={`${data.summary.total_receipts} receipts`} />
            <AnalyticsStatCard title="Cash Payments" value={formatCurrency(data.summary.cash_amount)} icon={<AccountBalanceWalletIcon sx={{ fontSize: 28, color: tokens.chartBlue }} />} color={tokens.chartBlue} subtitle={`${data.summary.cash_payments} payments`} />
            <AnalyticsStatCard title="Online Payments" value={formatCurrency(data.summary.online_amount)} icon={<CreditCardIcon sx={{ fontSize: 28, color: tokens.chartViolet }} />} color={tokens.chartViolet} subtitle={`${data.summary.online_payments} payments`} />
            <AnalyticsStatCard title="Cheque Payments" value={formatCurrency(data.summary.cheque_amount)} icon={<PaymentsIcon sx={{ fontSize: 28, color: tokens.chartAmber }} />} color={tokens.chartAmber} subtitle={`${data.summary.cheque_payments} payments`} />
          </Box>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={5}>
              <ChartCard title="Payment Modes" subtitle="Distribution by payment method" height={380} isEmpty={pieData.length === 0} emptyText="No payment data">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={5} dataKey="value" nameKey="name">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
            <Grid item xs={12} md={7}>
              <ChartCard title="Top 10 Customers by Payments" subtitle="Highest paying customers" height={380}>
                <ResponsiveContainer>
                  <BarChart data={customerData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={tokens.chartGrid} />
                    <XAxis type="number" tickFormatter={(val) => `₹${val/1000}k`} tick={{ fontSize: 11, fill: tokens.chartAxisText }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: tokens.chartAxisText }} />
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="amount" name="Paid Amount" fill={tokens.chartGreen} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>

          <Box sx={{ mb: 3 }}>
            <ReportSearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer or invoice number..."
            />
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: `1px solid ${tokens.tableBorder}`, overflowX: 'auto' }}>
            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="h6" fontWeight="bold" color={tokens.textPrimary}>Payment Receipt Details</Typography>
            </Box>
            <Divider />
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Mode</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Invoice Total</TableCell>
                  <TableCell align="right">Remaining</TableCell>
                  <TableCell align="center">Invoice Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.map((payment, idx) => (
                  <TableRow key={idx} sx={{ '&:hover': { bgcolor: tokens.tableRowHover }, transition: 'background 0.2s' }}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell><Typography fontWeight="medium">{payment.invoice_number}</Typography></TableCell>
                    <TableCell>{payment.customer_name}</TableCell>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${getModeIcon(payment.payment_mode)} ${payment.payment_mode}`}
                        size="small"
                        color={getModeColor(payment.payment_mode)}
                        variant="outlined"
                        sx={{ borderRadius: '8px' }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: tokens.chartGreen }}>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell align="right">{formatCurrency(payment.invoice_total)}</TableCell>
                    <TableCell align="right" sx={{ color: payment.remaining_balance > 0 ? tokens.chartAmber : tokens.chartGreen }}>
                      {formatCurrency(payment.remaining_balance)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={payment.invoice_status}
                        size="small"
                        color={payment.invoice_status === 'Paid' ? 'success' : payment.invoice_status === 'Partial' ? 'warning' : 'default'}
                        variant="outlined"
                        sx={{ borderRadius: '8px' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPayments.length === 0 && (
                  <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: tokens.textSecondary }}>No payment receipts found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : null}
    </AppLayout>
  );
};

export default PaymentReceipts;
