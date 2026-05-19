import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, TextField, Button, Paper, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import Sidebar from "./Sidebar";
import axios from 'axios';
import BASE_URL from '../config/api';

export default function EditWorkOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    work_order_id: '',
    work_order_number: '',
    customer_name: '',
    work_order_date: '',
    expiry_date: '',
    status: '',
    grand_total: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const fetchWorkOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${BASE_URL}/work-orders/${id}`);
        if (!res.data) {
          throw new Error('No data returned from server');
        }
        const wo = res.data.workOrder || res.data;
        
        const formattedData = {
          work_order_id: wo.work_order_id || '',
          work_order_number: wo.work_order_number || '',
          customer_name: wo.customer_name || '',
          work_order_date: wo.work_order_date ? new Date(wo.work_order_date).toISOString().split('T')[0] : '',
          expiry_date: (wo.expiry_date || wo.due_date) ? new Date(wo.expiry_date || wo.due_date).toISOString().split('T')[0] : '',
          status: wo.status || '',
          grand_total: wo.grand_total || '',
        };
        
        setFormData(formattedData);
      } catch (err) {
        setError(`Failed to fetch work order: ${err.message}`);
        console.error('Error fetching work order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkOrder();
  }, [id]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/customers`);
        console.log("📦 Customers from backend:", res.data);
        setCustomers(Array.isArray(res.data) ? res.data : res.data.data || []);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError(`Failed to fetch customers: ${err.message}`);
        setCustomers([]);
      }
    };
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.customer_name) {
      tempErrors.customer_name = 'Customer is required';
      isValid = false;
    }
    if (!formData.work_order_date) {
      tempErrors.work_order_date = 'Created Date is required';
      isValid = false;
    }
    if (!formData.status) {
      tempErrors.status = 'Status is required';
      isValid = false;
    }
    if (formData.expiry_date && formData.work_order_date && new Date(formData.expiry_date) < new Date(formData.work_order_date)) {
      tempErrors.expiry_date = 'Expiry Date cannot be before Created Date';
      isValid = false;
    }

    setFieldErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      alert("Please correct the highlighted errors before saving.");
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await axios.put(`${BASE_URL}/work-orders/${id}`, {
        customer_name: formData.customer_name,
        work_order_number: formData.work_order_number,
        work_order_date: formData.work_order_date,
        expiry_date: formData.expiry_date,
        status: formData.status,
        grand_total: formData.grand_total,
      });
      alert('Work order updated successfully!');
      navigate('/Work-Order-List');
    } catch (err) {
      console.error('Frontend - Full Error:', err);
      console.error('Frontend - Error Response:', err.response);
      console.error('Frontend - Error Data:', err.response?.data);
      setError(`Failed to update work order: ${err.response?.data?.details || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Loading work order...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => window.location.reload()} variant="contained" sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Paper sx={{ width: 600, p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={600} mb={3} textAlign="center">
            Edit Work Order
          </Typography>
          {error && (
            <Typography color="error" mb={2} textAlign="center">
              {error}
            </Typography>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              name="work_order_id"
              label="Work Order ID"
              value={formData.work_order_id}
              onChange={handleChange}
              margin="normal"
              disabled
            />
            <TextField
              fullWidth
              name="work_order_number"
              label="Work Order #"
              value={formData.work_order_number}
              onChange={handleChange}
              margin="normal"
              disabled
            />
            <FormControl fullWidth margin="normal" error={!!fieldErrors.customer_name}>
              <InputLabel>Customer</InputLabel>
              <Select
                name="customer_name"
                value={formData.customer_name || ''}
                label="Customer"
                onChange={handleChange}
                required
              >
                <MenuItem value="">Select Customer</MenuItem>
                {customers.map(customer => (
                  <MenuItem key={customer.customer_id || customer.id} value={customer.customer_name || customer.name}>
                    {customer.customer_name || customer.name}
                  </MenuItem>
                ))}
                {formData.customer_name && !customers.some(c => (c.customer_name || c.name) === formData.customer_name) && (
                  <MenuItem value={formData.customer_name}>{formData.customer_name}</MenuItem>
                )}
              </Select>
              {fieldErrors.customer_name && (
                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                  {fieldErrors.customer_name}
                </Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              name="work_order_date"
              label="Created Date"
              type="date"
              value={formData.work_order_date}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
              error={!!fieldErrors.work_order_date}
              helperText={fieldErrors.work_order_date}
            />
            <TextField
              fullWidth
              name="expiry_date"
              label="Expiry Date"
              type="date"
              value={formData.expiry_date}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              error={!!fieldErrors.expiry_date}
              helperText={fieldErrors.expiry_date}
            />
            <FormControl fullWidth margin="normal" error={!!fieldErrors.status}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status || ''}
                label="Status"
                onChange={handleChange}
                required
              >
                <MenuItem value="">Select Status</MenuItem>
                {['Draft', 'In Progress', 'Completed', 'Cancelled'].map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
              {fieldErrors.status && (
                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                  {fieldErrors.status}
                </Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              name="grand_total"
              label="Amount"
              value={formData.grand_total}
              onChange={handleChange}
              margin="normal"
              disabled
            />
            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button variant="contained" type="submit" disabled={loading}>
                Save Changes
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}
