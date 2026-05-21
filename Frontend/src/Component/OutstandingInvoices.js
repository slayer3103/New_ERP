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
  Divider,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AppLayout from '../layouts/AppLayout';
import ReportPageHeader from '../components/common/ReportPageHeader';
import AnalyticsStatCard from '../components/common/AnalyticsStatCard';
import ReportSearchBar from '../components/common/ReportSearchBar';
import axios from 'axios';
import BASE_URL from '../config/api';
import { tokens } from '../theme/paletteTokens';

const OutstandingInvoices = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/analytics/payments/outstanding`);
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch outstanding invoices');
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

  const filteredInvoices = data?.invoices?.filter(i =>
    i.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getAgingColor = (category) => {
    switch (category) {
      case 'Overdue': return 'error';
      case '60+ Days': return 'error';
      case '30-60 Days': return 'warning';
      case '15-30 Days': return 'info';
      default: return 'success';
    }
  };

  return (
    <AppLayout title="Outstanding Invoices">
      <ReportPageHeader
        title="⚠️ Outstanding Invoices"
        subtitle="Track unpaid and partially paid invoices with aging analysis"
        gradientStart="#78350F"
        gradientEnd="#92400E"
        icon={WarningAmberIcon}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={60} sx={{ color: tokens.chartAmber }} /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
      ) : data ? (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 3 }}>
            <AnalyticsStatCard title="Outstanding Count" value={data.summary.total_outstanding} icon={<ReceiptIcon sx={{ fontSize: 28, color: tokens.chartAmber }} />} color={tokens.chartAmber} subtitle="Unpaid invoices" />
            <AnalyticsStatCard title="Balance Due" value={formatCurrency(data.summary.total_balance_due)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: tokens.chartRose }} />} color={tokens.chartRose} subtitle="Total pending" />
            <AnalyticsStatCard title="Invoice Value" value={formatCurrency(data.summary.total_invoice_value)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: tokens.chartBlue }} />} color={tokens.chartBlue} subtitle="Total value" />
            <AnalyticsStatCard title="Overdue" value={data.summary.overdue_count} icon={<AccessTimeIcon sx={{ fontSize: 28, color: tokens.chartViolet }} />} color={tokens.chartViolet} subtitle={`Avg ${Math.round(data.summary.avg_days_outstanding || 0)} days`} />
          </Box>

          <Box sx={{ mb: 3 }}>
            <ReportSearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer or invoice number..."
            />
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: `1px solid ${tokens.tableBorder}`, overflowX: 'auto' }}>
            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="h6" fontWeight="bold" color={tokens.textPrimary}>Outstanding Invoice Details</Typography>
            </Box>
            <Divider />
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Invoice Date</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Paid</TableCell>
                  <TableCell align="right">Balance Due</TableCell>
                  <TableCell align="center">Days</TableCell>
                  <TableCell align="center">Aging</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.map((inv, idx) => (
                  <TableRow key={idx} sx={{ '&:hover': { bgcolor: tokens.tableRowHover }, transition: 'background 0.2s' }}>
                    <TableCell><Typography fontWeight="medium">{inv.invoice_number}</Typography></TableCell>
                    <TableCell>{inv.customer_name}</TableCell>
                    <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                    <TableCell>{formatDate(inv.expiry_date)}</TableCell>
                    <TableCell align="right">{formatCurrency(inv.grand_total)}</TableCell>
                    <TableCell align="right" sx={{ color: tokens.chartGreen }}>{formatCurrency(inv.total_paid)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: tokens.chartRose }}>{formatCurrency(inv.balance_due)}</TableCell>
                    <TableCell align="center">{inv.days_since_invoice}</TableCell>
                    <TableCell align="center">
                      <Chip label={inv.aging_category} size="small" color={getAgingColor(inv.aging_category)} variant="outlined" sx={{ borderRadius: '8px' }} />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={inv.status}
                        size="small"
                        color={inv.status === 'Partial' ? 'warning' : 'default'}
                        variant="outlined"
                        sx={{ borderRadius: '8px' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {filteredInvoices.length === 0 && (
                  <TableRow><TableCell colSpan={10} align="center" sx={{ py: 4, color: tokens.textSecondary }}>No outstanding invoices found — great job!</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : null}
    </AppLayout>
  );
};

export default OutstandingInvoices;
