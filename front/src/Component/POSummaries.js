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
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BusinessIcon from '@mui/icons-material/Business';
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

const COLORS = ['#3b82f6', '#dc2626', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1'];

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
    <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ backgroundColor: '#fff', p: 2, px: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ListAltIcon sx={{ color: '#3b82f6' }} />
            <Typography variant="h5" fontWeight="bold" color="#1e293b">PO Summaries</Typography>
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
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', mb: 3, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: 'white' }}>📋 Purchase Order Summaries</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Overview of all purchase orders with total spending and item details</Typography>
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={60} sx={{ color: '#3b82f6' }} /></Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
          ) : data ? (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 3, mb: 3 }}>
                <StatCard title="Total Orders" value={data.summary.total_orders} icon={<ShoppingCartIcon sx={{ fontSize: 28, color: '#3b82f6' }} />} color="#3b82f6" subtitle="Purchase orders" />
                <StatCard title="Total Spent" value={formatCurrency(data.summary.total_spent)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: '#dc2626' }} />} color="#dc2626" subtitle="All POs" />
                <StatCard title="Unique Vendors" value={data.summary.unique_vendors} icon={<BusinessIcon sx={{ fontSize: 28, color: '#8b5cf6' }} />} color="#8b5cf6" subtitle="Vendor count" />
                <StatCard title="Avg Order Value" value={formatCurrency(data.summary.avg_order_value)} icon={<AttachMoneyIcon sx={{ fontSize: 28, color: '#10b981' }} />} color="#10b981" subtitle="Per order" />
              </Box>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={7}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                    <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 2 }}>
                      Top 10 Vendors by Spend
                    </Typography>
                    <Box sx={{ height: 300, width: '100%' }}>
                      <ResponsiveContainer>
                        <BarChart data={vendorData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tickFormatter={(val) => `₹${val/1000}k`} />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                          <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                          <Legend />
                          <Bar dataKey="total_spent" name="Spend" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 2 }}>
                      Orders by Vendor
                    </Typography>
                    <Box sx={{ height: 300, width: '100%' }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={vendorData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="order_count"
                            nameKey="name"
                          >
                            {vendorData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', mb: 3, border: '1px solid #e2e8f0' }}>
                <InputBase
                  placeholder="Search by vendor or PO number..."
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ bgcolor: '#f8f8f8', borderRadius: '10px', px: 2, py: 1, border: '1px solid #e0e0e0' }}
                />
              </Paper>

              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="#1e293b">Purchase Order Details</Typography>
                </Box>
                <Divider />
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>PO Number</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Vendor</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Order Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Delivery Date</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Items</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Sub Total</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Tax</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.map((order, idx) => (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#f1f5f9' }, transition: 'background 0.2s' }}>
                        <TableCell>
                          <Typography fontWeight="medium" color="#3b82f6">{order.purchase_order_no}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: '#3b82f6', width: 30, height: 30, fontSize: 12 }}>
                              {order.vendor_name?.charAt(0) || '?'}
                            </Avatar>
                            <Typography>{order.vendor_name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{formatDate(order.purchase_order_date)}</TableCell>
                        <TableCell>{formatDate(order.delivery_date)}</TableCell>
                        <TableCell align="right">
                          <Chip label={`${order.item_count} items`} size="small" variant="outlined" sx={{ borderRadius: '8px' }} />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(order.sub_total)}</TableCell>
                        <TableCell align="right" sx={{ color: '#8b5cf6' }}>{formatCurrency((parseFloat(order.cgst || 0) + parseFloat(order.sgst || 0)))}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#059669' }}>{formatCurrency(order.total)}</TableCell>
                      </TableRow>
                    ))}
                    {filteredOrders.length === 0 && (
                      <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: '#94a3b8' }}>No purchase orders found</TableCell></TableRow>
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

export default POSummaries;
