import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
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
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BusinessIcon from '@mui/icons-material/Business';
import AppLayout from '../layouts/AppLayout';
import ReportPageHeader from '../components/common/ReportPageHeader';
import AnalyticsStatCard from '../components/common/AnalyticsStatCard';
import ReportSearchBar from '../components/common/ReportSearchBar';
import axios from 'axios';
import BASE_URL from '../config/api';
import { tokens } from '../theme/paletteTokens';

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

  return (
    <AppLayout title="Vendor Spend Analysis">
      <ReportPageHeader
        title="🏢 Vendor Spend Analysis"
        subtitle="Analyze procurement spending across vendors"
        gradientStart="#7C3AED"
        gradientEnd="#4F46E5"
        icon={BusinessIcon}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={60} sx={{ color: tokens.chartViolet }} /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
      ) : data ? (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 3 }}>
            <AnalyticsStatCard title="Total Vendors" value={data.summary.total_vendors} icon={<BusinessIcon sx={{ fontSize: 28, color: tokens.chartViolet }} />} color={tokens.chartViolet} subtitle="Active vendors" />
            <AnalyticsStatCard title="Total Spent" value={formatCurrency(data.summary.total_procurement_spend)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: tokens.chartRose }} />} color={tokens.chartRose} subtitle="Total procurement" />
            <AnalyticsStatCard title="Total Orders" value={data.summary.total_orders} icon={<ShoppingCartIcon sx={{ fontSize: 28, color: tokens.chartBlue }} />} color={tokens.chartBlue} subtitle="Purchase orders" />
            <AnalyticsStatCard title="Avg Order Value" value={formatCurrency(data.summary.avg_order_value)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: tokens.chartGreen }} />} color={tokens.chartGreen} subtitle="Per order" />
          </Box>

          <Box sx={{ mb: 3 }}>
            <ReportSearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vendors..."
            />
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: `1px solid ${tokens.tableBorder}`, overflowX: 'auto' }}>
            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="h6" fontWeight="bold" color={tokens.textPrimary}>Vendor Spend Breakdown</Typography>
            </Box>
            <Divider />
            <Table sx={{ minWidth: 950 }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell align="right">Orders</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell align="right">Total Spent</TableCell>
                  <TableCell align="right">Avg Order</TableCell>
                  <TableCell align="right">Tax Paid</TableCell>
                  <TableCell>First / Last Order</TableCell>
                  <TableCell sx={{ minWidth: 160 }}>Spend Share</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVendors.map((vendor, idx) => {
                  const spendPercent = maxSpend > 0 ? (parseFloat(vendor.total_spent) / maxSpend) * 100 : 0;
                  return (
                    <TableRow key={idx} sx={{ '&:hover': { bgcolor: tokens.tableRowHover }, transition: 'background 0.2s' }}>
                      <TableCell>
                        <Chip label={idx + 1} size="small" sx={{ bgcolor: idx < 3 ? tokens.chartViolet : tokens.surfaceHover, color: idx < 3 ? '#fff' : tokens.textPrimary, fontWeight: 'bold', borderRadius: '8px' }} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: tokens.chartViolet, width: 36, height: 36, fontSize: 14 }}>
                            {vendor.vendor_name?.charAt(0) || '?'}
                          </Avatar>
                          <Typography fontWeight="medium">{vendor.vendor_name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{vendor.total_orders}</TableCell>
                      <TableCell align="right">{new Intl.NumberFormat('en-IN').format(vendor.total_items_ordered || 0)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#059669' }}>{formatCurrency(vendor.total_spent)}</TableCell>
                      <TableCell align="right">{formatCurrency(vendor.avg_order_value)}</TableCell>
                      <TableCell align="right" sx={{ color: tokens.chartViolet }}>{formatCurrency(vendor.tax_paid)}</TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block" color="text.secondary">{formatDate(vendor.first_order_date)}</Typography>
                        <Typography variant="caption" display="block" color="text.primary" fontWeight="medium">{formatDate(vendor.last_order_date)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={spendPercent}
                            sx={{
                              flexGrow: 1, height: 8, borderRadius: 4,
                              bgcolor: tokens.surfaceHover,
                              '& .MuiLinearProgress-bar': { borderRadius: 4, background: `linear-gradient(90deg, ${tokens.chartViolet}, #4F46E5)` },
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
                  <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: tokens.textSecondary }}>No vendor data found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : null}
    </AppLayout>
  );
};

export default VendorSpendAnalysis;
