import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, MenuItem, Button, Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import axios from 'axios';
import BASE_URL from '../config/api';

const EditTax = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tax_name: '',
    tax_rate: '',    tax_code: '',
    details: '',
    status: 'Active',
    effective_date: new Date()
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios.get(`${BASE_URL}/taxes/${id}`)
      .then((res) => {
        const tax = res.data;
        setForm({
          tax_name: tax.tax_name,
          tax_rate: tax.tax_rate,
          tax_code: tax.tax_code,
          details: tax.details,
          status: tax.status,
          effective_date: tax.effective_date ? new Date(tax.effective_date) : new Date()
        });
      })
      .catch((err) => {
        console.error("Error fetching tax:", err);
        alert("Failed to load tax details.");
      });
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({...errors, [e.target.name]: ''});
  };

  const handleUpdate = async () => {
    const e = {};
    if (!form.tax_name?.trim()) e.tax_name = 'Tax type is required';
    if (!form.tax_rate) e.tax_rate = 'Rate is required';
    else if (isNaN(form.tax_rate) || form.tax_rate < 0 || form.tax_rate > 100) e.tax_rate = 'Rate must be between 0 and 100';
    if (!form.tax_code?.trim()) e.tax_code = 'Label is required';
    if (!form.effective_date) e.effective_date = 'Effective date is required';

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});

    try {
      await axios.put(`${BASE_URL}/taxes/${id}`, {
        ...form,
        effective_date: form.effective_date.toISOString().split("T")[0]
      });
      alert("Tax updated successfully!");
      navigate('/tax');
    } catch (err) {
      console.error("Error updating tax:", err);
      alert("Update failed.");
    }
  };

  return (
    <AppLayout title="Edit Tax">
        <Box>
          <Paper sx={{ p: 1, borderRadius: 2 }}>
            <Box sx={{ p: 3 }}>
              <Box
                sx={{
                  bgcolor: '#fff',
                  borderRadius: 3,
                  p: 4,
                }}
              >
                <Typography variant="h6" fontWeight="bold" mb={3}>
                  Edit Tax
                </Typography>

                <Box display="flex" gap={2} flexWrap="wrap">
                  <TextField
                    label="Tax Type"
                    name="tax_name"
                    value={form.tax_name}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.tax_name}
                    helperText={errors.tax_name || ''}
                    sx={{ flex: 1, minWidth: 220 }}
                  />

                  <TextField
                    label="Rate (%)"
                    name="tax_rate"
                    value={form.tax_rate}
                    onChange={handleChange}
                    type="number"
                    fullWidth
                    required
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    error={!!errors.tax_rate}
                    helperText={errors.tax_rate || ''}
                    sx={{ flex: 1, minWidth: 220 }}
                  />

                  <TextField
                    label="Label/Category"
                    name="tax_code"
                    value={form.tax_code}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.tax_code}
                    helperText={errors.tax_code || ''}
                    sx={{ flex: 1, minWidth: 220 }}
                  />

                  <TextField
                    label="Status"
                    name="status"
                    select
                    value={form.status}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ flex: 1, minWidth: 220 }}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </TextField>

                  <DatePicker
                    label="Effective Date"
                    value={form.effective_date}
                    onChange={(newValue) => {
                      setForm({ ...form, effective_date: newValue });
                      if (errors.effective_date) setErrors({...errors, effective_date: ''});
                    }}
                    sx={{ flex: 1, minWidth: 220 }}
                    slotProps={{
                      textField: {
                        required: true,
                        error: !!errors.effective_date,
                        helperText: errors.effective_date || ''
                      }
                    }}
                  />
                </Box>

                <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/tax')}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      borderRadius: 2,
                      backgroundColor: '#004085',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: '#003060',
                      },
                    }}
                    onClick={handleUpdate}
                  >
                    Update
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
    </AppLayout>
  );
};

export default EditTax;
