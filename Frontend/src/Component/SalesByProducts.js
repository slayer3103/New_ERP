import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  InputBase,
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
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DiscountIcon from '@mui/icons-material/Discount';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AppLayout from '../layouts/AppLayout';
import ReportPageHeader from '../components/common/ReportPageHeader';
import AnalyticsStatCard from '../components/common/AnalyticsStatCard';
import ChartCard from '../components/common/ChartCard';
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
  Cell,
} from 'recharts';

const GRADIENT_COLORS = ['#8b5cf6', '#6d28d9', '#7c3aed', '#5b21b6', '#4c1d95'];

const CustomBarTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', minWidth: 180 }}>
        <Typography variant="subtitle2" fontWeight="bold" color={tokens.textPrimary} mb={0.5}>{label}</Typography>
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

  const getRankBadge = (index) => {
    if (index === 0) return { label: '🥇 #1', color: tokens.chartAmber };
    if (index === 1) return { label: '🥈 #2', color: '#94a3b8' };
    if (index === 2) return { label: '🥉 #3', color: '#cd7f32' };
    return { label: `#${index + 1}`, color: tokens.chartViolet };
  };

  return (
    <AppLayout title="Sales By Products">
      {/* Hero Banner */}
      <ReportPageHeader
        title="📦 Product Sales Analytics"
        subtitle="Track product performance, revenue contribution, and quantity trends across all your inventory."
        gradientStart="#667EEA"
        gradientEnd="#764BA2"
        icon={InventoryIcon}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
          <CircularProgress size={60} sx={{ color: tokens.chartViolet }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
      ) : data ? (
        <>
          {/* KPI Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 2.5 }, mb: 3 }}>
            <AnalyticsStatCard
              title="Unique Products"
              value={data.summary.unique_products}
              icon={<InventoryIcon sx={{ fontSize: 26, color: tokens.chartViolet }} />}
              color={tokens.chartViolet}
              subtitle="Products sold"
            />
            <AnalyticsStatCard
              title="Total Revenue"
              value={formatCurrency(data.summary.total_product_revenue)}
              icon={<AttachMoneyIcon sx={{ fontSize: 26, color: tokens.chartGreen }} />}
              color={tokens.chartGreen}
              subtitle="From all products"
            />
            <AnalyticsStatCard
              title="Qty Sold"
              value={new Intl.NumberFormat('en-IN').format(data.summary.total_quantity_sold || 0)}
              icon={<ShoppingCartIcon sx={{ fontSize: 26, color: tokens.chartBlue }} />}
              color={tokens.chartBlue}
              subtitle="Total units"
            />
            <AnalyticsStatCard
              title="Total Discounts"
              value={formatCurrency(data.summary.total_discounts)}
              icon={<DiscountIcon sx={{ fontSize: 26, color: tokens.chartAmber }} />}
              color={tokens.chartAmber}
              subtitle="Given on products"
            />
          </Box>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Bar Chart — Top 10 Products by Revenue */}
            <Grid item xs={12} lg={8}>
              <ChartCard
                title="Top 10 Products — Revenue vs Discount"
                subtitle="Comparing revenue earned vs discount given per product"
                height={400}
                actions={
                  <ToggleButtonGroup size="small" value={chartView} exclusive onChange={(e, v) => v && setChartView(v)} sx={{ '& .MuiToggleButton-root': { borderRadius: '8px', border: `1px solid ${tokens.tableBorder}`, px: 1.5 } }}>
                    <ToggleButton value="bar"><BarChartIcon fontSize="small" /></ToggleButton>
                    <ToggleButton value="pie"><PieChartIcon fontSize="small" /></ToggleButton>
                  </ToggleButtonGroup>
                }
              >
                <ResponsiveContainer>
                  {chartView === 'bar' ? (
                    <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 10, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.chartGrid} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: tokens.chartAxisText }} angle={-35} textAnchor="end" interval={0} />
                      <YAxis tickFormatter={(val) => `₹${val / 1000}k`} tick={{ fontSize: 11, fill: tokens.chartAxisText }} width={65} />
                      <RechartsTooltip content={<CustomBarTooltip formatCurrency={formatCurrency} />} />
                      <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13 }} />
                      <Bar dataKey="Revenue" fill={tokens.chartViolet} radius={[6, 6, 0, 0]} maxBarSize={40}>
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
                          <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val) => formatCurrency(val)} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </ChartCard>
            </Grid>

            {/* Top 3 Product Podium */}
            <Grid item xs={12} lg={4}>
              <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '16px', border: `1px solid ${tokens.tableBorder}`, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <EmojiEventsIcon sx={{ color: tokens.chartAmber, fontSize: 22 }} />
                  <Typography variant="subtitle1" fontWeight="bold" color={tokens.textPrimary}>Top Performers</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {(data?.products || []).slice(0, 5).map((product, index) => {
                    const pct = maxRevenue > 0 ? (parseFloat(product.total_revenue) / maxRevenue) * 100 : 0;
                    const badge = getRankBadge(index);
                    return (
                      <Box key={index}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                            <Chip label={badge.label} size="small" sx={{ bgcolor: `${badge.color}20`, color: badge.color, fontWeight: 'bold', fontSize: '11px', height: 22, flexShrink: 0 }} />
                            <Typography variant="body2" fontWeight="medium" color={tokens.textPrimary} noWrap sx={{ maxWidth: { xs: 100, lg: 130 } }}>
                              {product.product_name}
                            </Typography>
                          </Box>
                          <Typography variant="caption" fontWeight="bold" color={tokens.chartViolet} sx={{ flexShrink: 0 }}>
                            {formatCurrency(product.total_revenue)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 7, borderRadius: 4,
                            bgcolor: tokens.surfaceHover,
                            '& .MuiLinearProgress-bar': { borderRadius: 4, background: `linear-gradient(90deg, ${tokens.chartViolet}, #667eea)` },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
                <Divider sx={{ my: 2 }} />
                {/* Qty vs Revenue mini summary */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: `${tokens.chartViolet}10`, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color={tokens.chartViolet}>
                      {data.summary.unique_products}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">SKUs</Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: `${tokens.chartGreen}10`, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color={tokens.chartGreen}>
                      {new Intl.NumberFormat('en-IN').format(data.summary.total_quantity_sold || 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Units Sold</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Search + Table */}
          <Paper elevation={0} sx={{ borderRadius: '16px', border: `1px solid ${tokens.tableBorder}`, overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 }, borderBottom: `1px solid ${tokens.surfaceHover}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TableChartIcon sx={{ color: tokens.chartViolet, fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight="bold" color={tokens.textPrimary}>
                  Product Details
                </Typography>
                <Chip label={`${filteredProducts.length} products`} size="small" sx={{ bgcolor: `${tokens.chartViolet}12`, color: tokens.chartViolet, fontWeight: 'bold' }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: tokens.surfaceSubtle, px: 2, py: 0.75, borderRadius: '10px', border: `1px solid ${tokens.tableBorder}`, width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 220 } }}>
                <SearchIcon fontSize="small" sx={{ mr: 1, color: tokens.textSecondary }} />
                <InputBase
                  placeholder="Search products..."
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ fontSize: '13px' }}
                />
              </Box>
            </Box>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 850 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Times Sold</TableCell>
                    <TableCell align="right">Qty Sold</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Avg Rate</TableCell>
                    <TableCell align="right">Discount</TableCell>
                    <TableCell sx={{ minWidth: 160 }}>Revenue Share</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product, index) => {
                    const revenuePercent = maxRevenue > 0 ? (parseFloat(product.total_revenue) / maxRevenue) * 100 : 0;
                    const badge = getRankBadge(index);
                    return (
                      <TableRow key={index} sx={{ '&:hover': { bgcolor: tokens.tableRowHover }, transition: 'background 0.2s', '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Chip
                            label={badge.label}
                            size="small"
                            sx={{ bgcolor: index < 3 ? `${badge.color}20` : tokens.surfaceHover, color: index < 3 ? badge.color : tokens.textSecondary, fontWeight: 'bold', fontSize: '11px' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: `${CHART_PALETTE[index % CHART_PALETTE.length]}20`, color: CHART_PALETTE[index % CHART_PALETTE.length] }}>
                              {product.product_name?.charAt(0) || '?'}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium" color={tokens.textPrimary}>{product.product_name || 'N/A'}</Typography>
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
                          <Typography variant="body2" color={tokens.textSecondary}>{formatCurrency(product.avg_rate)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color={tokens.chartAmber} fontWeight="medium">{formatCurrency(product.total_discount)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={revenuePercent}
                              sx={{
                                flexGrow: 1, height: 8, borderRadius: 4,
                                bgcolor: tokens.surfaceHover,
                                '& .MuiLinearProgress-bar': { borderRadius: 4, background: `linear-gradient(90deg, ${tokens.chartViolet}, #667eea)` },
                              }}
                            />
                            <Typography variant="caption" color={tokens.chartViolet} fontWeight="bold" sx={{ minWidth: 34, textAlign: 'right' }}>
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
                          <InventoryIcon sx={{ fontSize: 40, color: tokens.textSecondary, opacity: 0.4 }} />
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
    </AppLayout>
  );
};

export default SalesByProducts;
