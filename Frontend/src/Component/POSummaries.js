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
  Grid,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BusinessIcon from '@mui/icons-material/Business';
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

const POSummaries = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/analytics/purchase/po-summary`);
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch PO summaries');
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

  const filteredOrders = data?.orders?.filter(o =>
    o.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.purchase_order_no?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  let vendorData = [];
  if (data && data.orders) {
    const vendorMap = {};
    data.orders.forEach(order => {
      const vendor = order.vendor_name || 'Unknown';
      if (!vendorMap[vendor]) {
        vendorMap[vendor] = { name: vendor, total_spent: 0, order_count: 0 };
      }
      vendorMap[vendor].total_spent += parseFloat(order.total || 0);
      vendorMap[vendor].order_count += 1;
    });
    vendorData = Object.values(vendorMap).sort((a, b) => b.total_spent - a.total_spent).slice(0, 10);
  }

  return (
    <AppLayout title="PO Summaries">
      <ReportPageHeader
        title="📋 Purchase Order Summaries"
        subtitle="Overview of all purchase orders with total spending and item details"
        gradientStart={tokens.chartBlue}
        gradientEnd="#1D4ED8"
        icon={ShoppingCartIcon}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={60} sx={{ color: tokens.chartBlue }} /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
      ) : data ? (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 3 }}>
            <AnalyticsStatCard title="Total Orders" value={data.summary.total_orders} icon={<ShoppingCartIcon sx={{ fontSize: 28, color: tokens.chartBlue }} />} color={tokens.chartBlue} subtitle="Purchase orders" />
            <AnalyticsStatCard title="Total Spent" value={formatCurrency(data.summary.total_spent)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: tokens.chartRose }} />} color={tokens.chartRose} subtitle="All POs" />
            <AnalyticsStatCard title="Unique Vendors" value={data.summary.unique_vendors} icon={<BusinessIcon sx={{ fontSize: 28, color: tokens.chartViolet }} />} color={tokens.chartViolet} subtitle="Vendor count" />
            <AnalyticsStatCard title="Avg Order Value" value={formatCurrency(data.summary.avg_order_value)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: tokens.chartGreen }} />} color={tokens.chartGreen} subtitle="Per order" />
          </Box>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <ChartCard title="Top 10 Vendors by Spending" subtitle="Horizontal bar chart of vendor spend" height={450}>
                <ResponsiveContainer>
                  <BarChart data={vendorData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={tokens.chartGrid} />
                    <XAxis type="number" tickFormatter={(val) => `₹${val/1000}k`} tick={{ fontSize: 11, fill: tokens.chartAxisText }} />
                    <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 12, fill: tokens.chartAxisText }} />
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="total_spent" name="Spending" fill={tokens.chartBlue} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <ChartCard title="Orders by Vendor" subtitle="Donut chart of order distribution" height={450} isEmpty={vendorData.length === 0} emptyText="No vendor data">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={vendorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="order_count"
                      nameKey="name"
                    >
                      {vendorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>

          <Box sx={{ mb: 3 }}>
            <ReportSearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by vendor or PO number..."
            />
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: `1px solid ${tokens.tableBorder}`, overflowX: 'auto' }}>
            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="h6" fontWeight="bold" color={tokens.textPrimary}>Purchase Order Details</Typography>
            </Box>
            <Divider />
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell>PO Number</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Delivery Date</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell align="right">Sub Total</TableCell>
                  <TableCell align="right">Tax</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order, idx) => (
                  <TableRow key={idx} sx={{ '&:hover': { bgcolor: tokens.tableRowHover }, transition: 'background 0.2s' }}>
                    <TableCell>
                      <Typography fontWeight="medium" color={tokens.chartBlue}>{order.purchase_order_no}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: tokens.chartBlue, width: 30, height: 30, fontSize: 12 }}>
                          {order.vendor_name?.charAt(0) || '?'}
                        </Avatar>
                        <Typography variant="body2">{order.vendor_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(order.purchase_order_date)}</TableCell>
                    <TableCell>{formatDate(order.delivery_date)}</TableCell>
                    <TableCell align="right">
                      <Chip label={`${order.item_count} items`} size="small" variant="outlined" sx={{ borderRadius: '8px' }} />
                    </TableCell>
                    <TableCell align="right">{formatCurrency(order.sub_total)}</TableCell>
                    <TableCell align="right" sx={{ color: tokens.chartViolet }}>{formatCurrency((parseFloat(order.cgst || 0) + parseFloat(order.sgst || 0)))}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#059669' }}>{formatCurrency(order.total)}</TableCell>
                  </TableRow>
                ))}
                {filteredOrders.length === 0 && (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: tokens.textSecondary }}>No purchase orders found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : null}
    </AppLayout>
  );
};

export default POSummaries;
