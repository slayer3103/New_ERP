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
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';
import axios from 'axios';
import BASE_URL from '../config/api';

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
            <WarningAmberIcon sx={{ color: '#f59e0b' }} />
            <Typography variant="h5" fontWeight="bold" color="#1e293b">Outstanding Invoices</Typography>
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
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', mb: 3, background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: 'white' }}>⚠️ Outstanding Invoices</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Track unpaid and partially paid invoices with aging analysis</Typography>
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={60} sx={{ color: '#f59e0b' }} /></Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
          ) : data ? (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 3, mb: 3 }}>
                <StatCard title="Outstanding Count" value={data.summary.total_outstanding} icon={<ReceiptIcon sx={{ fontSize: 28, color: '#f59e0b' }} />} color="#f59e0b" subtitle="Unpaid invoices" />
                <StatCard title="Balance Due" value={formatCurrency(data.summary.total_balance_due)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: '#dc2626' }} />} color="#dc2626" subtitle="Total pending" />
                <StatCard title="Invoice Value" value={formatCurrency(data.summary.total_invoice_value)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: '#3b82f6' }} />} color="#3b82f6" subtitle="Total value" />
                <StatCard title="Overdue" value={data.summary.overdue_count} icon={<AccessTimeIcon sx={{ fontSize: 28, color: '#7c3aed' }} />} color="#7c3aed" subtitle={`Avg ${Math.round(data.summary.avg_days_outstanding || 0)} days`} />
              </Box>

              <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', mb: 3, border: '1px solid #e2e8f0' }}>
                <InputBase
                  placeholder="Search by customer or invoice number..."
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ bgcolor: '#f8f8f8', borderRadius: '10px', px: 2, py: 1, border: '1px solid #e0e0e0' }}
                />
              </Paper>

              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="#1e293b">Outstanding Invoice Details</Typography>
                </Box>
                <Divider />
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Invoice #</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Invoice Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Due Date</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Total</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Paid</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Balance Due</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#334155' }}>Days</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#334155' }}>Aging</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#334155' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInvoices.map((inv, idx) => (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#f1f5f9' }, transition: 'background 0.2s' }}>
                        <TableCell><Typography fontWeight="medium">{inv.invoice_number}</Typography></TableCell>
                        <TableCell>{inv.customer_name}</TableCell>
                        <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                        <TableCell>{formatDate(inv.expiry_date)}</TableCell>
                        <TableCell align="right">{formatCurrency(inv.grand_total)}</TableCell>
                        <TableCell align="right" sx={{ color: '#10b981' }}>{formatCurrency(inv.total_paid)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#dc2626' }}>{formatCurrency(inv.balance_due)}</TableCell>
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
                      <TableRow><TableCell colSpan={10} align="center" sx={{ py: 4, color: '#94a3b8' }}>No outstanding invoices found — great job!</TableCell></TableRow>
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

export default OutstandingInvoices;
