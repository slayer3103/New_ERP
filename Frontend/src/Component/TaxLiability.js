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
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AppLayout from '../layouts/AppLayout';
import ReportPageHeader from '../components/common/ReportPageHeader';
import AnalyticsStatCard from '../components/common/AnalyticsStatCard';
import axios from 'axios';
import BASE_URL from '../config/api';
import { tokens } from '../theme/paletteTokens';

const TaxLiability = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/analytics/tax/liability`);
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch tax liability data');
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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <AppLayout title="Tax Liability">
      <ReportPageHeader
        title="⚖️ Tax Liability Reports"
        subtitle="Track your GST tax liability — collected vs pending"
        gradientStart="#1E293B"
        gradientEnd="#4338CA"
        icon={AssessmentIcon}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={60} sx={{ color: tokens.chartRose }} /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 3 }}>
            <AnalyticsStatCard title="Total Tax Liability" value={formatCurrency(data.totals.total_tax_liability)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: tokens.chartRose }} />} color={tokens.chartRose} subtitle="All tax on invoices" />
            <AnalyticsStatCard title="Tax Collected" value={formatCurrency(data.totals.collected_tax)} icon={<CheckCircleIcon sx={{ fontSize: 28, color: tokens.chartGreen }} />} color={tokens.chartGreen} subtitle="From paid invoices" />
            <AnalyticsStatCard title="Tax Pending" value={formatCurrency(data.totals.pending_tax)} icon={<PendingActionsIcon sx={{ fontSize: 28, color: tokens.chartAmber }} />} color={tokens.chartAmber} subtitle="Uncollected tax" />
          </Box>

          {/* Tax Type Summary */}
          {data.taxSummary.length > 0 && (
            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px', mb: 3, border: `1px solid ${tokens.tableBorder}` }}>
              <Typography variant="h6" fontWeight="bold" color={tokens.textPrimary} sx={{ mb: 2 }}>📊 Tax Category Breakdown</Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={3}>
                {data.taxSummary.map((cat, i) => (
                  <Grid item xs={12} md={6} key={i}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', bgcolor: tokens.surfaceSubtle, border: `1px solid ${tokens.tableBorder}`, transition: 'all 0.2s', '&:hover': { bgcolor: tokens.surfaceHover } }}>
                      <Typography variant="subtitle1" fontWeight="bold" color={tokens.textPrimary} sx={{ mb: 1 }}>{cat.tax_category}</Typography>
                      <Typography variant="body2" color="text.secondary">Invoices: <strong>{cat.invoice_count}</strong></Typography>
                      <Typography variant="body2" color="text.secondary">Taxable Amount: <strong>{formatCurrency(cat.taxable_amount)}</strong></Typography>
                      {cat.cgst_total > 0 && <Typography variant="body2" color={tokens.chartGreen}>CGST: <strong>{formatCurrency(cat.cgst_total)}</strong></Typography>}
                      {cat.sgst_total > 0 && <Typography variant="body2" color={tokens.chartViolet}>SGST: <strong>{formatCurrency(cat.sgst_total)}</strong></Typography>}
                      {cat.igst_total > 0 && <Typography variant="body2" color={tokens.chartAmber}>IGST: <strong>{formatCurrency(cat.igst_total)}</strong></Typography>}
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2" fontWeight="bold" color={tokens.chartRose}>Total Tax: {formatCurrency(cat.total_tax)}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* Invoice-level Tax Detail */}
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: `1px solid ${tokens.tableBorder}`, overflowX: 'auto' }}>
            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="h6" fontWeight="bold" color={tokens.textPrimary}>Invoice-Level Tax Details</Typography>
            </Box>
            <Divider />
            <Table sx={{ minWidth: 850 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Taxable</TableCell>
                  <TableCell align="center">Tax Type</TableCell>
                  <TableCell align="right">Tax Amount</TableCell>
                  <TableCell align="right">Grand Total</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.invoices.slice(0, 50).map((inv, idx) => (
                  <TableRow key={idx} sx={{ '&:hover': { bgcolor: tokens.tableRowHover }, transition: 'background 0.2s' }}>
                    <TableCell><Typography fontWeight="medium">{inv.invoice_number}</Typography></TableCell>
                    <TableCell>{inv.customer_name}</TableCell>
                    <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                    <TableCell align="right">{formatCurrency(inv.taxable_amount)}</TableCell>
                    <TableCell align="center">
                      <Chip label={inv.tax_type} size="small" color={inv.tax_type === 'IGST' ? 'warning' : 'info'} variant="outlined" sx={{ borderRadius: '8px' }} />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: tokens.chartRose }}>{formatCurrency(inv.total_tax)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(inv.grand_total)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={inv.status}
                        size="small"
                        color={inv.status === 'Paid' ? 'success' : inv.status === 'Partial' ? 'warning' : 'default'}
                        variant="outlined"
                        sx={{ borderRadius: '8px' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {data.invoices.length === 0 && (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: tokens.textSecondary }}>No tax liability data found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : null}
    </AppLayout>
  );
};

export default TaxLiability;
