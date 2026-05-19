import React, { useState } from 'react';
import {
  Box, Typography, Grid, TextField, Button,
  Select, MenuItem, FormControl, InputLabel, Paper, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import axios from 'axios';
import BASE_URL from '../config/api';

const AddCustomerForm = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    customer_type: 'Domestic',
    title: 'MR',
    customer_name: '',
    company_name: '',
    display_name: '',
    email: '',
    mobile: '',
    office_no: '',
    pan: '',
    gst: '',
    currency: 'INR',
    document_path: '',
    billing_recipient_name: '',
    billing_country: '',
    billing_address1: '',
    billing_address2: '',
    billing_city: '',
    billing_state: '',
    billing_state_code: '',
    billing_pincode: '',
    billing_fax: '',
    billing_phone: '',
    shipping_recipient_name: '',
    shipping_country: '',
    shipping_address1: '',
    shipping_address2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_state_code: '',
    shipping_pincode: '',
    shipping_fax: '',
    shipping_phone: '',
    remark: '',
    status: 'Active'
  });

  const validate = () => {
    const e = {};
    // Basic Information
    if (!formData.customer_name || !formData.customer_name.trim()) e.customer_name = 'Customer name is required';
    else if (formData.customer_name.trim().length < 2) e.customer_name = 'Must be at least 2 characters';
    
    if (!formData.display_name || !formData.display_name.trim()) e.display_name = 'Display name is required';
    else if (formData.display_name.trim().length < 2) e.display_name = 'Must be at least 2 characters';
    
    if (formData.company_name && formData.company_name.trim().length < 2) e.company_name = 'Must be at least 2 characters';

    // Contact Information
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email format';
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) e.mobile = 'Mobile must be exactly 10 digits';
    if (formData.office_no && !/^\d{8,15}$/.test(formData.office_no)) e.office_no = 'Office number must be 8-15 digits';

    // Tax Information
    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.toUpperCase())) e.pan = 'Invalid PAN (e.g. ABCDE1234F)';
    if (formData.gst && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(formData.gst.toUpperCase())) e.gst = 'Invalid GST format';

    // Billing Address Validation
    if (formData.billing_recipient_name && formData.billing_recipient_name.trim().length < 2) e.billing_recipient_name = 'Must be at least 2 characters';
    if (formData.billing_address1 && formData.billing_address1.trim().length < 5) e.billing_address1 = 'Address must be at least 5 characters';
    if (formData.billing_country && !/^[a-zA-Z\s]+$/.test(formData.billing_country)) e.billing_country = 'Country must contain only letters';
    if (formData.billing_state && !/^[a-zA-Z\s]+$/.test(formData.billing_state)) e.billing_state = 'State must contain only letters';
    if (formData.billing_city && !/^[a-zA-Z\s]+$/.test(formData.billing_city)) e.billing_city = 'City must contain only letters';
    if (formData.billing_state_code && !/^\d{1,2}$/.test(formData.billing_state_code)) e.billing_state_code = 'State code must be 1-2 digits';
    if (formData.billing_pincode && !/^\d{6}$/.test(formData.billing_pincode)) e.billing_pincode = 'Pincode must be exactly 6 digits';
    if (formData.billing_phone && !/^\d{8,15}$/.test(formData.billing_phone)) e.billing_phone = 'Phone must be 8-15 digits';
    if (formData.billing_fax && !/^\d{8,15}$/.test(formData.billing_fax)) e.billing_fax = 'Fax must be 8-15 digits';

    // Shipping Address Validation
    if (formData.shipping_recipient_name && formData.shipping_recipient_name.trim().length < 2) e.shipping_recipient_name = 'Must be at least 2 characters';
    if (formData.shipping_address1 && formData.shipping_address1.trim().length < 5) e.shipping_address1 = 'Address must be at least 5 characters';
    if (formData.shipping_country && !/^[a-zA-Z\s]+$/.test(formData.shipping_country)) e.shipping_country = 'Country must contain only letters';
    if (formData.shipping_state && !/^[a-zA-Z\s]+$/.test(formData.shipping_state)) e.shipping_state = 'State must contain only letters';
    if (formData.shipping_city && !/^[a-zA-Z\s]+$/.test(formData.shipping_city)) e.shipping_city = 'City must contain only letters';
    if (formData.shipping_state_code && !/^\d{1,2}$/.test(formData.shipping_state_code)) e.shipping_state_code = 'State code must be 1-2 digits';
    if (formData.shipping_pincode && !/^\d{6}$/.test(formData.shipping_pincode)) e.shipping_pincode = 'Pincode must be exactly 6 digits';
    if (formData.shipping_phone && !/^\d{8,15}$/.test(formData.shipping_phone)) e.shipping_phone = 'Phone must be 8-15 digits';
    if (formData.shipping_fax && !/^\d{8,15}$/.test(formData.shipping_fax)) e.shipping_fax = 'Fax must be 8-15 digits';

    // Other Information
    if (formData.remark && formData.remark.length > 500) e.remark = 'Remark cannot exceed 500 characters';
    
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const formatted = (name === 'pan' || name === 'gst') ? value.toUpperCase() : value;
    setFormData({ ...formData, [name]: formatted });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      await axios.post(`${BASE_URL}/customers`, formData);
      alert('Customer added successfully!');
      navigate('/customer');
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error adding customer.');
    }
  };

  const numericFields = [
    'mobile', 'office_no', 'billing_pincode', 'shipping_pincode',
    'billing_fax', 'shipping_fax', 'billing_phone', 'shipping_phone',
    'shipping_state_code', 'billing_state_code'
  ];

  const renderTextFields = (fields) =>
    fields.map((field) => (
      <Grid item xs={12} sm={6} key={field}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          label={field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          name={field}
          value={formData[field] || ''}
          onChange={handleChange}
          type={numericFields.includes(field) ? 'number' : 'text'}
          inputProps={numericFields.includes(field) ? { inputMode: 'numeric', pattern: '[0-9]*' } : undefined}
          error={!!errors[field]}
          helperText={errors[field] || ''}
        />
      </Grid>
    ));

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 1100, mx: 'auto' }}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Add Customer
          </Typography>
          <form onSubmit={handleSubmit}>

            {/* Customer Information */}
            <Grid item xs={12}><Typography variant="h6">Customer Information</Typography><Divider sx={{ mb: 2 }} /></Grid>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Customer Type</InputLabel>
                  <Select name="customer_type" value={formData.customer_type} onChange={handleChange}>
                    <MenuItem value="Domestic">Domestic</MenuItem>
                    <MenuItem value="International">International</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Title</InputLabel>
                  <Select name="title" value={formData.title} onChange={handleChange}>
                    <MenuItem value="MR">MR</MenuItem>
                    <MenuItem value="MS">MS</MenuItem>
                    <MenuItem value="MRS">MRS</MenuItem>
                    <MenuItem value="DR">DR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {renderTextFields(['customer_name', 'company_name', 'display_name', 'email', 'mobile', 'office_no', 'pan', 'gst', 'document_path'])}
            </Grid>

            {/* Billing Address */}
            <Grid item xs={12} mt={3}><Typography variant="h6">Billing Address</Typography><Divider sx={{ mb: 2 }} /></Grid>
            <Grid container spacing={3}>
              {renderTextFields([
                'billing_recipient_name', 'billing_country', 'billing_address1',
                'billing_address2', 'billing_city', 'billing_state', 'billing_state_code',
                'billing_pincode', 'billing_fax', 'billing_phone'
              ])}
            </Grid>

            {/* Shipping Address */}
            <Grid item xs={12} mt={3}><Typography variant="h6">Shipping Address</Typography><Divider sx={{ mb: 2 }} /></Grid>
            <Grid container spacing={3}>
              {renderTextFields([
                'shipping_recipient_name', 'shipping_country', 'shipping_address1',
                'shipping_address2', 'shipping_city', 'shipping_state', 'shipping_state_code',
                'shipping_pincode', 'shipping_fax', 'shipping_phone'
              ])}
            </Grid>

            {/* Other Information */}
            <Grid item xs={12} mt={3}><Typography variant="h6">Other Information</Typography><Divider sx={{ mb: 2 }} /></Grid>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Currency</InputLabel>
                  <Select name="currency" value={formData.currency} onChange={handleChange}>
                    <MenuItem value="INR">INR</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select name="status" value={formData.status} onChange={handleChange}>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {renderTextFields(['remark'])}
            </Grid>

            {/* Submit */}
            <Grid item xs={12}>
              <Box mt={2}>
                <Button type="submit" variant="contained" size="large" color="primary">
                  Submit
                </Button>
              </Box>
            </Grid>

          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default AddCustomerForm;
