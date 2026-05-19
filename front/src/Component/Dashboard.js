import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../redux/slices/dashboardSlice';
import AppLayout from '../layouts/AppLayout';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import StatCard from '../components/common/StatCard';
import { tokens } from '../theme/paletteTokens';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const CHART_COLORS = {
  paid: tokens.success,
  partial: tokens.warning,
  draft: tokens.danger,
  bar: tokens.primary,
};

const getStatusChipStyle = (status) => {
  const normalized = (status || '').toLowerCase();
  if (normalized.includes('paid') || normalized.includes('complete')) {
    return { bgcolor: `${tokens.success}18`, color: tokens.success };
  }
  if (normalized.includes('partial')) {
    return { bgcolor: `${tokens.warning}18`, color: tokens.warning };
  }
  return { bgcolor: `${tokens.danger}18`, color: tokens.danger };
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const {
    totalInvoices,
    recentInvoices,
    invoicesOverTime,
    loading,
    error,
    paid,
    partial,
    draft,
  } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const dataInvoiceStatus = [
    { name: 'Paid', value: parseInt(paid, 10) || 0, color: CHART_COLORS.paid },
    { name: 'Partial', value: parseInt(partial, 10) || 0, color: CHART_COLORS.partial },
    { name: 'Draft', value: parseInt(draft, 10) || 0, color: CHART_COLORS.draft },
  ].filter((item) => item.value > 0);

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <LoadingState message="Loading dashboard..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Dashboard">
        <ErrorState
          message={`Error: ${error}`}
          onRetry={() => dispatch(fetchDashboardData())}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      {/* KPI row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<ReceiptLongIcon />}
            label="Total Invoices"
            value={totalInvoices}
            accentColor={tokens.primary}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<CheckCircleOutlineIcon />}
            label="Paid"
            value={paid || 0}
            accentColor={tokens.success}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<HourglassEmptyIcon />}
            label="Partial"
            value={partial || 0}
            accentColor={tokens.warning}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<EditNoteIcon />}
            label="Draft"
            value={draft || 0}
            accentColor={tokens.danger}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left column */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ p: 2.5, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Recent Invoices
              </Typography>
              <Button
                component={Link}
                to="/invoice-list"
                size="small"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                View all
              </Button>
            </Box>
            {recentInvoices.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No recent invoices
              </Typography>
            ) : (
              <Box>
                {recentInvoices.map((invoice, index) => (
                  <Box
                    key={invoice.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1.5,
                      px: 1,
                      borderRadius: 1,
                      borderBottom:
                        index < recentInvoices.length - 1
                          ? `1px solid ${tokens.border}`
                          : 'none',
                      transition: 'background-color 0.15s ease',
                      '&:hover': { bgcolor: tokens.mutedSurface },
                    }}
                  >
                    <Box sx={{ minWidth: 0, pr: 2 }}>
                      <Typography fontWeight={600} noWrap>
                        {invoice.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {invoice.client_name}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1.5} flexShrink={0}>
                      <Chip
                        label={invoice.status}
                        size="small"
                        sx={{
                          ...getStatusChipStyle(invoice.status),
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 72 }}>
                        {new Date(invoice.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>

          <Paper elevation={0} sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Invoices Over Time
            </Typography>
            <Box sx={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={invoicesOverTime}
                  margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.border} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: tokens.textSecondary, fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: tokens.textSecondary, fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${tokens.border}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Bar
                    dataKey="invoices"
                    fill={CHART_COLORS.bar}
                    barSize={24}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Right column */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Quick Actions
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1.5}>
              <Button
                component={Link}
                to="/invoice-list"
                variant="contained"
                sx={{ textTransform: 'none' }}
              >
                All Invoices
              </Button>
              <Button
                component={Link}
                to="/new-invoice"
                variant="outlined"
                sx={{ textTransform: 'none' }}
              >
                New Invoice
              </Button>
              <Button
                component={Link}
                to="/customer-list"
                variant="outlined"
                sx={{ textTransform: 'none' }}
              >
                Customers
              </Button>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} mb={1}>
              Invoice Status Distribution
            </Typography>
            {dataInvoiceStatus.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No invoice data to display
              </Typography>
            ) : (
              <>
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataInvoiceStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {dataInvoiceStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} invoices`, name]}
                        contentStyle={{
                          borderRadius: 8,
                          border: `1px solid ${tokens.border}`,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box
                  sx={{
                    mt: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 2,
                  }}
                >
                  {dataInvoiceStatus.map((entry, index) => {
                    const total = dataInvoiceStatus.reduce(
                      (sum, item) => sum + (item.value || 0),
                      0
                    );
                    const percentage =
                      total > 0 ? Math.round((entry.value / total) * 100) : 0;
                    return (
                      <Box
                        key={index}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: entry.color,
                          }}
                        />
                        <Typography variant="body2" fontWeight={500}>
                          {entry.name} ({entry.value}) — {percentage}%
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </AppLayout>
  );
};

export default Dashboard;
