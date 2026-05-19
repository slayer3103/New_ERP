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
import PaymentsIcon from '@mui/icons-material/Payments';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
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
  Cell
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];

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
    <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ backgroundColor: '#fff', p: 2, px: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PaymentsIcon sx={{ color: '#10b981' }} />
            <Typography variant="h5" fontWeight="bold" color="#1e293b">Payment Receipts</Typography>
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
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', mb: 3, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: 'white' }}>💳 Payment Receipts</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Complete log of all payment receipts with mode-wise breakdown</Typography>
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={60} sx={{ color: '#10b981' }} /></Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
          ) : data ? (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 3, mb: 3 }}>
                <StatCard title="Total Collected" value={formatCurrency(data.summary.total_collected)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: '#10b981' }} />} color="#10b981" subtitle={`${data.summary.total_receipts} receipts`} />
                <StatCard title="Cash Payments" value={formatCurrency(data.summary.cash_amount)} icon={<AccountBalanceWalletIcon sx={{ fontSize: 28, color: '#3b82f6' }} />} color="#3b82f6" subtitle={`${data.summary.cash_payments} payments`} />
                <StatCard title="Online Payments" value={formatCurrency(data.summary.online_amount)} icon={<CreditCardIcon sx={{ fontSize: 28, color: '#8b5cf6' }} />} color="#8b5cf6" subtitle={`${data.summary.online_payments} payments`} />
                <StatCard title="Cheque Payments" value={formatCurrency(data.summary.cheque_amount)} icon={<PaymentsIcon sx={{ fontSize: 28, color: '#f59e0b' }} />} color="#f59e0b" subtitle={`${data.summary.cheque_payments} payments`} />
              </Box>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={5}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 2 }}>
                      Payment Modes
                    </Typography>
                    <Box sx={{ height: 300, width: '100%' }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={7}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                    <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 2 }}>
                      Top 10 Customers by Payments
                    </Typography>
                    <Box sx={{ height: 300, width: '100%' }}>
                      <ResponsiveContainer>
                        <BarChart data={customerData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tickFormatter={(val) => `₹${val/1000}k`} />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                          <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                          <Legend />
                          <Bar dataKey="amount" name="Paid Amount" fill="#10b981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

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
                  <Typography variant="h6" fontWeight="bold" color="#1e293b">Payment Receipt Details</Typography>
                </Box>
                <Divider />
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Invoice #</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Date</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#334155' }}>Mode</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Amount</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Invoice Total</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Remaining</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#334155' }}>Invoice Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPayments.map((payment, idx) => (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#f1f5f9' }, transition: 'background 0.2s' }}>
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
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell align="right">{formatCurrency(payment.invoice_total)}</TableCell>
                        <TableCell align="right" sx={{ color: payment.remaining_balance > 0 ? '#f59e0b' : '#10b981' }}>
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
                      <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: '#94a3b8' }}>No payment receipts found</TableCell></TableRow>
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

export default PaymentReceipts;
