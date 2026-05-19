import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, Checkbox, FormControlLabel
} from '@mui/material';

export default function EditVendorDialog({ open, onClose, vendor = {}, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (open) {
      setFormData({
        id: vendor.id || '',
        vendor_name: vendor.vendor_name || '',
        company_name: vendor.company_name || '',
        display_name: vendor.display_name || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        pan: vendor.pan || '',
        gst: vendor.gst || '',
        billing_recipient: vendor.billing_recipient || '',
        billing_country: vendor.billing_country || '',
        billing_address1: vendor.billing_address1 || '',
        billing_address2: vendor.billing_address2 || '',
        billing_city: vendor.billing_city || '',
        billing_state: vendor.billing_state || '',
        billing_pincode: vendor.billing_pincode || '',
        billing_fax: vendor.billing_fax || '',
        billing_other_phone: vendor.billing_other_phone || '',
        shipping_recipient: vendor.shipping_recipient || '',
        shipping_country: vendor.shipping_country || '',
        shipping_address1: vendor.shipping_address1 || '',
        shipping_address2: vendor.shipping_address2 || '',
        shipping_city: vendor.shipping_city || '',
        shipping_state: vendor.shipping_state || '',
        shipping_pincode: vendor.shipping_pincode || '',
        shipping_fax: vendor.shipping_fax || '',
        shipping_other_phone: vendor.shipping_other_phone || '',
        account_holder_name: vendor.account_holder_name || '',
        bank_name: vendor.bank_name || '',
        account_number: vendor.account_number || '',
        account_number_confirm: vendor.account_number || '', // For re-enter field
        ifsc: vendor.ifsc || '',
        remark: vendor.remark || ''
      });
    }
  }, [open, vendor]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const copyBillingToShipping = () => {
    setFormData(prev => ({
      ...prev,
      shipping_recipient: prev.billing_recipient || '',
      shipping_country: prev.billing_country || '',
      shipping_address1: prev.billing_address1 || '',
      shipping_address2: prev.billing_address2 || '',
      shipping_city: prev.billing_city || '',
      shipping_state: prev.billing_state || '',
      shipping_pincode: prev.billing_pincode || '',
      shipping_fax: prev.billing_fax || '',
      shipping_other_phone: prev.billing_other_phone || ''
    }));
  };

  const handleSave = () => {
    // Remove account_number_confirm from the payload as it's not needed in the backend
    const { account_number_confirm, ...payload } = formData;
    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Vendor</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={1}>
          {/* Vendor Basic Info */}
          <Grid item xs={12} sm={4}>
            <TextField label="Primary Contact Full Name" name="vendor_name" fullWidth value={formData.vendor_name || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Company Name" name="company_name" fullWidth value={formData.company_name || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Display Name" name="display_name" fullWidth value={formData.display_name || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Email Address" name="email" fullWidth value={formData.email || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Company Phone Number" name="phone" fullWidth value={formData.phone || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="PAN Number" name="pan" fullWidth value={formData.pan || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="GST Number" name="gst" fullWidth value={formData.gst || ''} onChange={handleChange} />
          </Grid>

          {/* Billing Address */}
          <Grid item xs={12}><strong>Billing Address</strong></Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Recipient Name" name="billing_recipient" fullWidth value={formData.billing_recipient || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Country/Region" name="billing_country" fullWidth value={formData.billing_country || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Address 1" name="billing_address1" fullWidth value={formData.billing_address1 || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Address 2" name="billing_address2" fullWidth value={formData.billing_address2 || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="City" name="billing_city" fullWidth value={formData.billing_city || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="State" name="billing_state" fullWidth value={formData.billing_state || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Pin Code" name="billing_pincode" fullWidth value={formData.billing_pincode || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Fax Number" name="billing_fax" fullWidth value={formData.billing_fax || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Other Phone Number" name="billing_other_phone" fullWidth value={formData.billing_other_phone || ''} onChange={handleChange} />
          </Grid>

          {/* Shipping Address */}
          <Grid item xs={12}><strong>Shipping Address</strong></Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={<Checkbox onChange={copyBillingToShipping} />}
              label="Copy Billing Address"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Recipient Name" name="shipping_recipient" fullWidth value={formData.shipping_recipient || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Country/Region" name="shipping_country" fullWidth value={formData.shipping_country || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Address 1" name="shipping_address1" fullWidth value={formData.shipping_address1 || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Address 2" name="shipping_address2" fullWidth value={formData.shipping_address2 || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="City" name="shipping_city" fullWidth value={formData.shipping_city || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="State" name="shipping_state" fullWidth value={formData.shipping_state || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Pin Code" name="shipping_pincode" fullWidth value={formData.shipping_pincode || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Fax Number" name="shipping_fax" fullWidth value={formData.shipping_fax || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Other Phone Number" name="shipping_other_phone" fullWidth value={formData.shipping_other_phone || ''} onChange={handleChange} />
          </Grid>

          {/* Bank Details */}
          <Grid item xs={12}><strong>Bank Details</strong></Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Account Holder Name" name="account_holder_name" fullWidth value={formData.account_holder_name || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Bank Name" name="bank_name" fullWidth value={formData.bank_name || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Account Number" name="account_number" fullWidth value={formData.account_number || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Re-enter Account Number" name="account_number_confirm" fullWidth value={formData.account_number_confirm || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="IFSC" name="ifsc" fullWidth value={formData.ifsc || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Remark" name="remark" fullWidth value={formData.remark || ''} onChange={handleChange} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
