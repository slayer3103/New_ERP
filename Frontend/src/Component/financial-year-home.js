import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Typography, Paper, Grid, Chip, Card, CardContent,
  CircularProgress, Divider, IconButton, Alert,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AddIcon from '@mui/icons-material/Add';
import EventNoteIcon from '@mui/icons-material/EventNote';
import DateRangeIcon from '@mui/icons-material/DateRange';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import BASE_URL from '../config/api';

const FinancialYearMain = () => {
  const [financialYears, setFinancialYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchYears = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/financialYear/all`);
      setFinancialYears(res.data.financialYears || []);
      setError('');
    } catch (err) {
      setError('Failed to load financial years');
      console.error('Error fetching financial years:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleActivate = async (id) => {
    try {
      setActionLoading(id);
      await axios.post(`${BASE_URL}/financialYear/activate/${id}`);
      window.location.reload();
    } catch (err) {
      setError('Activation failed: ' + (err.response?.data?.error || err.message));
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      setActionLoading(id);
      await axios.post(`${BASE_URL}/financialYear/deactivate/${id}`);
      window.location.reload();
    } catch (err) {
      setError('Deactivation failed: ' + (err.response?.data?.error || err.message));
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const activeYear = financialYears.find(y => y.is_active);
  const inactiveYears = financialYears.filter(y => !y.is_active);

  return (
    <AppLayout title="Financial Year Settings">
      {/* Hero Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 4, borderRadius: '20px', mb: 4,
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: 'white', position: 'relative', overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <CalendarMonthIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold">Financial Year Management</Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.85, maxWidth: 520 }}>
            Configure and manage your financial years. Activate the current year, add new ones, and configure document numbering series.
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/add/financial_year')}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: '12px',
                px: 3, py: 1,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              }}
            >
              Add New Financial Year
            </Button>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => navigate('/add-financial-year-settings')}
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: '12px',
                px: 3, py: 1,
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': { borderColor: 'rgba(255,255,255,0.5)', bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              Year Settings
            </Button>
          </Box>
        </Box>
        <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.06 }}>
          <CalendarMonthIcon sx={{ fontSize: 200 }} />
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
          <CircularProgress size={50} sx={{ color: '#3b82f6' }} />
        </Box>
      ) : financialYears.length === 0 ? (
        <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <EventNoteIcon sx={{ fontSize: 60, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>No Financial Years Found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Get started by adding your first financial year.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/add/financial_year')}
            sx={{
              bgcolor: '#2563eb',
              fontWeight: 'bold',
              textTransform: 'none',
              borderRadius: '12px',
              px: 4, py: 1.2,
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            Add Financial Year
          </Button>
        </Paper>
      ) : (
        <>
          {/* Active Financial Year — Featured Card */}
          {activeYear && (() => {
            const start = new Date(activeYear.start_date);
            const end = new Date(activeYear.end_date);
            const fyName = `FY ${start.getFullYear()}-${String(end.getFullYear()).slice(-2)}`;
            const now = new Date();
            const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            const elapsedDays = Math.max(0, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));
            const progress = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

            return (
              <Paper
                elevation={0}
                sx={{
                  p: 0, borderRadius: '16px', mb: 4,
                  border: '2px solid #10b981',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ px: 3, py: 1.5, bgcolor: '#10b98115', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight="bold" color="#10b981" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Active Financial Year
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={5}>
                      <Typography variant="h4" fontWeight="bold" color="#1e293b" sx={{ mb: 1 }}>
                        {fyName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <DateRangeIcon sx={{ fontSize: 18, color: '#64748b' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(activeYear.start_date)} — {formatDate(activeYear.end_date)}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${progress}% complete • ${Math.max(0, totalDays - elapsedDays)} days remaining`}
                        size="small"
                        sx={{
                          bgcolor: '#f0fdf4',
                          color: '#166534',
                          fontWeight: 600,
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      {/* Progress Bar */}
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">Year Progress</Typography>
                          <Typography variant="caption" fontWeight="bold" color="#10b981">{progress}%</Typography>
                        </Box>
                        <Box sx={{
                          height: 8, borderRadius: 4, bgcolor: '#e2e8f0',
                          overflow: 'hidden',
                        }}>
                          <Box sx={{
                            height: '100%', borderRadius: 4,
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, #10b981, #059669)',
                            transition: 'width 1s ease',
                          }} />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
                        <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#f8fafc', flex: 1, textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary" display="block">Start</Typography>
                          <Typography variant="body2" fontWeight="bold" color="#1e293b">{formatDate(activeYear.start_date)}</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#f8fafc', flex: 1, textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary" display="block">End</Typography>
                          <Typography variant="body2" fontWeight="bold" color="#1e293b">{formatDate(activeYear.end_date)}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                          variant="outlined"
                          color="warning"
                          size="small"
                          onClick={() => handleDeactivate(activeYear.id)}
                          disabled={actionLoading === activeYear.id}
                          sx={{
                            textTransform: 'none',
                            borderRadius: '10px',
                            fontWeight: 600,
                          }}
                        >
                          {actionLoading === activeYear.id ? <CircularProgress size={18} /> : 'Deactivate'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            );
          })()}

          {/* Inactive Financial Years */}
          {inactiveYears.length > 0 && (
            <>
              <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 2 }}>
                Other Financial Years
              </Typography>
              <Grid container spacing={2.5}>
                {inactiveYears.map((year) => {
                  const start = new Date(year.start_date);
                  const end = new Date(year.end_date);
                  const fyName = `FY ${start.getFullYear()}-${String(end.getFullYear()).slice(-2)}`;

                  return (
                    <Grid item xs={12} sm={6} md={4} key={year.id}>
                      <Card
                        elevation={0}
                        sx={{
                          height: '100%',
                          borderRadius: '14px',
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#94a3b8',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{
                                p: 1, borderRadius: '10px',
                                bgcolor: '#f1f5f9',
                                display: 'flex',
                              }}>
                                <EventNoteIcon sx={{ color: '#64748b', fontSize: 20 }} />
                              </Box>
                              <Typography variant="h6" fontWeight="bold" color="#1e293b">
                                {fyName}
                              </Typography>
                            </Box>
                            <Chip
                              icon={<RadioButtonUncheckedIcon sx={{ fontSize: '14px !important' }} />}
                              label="Inactive"
                              size="small"
                              sx={{
                                bgcolor: '#f1f5f9',
                                color: '#64748b',
                                fontWeight: 600,
                                fontSize: '11px',
                                borderRadius: '8px',
                              }}
                            />
                          </Box>

                          <Divider sx={{ mb: 2 }} />

                          <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" color="text.secondary" display="block">Start</Typography>
                              <Typography variant="body2" fontWeight="medium" color="#1e293b">{formatDate(year.start_date)}</Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" color="text.secondary" display="block">End</Typography>
                              <Typography variant="body2" fontWeight="medium" color="#1e293b">{formatDate(year.end_date)}</Typography>
                            </Box>
                          </Box>

                          <Button
                            variant="contained"
                            fullWidth
                            size="small"
                            onClick={() => handleActivate(year.id)}
                            disabled={actionLoading === year.id}
                            sx={{
                              bgcolor: '#10b981',
                              fontWeight: 'bold',
                              textTransform: 'none',
                              borderRadius: '10px',
                              py: 1,
                              '&:hover': { bgcolor: '#059669' },
                            }}
                          >
                            {actionLoading === year.id ? <CircularProgress size={18} color="inherit" /> : 'Activate'}
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default FinancialYearMain;
