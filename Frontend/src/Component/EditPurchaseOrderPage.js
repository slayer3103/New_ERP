import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Paper, Typography, MenuItem, FormControl, InputLabel, Select, Alert, CircularProgress } from '@mui/material';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';
import axios from 'axios';
import BASE_URL from '../config/api';

export default function EditPurchaseOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    purchase_order_number: '',
    vendor_name: '',
    created_date: '',
    delivery_date: '',
    status: '',
    bill_amount: '',
    payment_terms: '',
    due_date: '',
    customer_notes: '',
    terms_and_conditions: '',
    sub_total: 0,
    freight: 0,
    cgst: 0,
    sgst: 0,
    attachment: '',
    vendor_id: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendors, setVendors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});


  // Fetch PO
  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/purchase/${id}`);
        const po = res.data.purchase_order;
        setFormData({
          purchase_order_number: po.purchase_order_no || '',
          vendor_name: po.vendor_name || '',
          created_date: po.purchase_order_date ? po.purchase_order_date.slice(0, 10) : '',
          delivery_date: po.delivery_date ? po.delivery_date.slice(0, 10) : '',
          status: po.status || 'Draft',
          bill_amount: po.total || 0,
          payment_terms: po.payment_terms || '',
          due_date: po.due_date ? po.due_date.slice(0, 10) : '',
          customer_notes: po.customer_notes || '',
          terms_and_conditions: po.terms_and_conditions || '',
          sub_total: po.sub_total || 0,
          freight: po.freight || 0,
          cgst: po.cgst || 0,
          sgst: po.sgst || 0,
          attachment: po.attachment || '',
          vendor_id: po.vendor_id || null
        });

      } catch (err) {
        setError('Failed to fetch purchase order');
      } finally {
        setLoading(false);
      }
    };
    fetchPurchaseOrder();
  }, [id]);

  // Fetch vendor list
  useEffect(() => {
    axios.get(`${BASE_URL}/vendors`)
      .then(res => setVendors(res.data))
      .catch(() => setVendors([]));
  }, []);



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const e = {};
    if (!formData.vendor_name) e.vendor_name = "Vendor is required";
    if (!formData.created_date) e.created_date = "Created date is required";
    if (!formData.delivery_date) e.delivery_date = "Delivery date is required";
    else if (new Date(formData.delivery_date) < new Date(formData.created_date)) e.delivery_date = "Delivery date cannot be before created date";
    
    if (formData.bill_amount !== "" && (isNaN(formData.bill_amount) || parseFloat(formData.bill_amount) < 0)) e.bill_amount = "Bill amount must be non-negative";
    if (formData.freight !== "" && (isNaN(formData.freight) || parseFloat(formData.freight) < 0)) e.freight = "Freight must be non-negative";
    if (formData.customer_notes && formData.customer_notes.length > 500) e.customer_notes = "Notes cannot exceed 500 characters";

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError("Please correct the highlighted errors");
      return;
    }
    setFieldErrors({});
    setLoading(true);
    setError('');
    try {
      const response = await axios.put(`${BASE_URL}/purchase/${id}`, {
        purchase_order_no: formData.purchase_order_number,
        vendor_name: formData.vendor_name,
        purchase_order_date: formData.created_date,
        delivery_date: formData.delivery_date,
        status: formData.status,
        payment_terms: formData.payment_terms || 'Due end of the month',
        due_date: formData.due_date || '',
        customer_notes: formData.customer_notes || '',
        terms_and_conditions: formData.terms_and_conditions || '',
        sub_total: formData.sub_total || 0,
        freight: formData.freight || 0,
        cgst: formData.cgst || 0,
        sgst: formData.sgst || 0,
        total: formData.bill_amount || 0,
        attachment: formData.attachment || '',
        vendor_id: formData.vendor_id || null
      });
      
      console.log('Update response:', response.data);
      alert('Purchase order updated successfully!');
      navigate('/purchase-order-list');
    } catch (err) {
      console.error('Update error:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update purchase order';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Edit Purchase Order
          </Typography>
          <UserMenu />
        </Box>
        
        {/* Main Content */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5, width: '100%' }}>
          <Paper sx={{ width: 600, p: 4, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={600} mb={3} textAlign="center">
              Purchase Order Details
            </Typography>
          {error && <Typography color="error" mb={2}>{error}</Typography>}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              name="purchase_order_number"
              label="PO Number"
              value={formData.purchase_order_number}
              margin="normal"
              disabled
            />
            <FormControl fullWidth margin="normal" error={!!fieldErrors.vendor_name}>
              <InputLabel>Vendor</InputLabel>
              <Select
                name="vendor_name"
                value={formData.vendor_name || ''}
                label="Vendor"
                onChange={(e) => {
                  const selectedVendor = vendors.find(v => v.vendor_name === e.target.value);
                  setFormData({
                    ...formData,
                    vendor_name: e.target.value,
                    vendor_id: selectedVendor ? selectedVendor.vendor_id : null
                  });
                  if (fieldErrors.vendor_name) setFieldErrors({ ...fieldErrors, vendor_name: '' });
                }}
              >
                {vendors.map(vendor => (
                  <MenuItem key={vendor.vendor_id} value={vendor.vendor_name}>
                    {vendor.vendor_name}
                  </MenuItem>
                ))}
                {formData.vendor_name && !vendors.some(v => v.vendor_name === formData.vendor_name) && (
                  <MenuItem value={formData.vendor_name}>{formData.vendor_name}</MenuItem>
                )}
              </Select>
              {fieldErrors.vendor_name && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                  {fieldErrors.vendor_name}
                </Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              name="created_date"
              label="Created Date"
              type="date"
              value={formData.created_date ? formData.created_date.slice(0, 10) : ''}
              onChange={(e) => {
                handleChange(e);
                if (fieldErrors.created_date) setFieldErrors({ ...fieldErrors, created_date: '' });
              }}
              error={!!fieldErrors.created_date}
              helperText={fieldErrors.created_date || ''}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              name="delivery_date"
              label="Delivery Date"
              type="date"
              value={formData.delivery_date ? formData.delivery_date.slice(0, 10) : ''}
              onChange={(e) => {
                handleChange(e);
                if (fieldErrors.delivery_date) setFieldErrors({ ...fieldErrors, delivery_date: '' });
              }}
              error={!!fieldErrors.delivery_date}
              helperText={fieldErrors.delivery_date || ''}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Sent">Sent</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              name="bill_amount"
              label="Bill Amount"
              value={formData.bill_amount}
              onChange={(e) => {
                handleChange(e);
                if (fieldErrors.bill_amount) setFieldErrors({ ...fieldErrors, bill_amount: '' });
              }}
              error={!!fieldErrors.bill_amount}
              helperText={fieldErrors.bill_amount || ''}
              margin="normal"
              type="number"
            />
            <TextField
              fullWidth
              name="payment_terms"
              label="Payment Terms"
              value={formData.payment_terms}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              name="customer_notes"
              label="Customer Notes"
              value={formData.customer_notes}
              onChange={(e) => {
                handleChange(e);
                if (fieldErrors.customer_notes) setFieldErrors({ ...fieldErrors, customer_notes: '' });
              }}
              error={!!fieldErrors.customer_notes}
              helperText={fieldErrors.customer_notes || ''}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              name="freight"
              label="Freight"
              value={formData.freight}
              onChange={(e) => {
                handleChange(e);
                if (fieldErrors.freight) setFieldErrors({ ...fieldErrors, freight: '' });
              }}
              error={!!fieldErrors.freight}
              helperText={fieldErrors.freight || ''}
              margin="normal"
              type="number"
            />
            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
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
    </Box>
  );
}
