import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Paper, TextField, Alert, Grid,
  CircularProgress, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SaveIcon from '@mui/icons-material/Save';
import AppLayout from '../layouts/AppLayout';
import BASE_URL from '../config/api';

const AddFinancialYear = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Auto-calculate endDate as +1 year when startDate changes
  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setFullYear(start.getFullYear() + 1);
      end.setDate(end.getDate() - 1);
      const formatted = end.toISOString().split('T')[0];
      setEndDate(formatted);
    }
  }, [startDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!startDate || !endDate) {
      setError('Both start and end dates are required.');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date.');
      return;
    }

    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    if (new Date(startDate) < tenYearsAgo) {
      setError('Start date cannot be more than 10 years in the past.');
      return;
    }

    const fiveYearsAhead = new Date();
    fiveYearsAhead.setFullYear(fiveYearsAhead.getFullYear() + 5);
    if (new Date(startDate) > fiveYearsAhead) {
      setError('Start date cannot be more than 5 years in the future.');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${BASE_URL}/financialYear/add`, {
        start_date: startDate,
        end_date: endDate,
      });

      setSuccessMsg('Financial year added successfully!');
      setError('');

      setTimeout(() => {
        navigate('/add-Financial-year-settings');
        setTimeout(() => window.location.reload(), 100);
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add financial year');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getFYPreview = () => {
    if (!startDate) return null;
    const start = new Date(startDate);
    const endD = endDate ? new Date(endDate) : null;
    if (!endD) return null;
    return `FY ${start.getFullYear()}-${String(endD.getFullYear()).slice(-2)}`;
  };

  return (
    <AppLayout title="Add Financial Year">
      <Box sx={{ maxWidth: 640, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/add-financial-year-settings')}
            sx={{ textTransform: 'none', color: '#64748b', fontWeight: 600 }}
          >
            Back
          </Button>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {/* Banner */}
          <Box sx={{
            p: 3,
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            color: 'white',
            display: 'flex', alignItems: 'center', gap: 2,
          }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.12)' }}>
              <CalendarMonthIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="white">Add New Financial Year</Typography>
              <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                Set the start date and the end date will be auto-calculated
              </Typography>
            </Box>
          </Box>

          {/* Form */}
          <Box sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>
            )}
            {successMsg && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{successMsg}</Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="End Date (auto-calculated)"
                    type="date"
                    value={endDate}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ readOnly: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        bgcolor: '#f8fafc',
                      },
                    }}
                  />
                </Grid>
              </Grid>

              {/* Preview Card */}
              {getFYPreview() && (
                <Paper
                  elevation={0}
                  sx={{
                    mt: 3, p: 2.5, borderRadius: '12px',
                    bgcolor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CalendarMonthIcon sx={{ color: '#0284c7', fontSize: 22 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        This will create:
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold" color="#0c4a6e">
                        {getFYPreview()}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/add-financial-year-settings')}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '10px',
                    px: 3,
                    fontWeight: 600,
                    borderColor: '#cbd5e1',
                    color: '#475569',
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting || !startDate}
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '10px',
                    px: 3,
                    fontWeight: 'bold',
                    bgcolor: '#2563eb',
                    '&:hover': { bgcolor: '#1d4ed8' },
                  }}
                >
                  {submitting ? 'Adding...' : 'Add Financial Year'}
                </Button>
              </Box>
            </form>
          </Box>
        </Paper>
      </Box>
    </AppLayout>
  );
};

export default AddFinancialYear;
