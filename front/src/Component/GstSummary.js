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
  Grid,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';
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

const COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#3b82f6'];

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
  if (data && data.summary) {
    pieData = [
      { name: 'CGST', value: parseFloat(data.summary.total_cgst || 0) },
      { name: 'SGST', value: parseFloat(data.summary.total_sgst || 0) },
      { name: 'IGST', value: parseFloat(data.summary.total_igst || 0) },
    ].filter(item => item.value > 0);
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ backgroundColor: '#fff', p: 2, px: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AccountBalanceIcon sx={{ color: '#059669' }} />
            <Typography variant="h5" fontWeight="bold" color="#1e293b">GST Summary</Typography>
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
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', mb: 3, background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: 'white' }}>🧾 GST Summary Report</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Monthly breakdown of CGST, SGST, and IGST collected</Typography>
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={60} sx={{ color: '#059669' }} /></Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
          ) : data ? (
            <>
              {/* Summary Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 3 }}>
                <StatCard title="Total Taxable" value={formatCurrency(data.summary.total_taxable)} icon={<ReceiptIcon sx={{ fontSize: 28, color: '#3b82f6' }} />} color="#3b82f6" subtitle="Before GST" />
                <StatCard title="CGST Collected" value={formatCurrency(data.summary.total_cgst)} icon={<AccountBalanceIcon sx={{ fontSize: 28, color: '#10b981' }} />} color="#10b981" subtitle="Central GST" />
                <StatCard title="SGST Collected" value={formatCurrency(data.summary.total_sgst)} icon={<AccountBalanceIcon sx={{ fontSize: 28, color: '#8b5cf6' }} />} color="#8b5cf6" subtitle="State GST" />
                <StatCard title="IGST Collected" value={formatCurrency(data.summary.total_igst)} icon={<AccountBalanceIcon sx={{ fontSize: 28, color: '#f59e0b' }} />} color="#f59e0b" subtitle="Integrated GST" />
              </Box>

              {/* Total GST highlight and Chart */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 2 }}>
                      GST Composition
                    </Typography>
                    <Box sx={{ height: 250, width: '100%' }}>
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
                <Grid item xs={12} md={8}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                    <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 2 }}>
                      Monthly GST Breakdown
                    </Typography>
                    <Box sx={{ height: 250, width: '100%' }}>
                      <ResponsiveContainer>
                        <BarChart data={data.monthly} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month_label" />
                          <YAxis tickFormatter={(val) => `₹${val/1000}k`} />
                          <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                          <Legend />
                          <Bar dataKey="total_cgst" name="CGST" stackId="a" fill="#10b981" />
                          <Bar dataKey="total_sgst" name="SGST" stackId="a" fill="#8b5cf6" />
                          <Bar dataKey="total_igst" name="IGST" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Monthly Breakdown Table */}
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="#1e293b">Monthly GST Breakdown</Typography>
                </Box>
                <Divider />
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Month</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Invoices</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Taxable Amount</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>CGST</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>SGST</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>IGST</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Total GST</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Grand Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.monthly.map((row, index) => (
                      <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f1f5f9' }, transition: 'background 0.2s' }}>
                        <TableCell>
                          <Typography fontWeight="medium">{row.month_label}</Typography>
                        </TableCell>
                        <TableCell align="right">{row.invoice_count}</TableCell>
                        <TableCell align="right">{formatCurrency(row.taxable_amount)}</TableCell>
                        <TableCell align="right" sx={{ color: '#10b981' }}>{formatCurrency(row.total_cgst)}</TableCell>
                        <TableCell align="right" sx={{ color: '#8b5cf6' }}>{formatCurrency(row.total_sgst)}</TableCell>
                        <TableCell align="right" sx={{ color: '#f59e0b' }}>{formatCurrency(row.total_igst)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#059669' }}>{formatCurrency(row.total_gst)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(row.total_with_gst)}</TableCell>
                      </TableRow>
                    ))}
                    {data.monthly.length === 0 && (
                      <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: '#94a3b8' }}>No GST data found</TableCell></TableRow>
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

export default GstSummary;
