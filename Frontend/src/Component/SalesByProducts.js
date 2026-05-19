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
  LinearProgress,
  Grid,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DiscountIcon from '@mui/icons-material/Discount';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
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
  Cell,
  LabelList,
} from 'recharts';

const GRADIENT_COLORS = ['#8b5cf6', '#6d28d9', '#7c3aed', '#5b21b6', '#4c1d95'];
const PIE_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#6366f1'];

const CustomBarTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', minWidth: 180 }}>
        <Typography variant="subtitle2" fontWeight="bold" color="#1e293b" mb={0.5}>{label}</Typography>
        {payload.map((entry, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entry.color }} />
            <Typography variant="caption" color="text.secondary">{entry.name}:</Typography>
            <Typography variant="caption" fontWeight="bold">{formatCurrency(entry.value)}</Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

const SalesByProducts = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chartView, setChartView] = useState('bar');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/analytics/sales/by-products`);
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch sales by product data');
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

  const filteredProducts = data?.products?.filter(p =>
    p.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const maxRevenue = Math.max(...(data?.products?.map(p => parseFloat(p.total_revenue) || 0) || [1]));
  const top10 = data?.products?.slice(0, 10) || [];

  const barChartData = top10.map(p => ({
    name: p.product_name?.length > 14 ? p.product_name.slice(0, 14) + '…' : p.product_name,
    Revenue: parseFloat(p.total_revenue) || 0,
    Discount: parseFloat(p.total_discount) || 0,
  }));

  const pieChartData = top10.map(p => ({
    name: p.product_name?.length > 20 ? p.product_name.slice(0, 20) + '…' : p.product_name,
    value: parseFloat(p.total_revenue) || 0,
  }));

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Card sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}20`,
      transition: 'all 0.3s ease',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 25px ${color}25` },
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </Box>
          {trend && (
            <Chip label={trend} size="small" sx={{ bgcolor: `${color}15`, color: color, fontWeight: 'bold', fontSize: '11px' }} />
          )}
        </Box>
        <Typography variant="h4" fontWeight="bold" color={color} sx={{ mb: 0.5 }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary" fontWeight="medium">{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{subtitle}</Typography>}
      </CardContent>
    </Card>
  );

  const getRankBadge = (index) => {
    if (index === 0) return { label: '🥇 #1', color: '#f59e0b' };
    if (index === 1) return { label: '🥈 #2', color: '#94a3b8' };
    if (index === 2) return { label: '🥉 #3', color: '#cd7f32' };
    return { label: `#${index + 1}`, color: '#8b5cf6' };
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <Box sx={{ backgroundColor: '#fff', p: 2, px: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#8b5cf615', display: 'flex' }}>
              <InventoryIcon sx={{ color: '#8b5cf6' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#1e293b" lineHeight={1.2}>Sales By Products</Typography>
              <Typography variant="caption" color="text.secondary">Product performance & revenue analytics</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9', px: 2, py: 0.5, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <SearchIcon fontSize="small" sx={{ mr: 1, color: '#64748b' }} />
              <InputBase placeholder="Search analytics..." sx={{ fontSize: '14px' }} />
            </Box>
            <IconButton sx={{ color: '#64748b' }}><NotificationsNoneIcon /></IconButton>
            <UserMenu />
            <Avatar src="/avatar.png" sx={{ width: 32, height: 32 }} />
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, flexGrow: 1 }}>

          {/* Hero Banner */}
          <Paper elevation={0} sx={{
            p: 4, borderRadius: '20px', mb: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', position: 'relative', overflow: 'hidden'
          }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h5" fontWeight="bold" mb={0.5}>📦 Product Sales Analytics</Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Track product performance, revenue contribution, and quantity trends across all your inventory.
              </Typography>
            </Box>
            <Box sx={{ position: 'absolute', right: -30, top: -30, opacity: 0.08 }}>
              <InventoryIcon sx={{ fontSize: 180 }} />
            </Box>
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
              <CircularProgress size={60} sx={{ color: '#8b5cf6' }} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
          ) : data ? (
            <>
              {/* KPI Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2.5, mb: 3 }}>
                <StatCard
                  title="Unique Products"
                  value={data.summary.unique_products}
                  icon={<InventoryIcon sx={{ fontSize: 26, color: '#8b5cf6' }} />}
                  color="#8b5cf6"
                  subtitle="Products sold"
                />
                <StatCard
                  title="Total Revenue"
                  value={formatCurrency(data.summary.total_product_revenue)}
                  icon={<AttachMoneyIcon sx={{ fontSize: 26, color: '#10b981' }} />}
                  color="#10b981"
                  subtitle="From all products"
                />
                <StatCard
                  title="Qty Sold"
                  value={new Intl.NumberFormat('en-IN').format(data.summary.total_quantity_sold || 0)}
                  icon={<ShoppingCartIcon sx={{ fontSize: 26, color: '#3b82f6' }} />}
                  color="#3b82f6"
                  subtitle="Total units"
                />
                <StatCard
                  title="Total Discounts"
                  value={formatCurrency(data.summary.total_discounts)}
                  icon={<DiscountIcon sx={{ fontSize: 26, color: '#f59e0b' }} />}
                  color="#f59e0b"
                  subtitle="Given on products"
                />
              </Box>

              {/* Charts Section */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Bar Chart — Top 10 Products by Revenue */}
                <Grid item xs={12} lg={8}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" color="#1e293b">Top 10 Products — Revenue vs Discount</Typography>
                        <Typography variant="caption" color="text.secondary">Comparing revenue earned vs discount given per product</Typography>
                      </Box>
                      <ToggleButtonGroup size="small" value={chartView} exclusive onChange={(e, v) => v && setChartView(v)} sx={{ '& .MuiToggleButton-root': { borderRadius: '8px', border: '1px solid #e2e8f0', px: 1.5 } }}>
                        <ToggleButton value="bar"><BarChartIcon fontSize="small" /></ToggleButton>
                        <ToggleButton value="pie"><PieChartIcon fontSize="small" /></ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                    <Box sx={{ height: 320, width: '100%' }}>
                      <ResponsiveContainer>
                        {chartView === 'bar' ? (
                          <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-35} textAnchor="end" interval={0} />
                            <YAxis tickFormatter={(val) => `₹${val / 1000}k`} tick={{ fontSize: 11, fill: '#64748b' }} />
                            <RechartsTooltip content={<CustomBarTooltip formatCurrency={formatCurrency} />} />
                            <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13 }} />
                            <Bar dataKey="Revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={40}>
                              {barChartData.map((_, i) => (
                                <Cell key={i} fill={GRADIENT_COLORS[i % GRADIENT_COLORS.length]} />
                              ))}
                            </Bar>
                            <Bar dataKey="Discount" fill="#fbbf24" radius={[6, 6, 0, 0]} maxBarSize={40} />
                          </BarChart>
                        ) : (
                          <PieChart>
                            <Pie data={pieChartData} cx="50%" cy="50%" outerRadius={110} innerRadius={55} paddingAngle={3} dataKey="value">
                              {pieChartData.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(val) => formatCurrency(val)} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                          </PieChart>
                        )}
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>

                {/* Top 3 Product Podium */}
                <Grid item xs={12} lg={4}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <EmojiEventsIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
                      <Typography variant="subtitle1" fontWeight="bold" color="#1e293b">Top Performers</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {(data?.products || []).slice(0, 5).map((product, index) => {
                        const pct = maxRevenue > 0 ? (parseFloat(product.total_revenue) / maxRevenue) * 100 : 0;
                        const badge = getRankBadge(index);
                        return (
                          <Box key={index}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label={badge.label} size="small" sx={{ bgcolor: `${badge.color}20`, color: badge.color, fontWeight: 'bold', fontSize: '11px', height: 22 }} />
                                <Typography variant="body2" fontWeight="medium" color="#1e293b" noWrap sx={{ maxWidth: 130 }}>
                                  {product.product_name}
                                </Typography>
                              </Box>
                              <Typography variant="caption" fontWeight="bold" color="#8b5cf6">
                                {formatCurrency(product.total_revenue)}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{
                                height: 6, borderRadius: 3,
                                bgcolor: '#f1f5f9',
                                '& .MuiLinearProgress-bar': { borderRadius: 3, background: `linear-gradient(90deg, #8b5cf6, #667eea)` },
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    {/* Qty vs Revenue mini summary */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                      <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#8b5cf615', textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" color="#8b5cf6">
                          {data.summary.unique_products}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">SKUs</Typography>
                      </Box>
                      <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#10b98115', textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" color="#10b981">
                          {new Intl.NumberFormat('en-IN').format(data.summary.total_quantity_sold || 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Units Sold</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Search + Table */}
              <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TableChartIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight="bold" color="#1e293b">
                      Product Details
                    </Typography>
                    <Chip label={`${filteredProducts.length} products`} size="small" sx={{ bgcolor: '#8b5cf615', color: '#8b5cf6', fontWeight: 'bold' }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f8fafc', px: 2, py: 0.75, borderRadius: '10px', border: '1px solid #e2e8f0', minWidth: 220 }}>
                    <SearchIcon fontSize="small" sx={{ mr: 1, color: '#94a3b8' }} />
                    <InputBase
                      placeholder="Search products..."
                      fullWidth
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{ fontSize: '13px' }}
                    />
                  </Box>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: '#334155', py: 1.5 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#334155' }}>Product</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Times Sold</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Qty Sold</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Revenue</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Avg Rate</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#334155' }}>Discount</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#334155', minWidth: 160 }}>Revenue Share</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredProducts.map((product, index) => {
                        const revenuePercent = maxRevenue > 0 ? (parseFloat(product.total_revenue) / maxRevenue) * 100 : 0;
                        const badge = getRankBadge(index);
                        return (
                          <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f8fafc' }, transition: 'background 0.2s', '&:last-child td': { border: 0 } }}>
                            <TableCell>
                              <Chip
                                label={badge.label}
                                size="small"
                                sx={{ bgcolor: index < 3 ? `${badge.color}20` : '#f1f5f9', color: index < 3 ? badge.color : '#64748b', fontWeight: 'bold', fontSize: '11px' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: `${PIE_COLORS[index % PIE_COLORS.length]}20`, color: PIE_COLORS[index % PIE_COLORS.length] }}>
                                  {product.product_name?.charAt(0) || '?'}
                                </Avatar>
                                <Typography variant="body2" fontWeight="medium" color="#1e293b">{product.product_name || 'N/A'}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Chip label={product.times_sold} size="small" variant="outlined" sx={{ borderRadius: '6px', fontSize: '12px' }} />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="medium">{new Intl.NumberFormat('en-IN').format(product.total_quantity || 0)}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold" color="#059669">{formatCurrency(product.total_revenue)}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="#475569">{formatCurrency(product.avg_rate)}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="#f59e0b" fontWeight="medium">{formatCurrency(product.total_discount)}</Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={revenuePercent}
                                  sx={{
                                    flexGrow: 1, height: 7, borderRadius: 4,
                                    bgcolor: '#f1f5f9',
                                    '& .MuiLinearProgress-bar': { borderRadius: 4, background: 'linear-gradient(90deg, #8b5cf6, #667eea)' },
                                  }}
                                />
                                <Typography variant="caption" color="#8b5cf6" fontWeight="bold" sx={{ minWidth: 34, textAlign: 'right' }}>
                                  {revenuePercent.toFixed(0)}%
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {filteredProducts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                              <InventoryIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
                              <Typography color="text.secondary">No product data found</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default SalesByProducts;
