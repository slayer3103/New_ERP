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
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import GavelIcon from '@mui/icons-material/Gavel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';
import axios from 'axios';
import BASE_URL from '../config/api';

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

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        transition: 'all 0.3s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 25px ${color}25` },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" fontWeight="bold" color={color} sx={{ mb: 1 }}>{value}</Typography>
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
            <GavelIcon sx={{ color: '#dc2626' }} />
            <Typography variant="h5" fontWeight="bold" color="#1e293b">Tax Liability Reports</Typography>
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
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', mb: 3, background: 'linear-gradient(135deg, #dc2626 0%, #f59e0b 100%)', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: 'white' }}>⚖️ Tax Liability Reports</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Track your GST tax liability — collected vs pending</Typography>
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={60} sx={{ color: '#dc2626' }} /></Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
          ) : data ? (
            <>
              {/* Summary Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
                <StatCard title="Total Tax Liability" value={formatCurrency(data.totals.total_tax_liability)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: '#dc2626' }} />} color="#dc2626" subtitle="All tax on invoices" />
                <StatCard title="Tax Collected" value={formatCurrency(data.totals.collected_tax)} icon={<CheckCircleIcon sx={{ fontSize: 28, color: '#10b981' }} />} color="#10b981" subtitle="From paid invoices" />
                <StatCard title="Tax Pending" value={formatCurrency(data.totals.pending_tax)} icon={<PendingActionsIcon sx={{ fontSize: 28, color: '#f59e0b' }} />} color="#f59e0b" subtitle="Uncollected tax" />
              </Box>

              {/* Tax Type Summary */}
              {data.taxSummary.length > 0 && (
                <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', mb: 3, border: '1px solid #e2e8f0' }}>
                  <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 2 }}>📊 Tax Category Breakdown</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={3}>
                    {data.taxSummary.map((cat, i) => (
                      <Grid item xs={12} md={6} key={i}>
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <Typography variant="subtitle1" fontWeight="bold" color="#1e293b" sx={{ mb: 1 }}>{cat.tax_category}</Typography>
                          <Typography variant="body2" color="text.secondary">Invoices: <strong>{cat.invoice_count}</strong></Typography>
                          <Typography variant="body2" color="text.secondary">Taxable Amount: <strong>{formatCurrency(cat.taxable_amount)}</strong></Typography>
                          {cat.cgst_total > 0 && <Typography variant="body2" color="#10b981">CGST: <strong>{formatCurrency(cat.cgst_total)}</strong></Typography>}
                          {cat.sgst_total > 0 && <Typography variant="body2" color="#8b5cf6">SGST: <strong>{formatCurrency(cat.sgst_total)}</strong></Typography>}
                          {cat.igst_total > 0 && <Typography variant="body2" color="#f59e0b">IGST: <strong>{formatCurrency(cat.igst_total)}</strong></Typography>}
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="subtitle2" fontWeight="bold" color="#dc2626">Total Tax: {formatCurrency(cat.total_tax)}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}

              {/* Invoice-level Tax Detail */}
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="#1e293b">Invoice-Level Tax Details</Typography>
                </Box>
                <Divider />
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Invoice #</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Date</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Taxable</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#334155' }}>Tax Type</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Tax Amount</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Grand Total</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#334155' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.invoices.slice(0, 50).map((inv, idx) => (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#f1f5f9' }, transition: 'background 0.2s' }}>
                        <TableCell><Typography fontWeight="medium">{inv.invoice_number}</Typography></TableCell>
                        <TableCell>{inv.customer_name}</TableCell>
                        <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                        <TableCell align="right">{formatCurrency(inv.taxable_amount)}</TableCell>
                        <TableCell align="center">
                          <Chip label={inv.tax_type} size="small" color={inv.tax_type === 'IGST' ? 'warning' : 'info'} variant="outlined" sx={{ borderRadius: '8px' }} />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#dc2626' }}>{formatCurrency(inv.total_tax)}</TableCell>
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
                      <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: '#94a3b8' }}>No tax liability data found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default TaxLiability;
