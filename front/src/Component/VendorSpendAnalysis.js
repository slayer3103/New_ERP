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
  LinearProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BusinessIcon from '@mui/icons-material/Business';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';
import axios from 'axios';
import BASE_URL from '../config/api';

const VendorSpendAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/analytics/purchase/vendor-spend`);
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch vendor spend data');
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

  const filteredVendors = data?.vendors?.filter(v =>
    v.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const maxSpend = Math.max(...(data?.vendors?.map(v => parseFloat(v.total_spent) || 0) || [1]));

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
            <StorefrontIcon sx={{ color: '#7c3aed' }} />
            <Typography variant="h5" fontWeight="bold" color="#1e293b">Vendor Spend Analysis</Typography>
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
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', mb: 3, background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: 'white' }}>🏢 Vendor Spend Analysis</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Analyze procurement spending across vendors</Typography>
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={60} sx={{ color: '#7c3aed' }} /></Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
          ) : data ? (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 3, mb: 3 }}>
                <StatCard title="Total Vendors" value={data.summary.total_vendors} icon={<BusinessIcon sx={{ fontSize: 28, color: '#7c3aed' }} />} color="#7c3aed" subtitle="Active vendors" />
                <StatCard title="Total Spent" value={formatCurrency(data.summary.total_procurement_spend)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: '#dc2626' }} />} color="#dc2626" subtitle="Total procurement" />
                <StatCard title="Total Orders" value={data.summary.total_orders} icon={<ShoppingCartIcon sx={{ fontSize: 28, color: '#3b82f6' }} />} color="#3b82f6" subtitle="Purchase orders" />
                <StatCard title="Avg Order Value" value={formatCurrency(data.summary.avg_order_value)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: '#10b981' }} />} color="#10b981" subtitle="Per order" />
              </Box>

              <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', mb: 3, border: '1px solid #e2e8f0' }}>
                <InputBase
                  placeholder="Search vendors..."
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ bgcolor: '#f8f8f8', borderRadius: '10px', px: 2, py: 1, border: '1px solid #e0e0e0' }}
                />
              </Paper>

              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="#1e293b">Vendor Spend Breakdown</Typography>
                </Box>
                <Divider />
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Vendor</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Orders</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Items</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Total Spent</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Avg Order</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Tax Paid</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>First / Last Order</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155', minWidth: 140 }}>Spend Share</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredVendors.map((vendor, idx) => {
                      const spendPercent = maxSpend > 0 ? (parseFloat(vendor.total_spent) / maxSpend) * 100 : 0;
                      return (
                        <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#f1f5f9' }, transition: 'background 0.2s' }}>
                          <TableCell>
                            <Chip label={idx + 1} size="small" sx={{ bgcolor: idx < 3 ? '#7c3aed' : '#e2e8f0', color: idx < 3 ? '#fff' : '#334155', fontWeight: 'bold', borderRadius: '8px' }} />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ bgcolor: '#7c3aed', width: 36, height: 36, fontSize: 14 }}>
                                {vendor.vendor_name?.charAt(0) || '?'}
                              </Avatar>
                              <Typography fontWeight="medium">{vendor.vendor_name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">{vendor.total_orders}</TableCell>
                          <TableCell align="right">{new Intl.NumberFormat('en-IN').format(vendor.total_items_ordered || 0)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: '#059669' }}>{formatCurrency(vendor.total_spent)}</TableCell>
                          <TableCell align="right">{formatCurrency(vendor.avg_order_value)}</TableCell>
                          <TableCell align="right" sx={{ color: '#8b5cf6' }}>{formatCurrency(vendor.tax_paid)}</TableCell>
                          <TableCell>
                            <Typography variant="caption" display="block" color="text.secondary">{formatDate(vendor.first_order_date)}</Typography>
                            <Typography variant="caption" display="block" color="text.primary">{formatDate(vendor.last_order_date)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={spendPercent}
                                sx={{
                                  flexGrow: 1, height: 8, borderRadius: 4,
                                  bgcolor: '#e2e8f0',
                                  '& .MuiLinearProgress-bar': { borderRadius: 4, background: 'linear-gradient(90deg, #7c3aed, #4f46e5)' },
                                }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 35 }}>
                                {spendPercent.toFixed(0)}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredVendors.length === 0 && (
                      <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: '#94a3b8' }}>No vendor data found</TableCell></TableRow>
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

export default VendorSpendAnalysis;
