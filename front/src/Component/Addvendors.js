import React from 'react';
import {
  Box, Grid, Typography, TextField, FormControlLabel,
  Checkbox, Button, Select, MenuItem, InputLabel, FormControl, Avatar, InputBase, Breadcrumbs, Paper, IconButton
} from '@mui/material';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import axios from 'axios';
import { useState } from 'react';
import UserMenu from './UserMenu';
import BASE_URL from '../config/api';

export default function NewVendorForm() {
  const navigate = useNavigate();
  const [vendorName, setVendorName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  const [billingRecipient, setBillingRecipient] = useState('');
  const [billingCountry, setBillingCountry] = useState('');
  const [billingAddress1, setBillingAddress1] = useState('');
  const [billingAddress2, setBillingAddress2] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingPinCode, setBillingPinCode] = useState('');
  const [billingFax, setBillingFax] = useState('');
  const [billingOtherPhone, setBillingOtherPhone] = useState('');

  const [shippingRecipient, setShippingRecipient] = useState('');
  const [shippingCountry, setShippingCountry] = useState('');
  const [shippingAddress1, setShippingAddress1] = useState('');
  const [shippingAddress2, setShippingAddress2] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingPinCode, setShippingPinCode] = useState('');
  const [shippingFax, setShippingFax] = useState('');
  const [shippingOtherPhone, setShippingOtherPhone] = useState('');

  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [remark, setRemark] = useState('');

  // Add this state (baki sab same)
const [copyBilling, setCopyBilling] = useState(false);
const [fieldErrors, setFieldErrors] = useState({});

// Add this function (kisi bhi jagah, handleSave ke upar)
const handleCopyBilling = (checked) => {
  setCopyBilling(checked);
  if (checked) {
    setShippingRecipient(billingRecipient);
    setShippingCountry(billingCountry);
    setShippingAddress1(billingAddress1);
    setShippingAddress2(billingAddress2);
    setShippingCity(billingCity);
    setShippingState(billingState);
    setShippingPinCode(billingPinCode);
    setShippingFax(billingFax);
    setShippingOtherPhone(billingOtherPhone);
  }
};

  const API_URL = `${BASE_URL}/vendors`;

  const validate = () => {
    const e = {};
    if (!vendorName || !vendorName.trim()) e.vendorName = "Primary Contact Name is required";
    if (!companyName || !companyName.trim()) e.companyName = "Company Name is required";
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email address";
    if (companyPhone && companyPhone.length < 10) e.companyPhone = "Phone number must be at least 10 digits";

    if (panNumber && !panFormat(panNumber)) e.panNumber = "Invalid PAN Number format";
    if (gstNumber && !gstFormat(gstNumber)) e.gstNumber = "Invalid GST Number format";

    if (!billingRecipient || !billingRecipient.trim()) e.billingRecipient = "Billing recipient is required";
    if (!billingCountry) e.billingCountry = "Billing country is required";
    if (!billingAddress1 || !billingAddress1.trim()) e.billingAddress1 = "Billing Address 1 is required";
    if (!billingCity || !billingCity.trim()) e.billingCity = "Billing City is required";
    if (!billingState || !billingState.trim()) e.billingState = "Billing State is required";
    if (!billingPinCode || !billingPinCode.trim()) e.billingPinCode = "Billing Pincode is required";

    if (!shippingRecipient || !shippingRecipient.trim()) e.shippingRecipient = "Shipping recipient is required";
    if (!shippingCountry) e.shippingCountry = "Shipping country is required";
    if (!shippingAddress1 || !shippingAddress1.trim()) e.shippingAddress1 = "Shipping Address 1 is required";
    if (!shippingCity || !shippingCity.trim()) e.shippingCity = "Shipping City is required";
    if (!shippingState || !shippingState.trim()) e.shippingState = "Shipping State is required";
    if (!shippingPinCode || !shippingPinCode.trim()) e.shippingPinCode = "Shipping Pincode is required";
    
    return e;
  };

  const handleSave = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      alert("Please fix the highlighted errors");
      return;
    }
    setFieldErrors({});

    const vendorData = {
      vendor_name: vendorName,
      company_name: companyName,
      display_name: displayName,
      email: email,
      phone: companyPhone,
      pan: panNumber,
      gst: gstNumber,
      billing_recipient: billingRecipient,
      billing_country: billingCountry,
      billing_address1: billingAddress1,
      billing_address2: billingAddress2,
      billing_city: billingCity,
      billing_state: billingState,
      billing_pincode: billingPinCode,
      billing_fax: billingFax,
      billing_other_phone: billingOtherPhone,
      shipping_recipient: shippingRecipient,
      shipping_country: shippingCountry,
      shipping_address1: shippingAddress1,
      shipping_address2: shippingAddress2,
      shipping_city: shippingCity,
      shipping_state: shippingState,
      shipping_pincode: shippingPinCode,
      shipping_fax: shippingFax,
      shipping_other_phone: shippingOtherPhone,
      account_holder_name: accountHolderName,
      bank_name: bankName,
      account_number: accountNumber,
      ifsc: ifscCode,
      remark: remark
    };

    try {
      const response = await axios.post(API_URL, vendorData);
      if (response.status === 201) {
        alert("Vendor added successfully!");
        navigate('/vendor-list');
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add vendor: " + (error.response?.data?.message || error.message));
    }
  };

  // Validation Helpers
  const onlyText = (value) => /^[A-Za-z\s]*$/.test(value);
  const onlyNumbers = (value) => /^\d*$/.test(value);
  const panFormat = (value) => /^[A-Z]{0,5}[0-9]{0,4}[A-Z]{0,1}$/.test(value.toUpperCase()) && value.length <= 10;
  const gstFormat = (value) => /^[0-9A-Z]{0,15}$/.test(value.toUpperCase());
  const emailChars = (value) => /^[\w.@+-]*$/.test(value);
  const ifscFormat = (value) => /^[A-Z]{0,4}0?[A-Z0-9]{0,6}$/.test(value.toUpperCase()) && value.length <= 11;
  const pinCodeFormat = (value) => /^\d{0,6}$/.test(value);

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flex: 1, bgcolor: '#f9fafc', minHeight: '100vh' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            mt: 1,
            px: 3
          }}
        >
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Typography color="text.secondary" fontSize="14px">
              Vendor
            </Typography>
            <Typography color="text.primary" fontWeight={600} fontSize="14px">
              Add
            </Typography>
          </Breadcrumbs>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 1.5,
                py: 0.5,
                borderRadius: '999px',
                border: '1px solid #e0e0e0',
                bgcolor: '#f9fafb',
                width: 240,
              }}
            >
              <SearchIcon sx={{ fontSize: 20, color: '#999' }} />
              <InputBase
                placeholder="Search anything here..."
                sx={{ ml: 1, fontSize: 14, flex: 1 }}
                inputProps={{ 'aria-label': 'search' }}
              />
            </Paper>
            <IconButton
              sx={{
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                bgcolor: '#f9fafb',
                p: 1,
              }}
            >
              <NotificationsNoneIcon sx={{ fontSize: 20, color: '#666' }} />
            </IconButton>
            <Box display="flex" alignItems="center" gap={1}>
              <NotificationsNoneIcon />
              <UserMenu />
            </Box>
          </Box>
        </Box>

        <Box sx={{ px: 2, py: 2 }}>
          <Paper sx={{ p: 1, borderRadius: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#111',
                mb: 2,
                borderBottom: '1px solid #eee',
                pb: 1,
              }}
            >
              Vendors
            </Typography>

            <Grid container spacing={2}>
              {/* Primary Contact Full Name - Text Only */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  sx={{
                    width: { xs: '100%', sm: '100%', md: 330 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: '#f9fafb',
                      height: 40,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: '10px',
                    },
                    '& input': {
                      fontSize: '14px',
                      padding: '10px 14px',
                    },
                  }}
                  fullWidth
                  required
                  label="Primary Contact Full Name"
                  value={vendorName}
                  onChange={(e) => {
                    if (onlyText(e.target.value)) setVendorName(e.target.value);
                    if (fieldErrors.vendorName) setFieldErrors({...fieldErrors, vendorName: ''});
                  }}
                  error={!!fieldErrors.vendorName}
                  helperText={fieldErrors.vendorName || ''}
                />
              </Grid>

              {/* Company Name - Text + Number Allowed (No Change) */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  sx={{
                    width: { xs: '100%', sm: '100%', md: 330 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: '#f9fafb',
                      height: 40,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: '10px',
                    },
                    '& input': {
                      fontSize: '14px',
                      padding: '10px 14px',
                    },
                  }}
                  fullWidth
                  required
                  label="Company Name"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    if (fieldErrors.companyName) setFieldErrors({...fieldErrors, companyName: ''});
                  }}
                  error={!!fieldErrors.companyName}
                  helperText={fieldErrors.companyName || ''}
                />
              </Grid>

              {/* Designation - Text Only */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  sx={{
                    width: { xs: '100%', sm: '100%', md: 330 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: '#f9fafb',
                      height: 40,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: '10px',
                    },
                    '& input': {
                      fontSize: '14px',
                      padding: '10px 14px',
                    },
                  }}
                  fullWidth
                  label="Designation"
                  value={displayName}
                  onChange={(e) => {
                    if (onlyText(e.target.value)) setDisplayName(e.target.value);
                  }}
                />
              </Grid>

              {/* Email - Valid Chars Only */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  sx={{
                    width: { xs: '100%', sm: '100%', md: 330 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: '#f9fafb',
                      height: 40,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: '10px',
                    },
                    '& input': {
                      fontSize: '14px',
                      padding: '10px 14px',
                    },
                  }}
                  fullWidth
                  label="Email Address"
                  value={email}
                  onChange={(e) => {
                    if (emailChars(e.target.value)) setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({...fieldErrors, email: ''});
                  }}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email || ''}
                />
              </Grid>

              {/* Company Phone - Numbers Only */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  sx={{
                    width: { xs: '100%', sm: '100%', md: 330 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: '#f9fafb',
                      height: 40,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: '10px',
                    },
                    '& input': {
                      fontSize: '14px',
                      padding: '10px 14px',
                    },
                  }}
                  fullWidth
                  label="Company Phone Number"
                  value={companyPhone}
                  onChange={(e) => {
                    if (onlyNumbers(e.target.value)) setCompanyPhone(e.target.value);
                    if (fieldErrors.companyPhone) setFieldErrors({...fieldErrors, companyPhone: ''});
                  }}
                  error={!!fieldErrors.companyPhone}
                  helperText={fieldErrors.companyPhone || ''}
                />
              </Grid>

              {/* PAN - Format: ABCDE1234F */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  sx={{
                    width: { xs: '100%', sm: '100%', md: 330 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: '#f9fafb',
                      height: 40,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: '10px',
                    },
                    '& input': {
                      fontSize: '14px',
                      padding: '10px 14px',
                    },
                  }}
                  fullWidth
                  label="PAN Number"
                  value={panNumber}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    if (panFormat(val)) setPanNumber(val);
                    if (fieldErrors.panNumber) setFieldErrors({...fieldErrors, panNumber: ''});
                  }}
                  error={!!fieldErrors.panNumber}
                  helperText={fieldErrors.panNumber || ''}
                />
              </Grid>

              {/* GST - 15 Alphanumeric */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  sx={{
                    width: { xs: '100%', sm: '100%', md: 330 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: '#f9fafb',
                      height: 40,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: '10px',
                    },
                    '& input': {
                      fontSize: '14px',
                      padding: '10px 14px',
                    },
                  }}
                  fullWidth
                  label="GST Number"
                  value={gstNumber}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    if (gstFormat(val)) setGstNumber(val);
                    if (fieldErrors.gstNumber) setFieldErrors({...fieldErrors, gstNumber: ''});
                  }}
                  error={!!fieldErrors.gstNumber}
                  helperText={fieldErrors.gstNumber || ''}
                />
              </Grid>
            </Grid>

            <Box mt={5}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Address Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography fontWeight="medium" mb={1}>
                    Billing Address
                  </Typography>
                  <Grid container spacing={2}>
                    {/* Recipient Name - Text Only */}
                    <Grid item xs={12}>
                      <TextField
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                        fullWidth
                        required
                        label="Recipient Name"
                        value={billingRecipient}
                        onChange={(e) => {
                          if (onlyText(e.target.value)) setBillingRecipient(e.target.value);
                          if (fieldErrors.billingRecipient) setFieldErrors({...fieldErrors, billingRecipient: ''});
                        }}
                        error={!!fieldErrors.billingRecipient}
                        helperText={fieldErrors.billingRecipient || ''}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl
                        fullWidth
                        required
                        error={!!fieldErrors.billingCountry}
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                      >
                        <InputLabel>Country/Region</InputLabel>
                        <Select
                          label="Country/Region"
                          value={billingCountry}
                          onChange={(e) => {
                            setBillingCountry(e.target.value);
                            if (fieldErrors.billingCountry) setFieldErrors({...fieldErrors, billingCountry: ''});
                          }}
                        >
                          <MenuItem value="India">India</MenuItem>
                          <MenuItem value="USA">USA</MenuItem>
                        </Select>
                        {fieldErrors.billingCountry && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                            {fieldErrors.billingCountry}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>

                    {/* Address 1 & 2 - Text + Number Allowed */}
                    <Grid item xs={12}>
                      <TextField
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                        fullWidth
                        required
                        label="Address 1"
                        value={billingAddress1}
                        onChange={(e) => {
                          setBillingAddress1(e.target.value);
                          if (fieldErrors.billingAddress1) setFieldErrors({...fieldErrors, billingAddress1: ''});
                        }}
                        error={!!fieldErrors.billingAddress1}
                        helperText={fieldErrors.billingAddress1 || ''}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                        fullWidth
                        label="Address 2"
                        value={billingAddress2}
                        onChange={(e) => setBillingAddress2(e.target.value)}
                      />
                    </Grid>

                    {/* City - Text Only */}
                    <Grid item xs={6}>
                      <TextField
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                        fullWidth
                        required
                        label="City"
                        value={billingCity}
                        onChange={(e) => {
                          if (onlyText(e.target.value)) setBillingCity(e.target.value);
                          if (fieldErrors.billingCity) setFieldErrors({...fieldErrors, billingCity: ''});
                        }}
                        error={!!fieldErrors.billingCity}
                        helperText={fieldErrors.billingCity || ''}
                      />
                    </Grid>

                    {/* State - Text Only */}
                    <Grid item xs={6}>
                      <TextField
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                        fullWidth
                        required
                        label="State"
                        value={billingState}
                        onChange={(e) => {
                          if (onlyText(e.target.value)) setBillingState(e.target.value);
                          if (fieldErrors.billingState) setFieldErrors({...fieldErrors, billingState: ''});
                        }}
                        error={!!fieldErrors.billingState}
                        helperText={fieldErrors.billingState || ''}
                      />
                    </Grid>

                    {/* Pin Code - 6 Digits */}
                    <Grid item xs={6}>
                      <TextField
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                        fullWidth
                        required
                        label="Pin Code"
                        value={billingPinCode}
                        onChange={(e) => {
                          if (pinCodeFormat(e.target.value)) setBillingPinCode(e.target.value);
                          if (fieldErrors.billingPinCode) setFieldErrors({...fieldErrors, billingPinCode: ''});
                        }}
                        error={!!fieldErrors.billingPinCode}
                        helperText={fieldErrors.billingPinCode || ''}
                      />
                    </Grid>

                    {/* Fax - Numbers Only */}
                    <Grid item xs={6}>
                      <TextField
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                        fullWidth
                        label="Fax Number"
                        value={billingFax}
                        onChange={(e) => {
                          if (onlyNumbers(e.target.value)) setBillingFax(e.target.value);
                        }}
                      />
                    </Grid>

                    {/* Other Phone - Numbers Only */}
                    <Grid item xs={12}>
                      <TextField
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                        fullWidth
                        label="Other Phone Number"
                        value={billingOtherPhone}
                        onChange={(e) => {
                          if (onlyNumbers(e.target.value)) setBillingOtherPhone(e.target.value);
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* SHIPPING ADDRESS - Same Validation */}
                <Grid item xs={12} md={6}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight="medium" mb={1}>
                      Shipping Address
                    </Typography>
                    <FormControlLabel
                       control={
                               <Checkbox
                                 checked={copyBilling}
                                  onChange={(e) => handleCopyBilling(e.target.checked)}
                                  />
                                  }
                                  label="Copy Billing Address"
                     />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                        fullWidth
                        required
                        label="Recipient Name"
                        value={shippingRecipient}
                        onChange={(e) => {
                          if (onlyText(e.target.value)) setShippingRecipient(e.target.value);
                          if (fieldErrors.shippingRecipient) setFieldErrors({...fieldErrors, shippingRecipient: ''});
                        }}
                        error={!!fieldErrors.shippingRecipient}
                        helperText={fieldErrors.shippingRecipient || ''}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl
                        fullWidth
                        required
                        error={!!fieldErrors.shippingCountry}
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                      >
                        <InputLabel>Country/Region</InputLabel>
                        <Select
                          label="Country/Region"
                          value={shippingCountry}
                          onChange={(e) => {
                            setShippingCountry(e.target.value);
                            if (fieldErrors.shippingCountry) setFieldErrors({...fieldErrors, shippingCountry: ''});
                          }}
                        >
                          <MenuItem value="India">India</MenuItem>
                          <MenuItem value="USA">USA</MenuItem>
                        </Select>
                        {fieldErrors.shippingCountry && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                            {fieldErrors.shippingCountry}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                        fullWidth
                        required
                        label="Address 1"
                        value={shippingAddress1}
                        onChange={(e) => {
                          setShippingAddress1(e.target.value);
                          if (fieldErrors.shippingAddress1) setFieldErrors({...fieldErrors, shippingAddress1: ''});
                        }}
                        error={!!fieldErrors.shippingAddress1}
                        helperText={fieldErrors.shippingAddress1 || ''}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                        fullWidth
                        label="Address 2"
                        value={shippingAddress2}
                        onChange={(e) => setShippingAddress2(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                        fullWidth
                        required
                        label="City"
                        value={shippingCity}
                        onChange={(e) => {
                          if (onlyText(e.target.value)) setShippingCity(e.target.value);
                          if (fieldErrors.shippingCity) setFieldErrors({...fieldErrors, shippingCity: ''});
                        }}
                        error={!!fieldErrors.shippingCity}
                        helperText={fieldErrors.shippingCity || ''}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                        fullWidth
                        required
                        label="State"
                        value={shippingState}
                        onChange={(e) => {
                          if (onlyText(e.target.value)) setShippingState(e.target.value);
                          if (fieldErrors.shippingState) setFieldErrors({...fieldErrors, shippingState: ''});
                        }}
                        error={!!fieldErrors.shippingState}
                        helperText={fieldErrors.shippingState || ''}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                        fullWidth
                        required
                        label="Pin Code"
                        value={shippingPinCode}
                        onChange={(e) => {
                          if (pinCodeFormat(e.target.value)) setShippingPinCode(e.target.value);
                          if (fieldErrors.shippingPinCode) setFieldErrors({...fieldErrors, shippingPinCode: ''});
                        }}
                        error={!!fieldErrors.shippingPinCode}
                        helperText={fieldErrors.shippingPinCode || ''}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                        fullWidth
                        label="Fax Number"
                        value={shippingFax}
                        onChange={(e) => {
                          if (onlyNumbers(e.target.value)) setShippingFax(e.target.value);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        sx={{
                          width: { xs: '100%', sm: '100%', md: 330 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: '#f9fafb',
                            height: 40,
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '10px',
                          },
                          '& input': {
                            fontSize: '14px',
                            padding: '10px 14px',
                          },
                        }}
                        fullWidth
                        label="Other Phone Number"
                        value={shippingOtherPhone}
                        onChange={(e) => {
                          if (onlyNumbers(e.target.value)) setShippingOtherPhone(e.target.value);
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>

            <Box mt={5}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Bank Details
              </Typography>
              <Grid container spacing={2}>
                {/* Account Holder Name - Text Only */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    sx={{
                      width: { xs: '100%', sm: '100%', md: 330 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        backgroundColor: '#f9fafb',
                        height: 40,
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderRadius: '10px',
                      },
                      '& input': {
                        fontSize: '14px',
                        padding: '10px 14px',
                      },
                    }}
                    fullWidth
                    required
                    label="Account Holder Name"
                    value={accountHolderName}
                    onChange={(e) => {
                      if (onlyText(e.target.value)) setAccountHolderName(e.target.value);
                      if (fieldErrors.accountHolderName) setFieldErrors({...fieldErrors, accountHolderName: ''});
                    }}
                    error={!!fieldErrors.accountHolderName}
                    helperText={fieldErrors.accountHolderName || ''}
                  />
                </Grid>

                {/* Bank Name - Text + Number Allowed */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    sx={{
                      width: { xs: '100%', sm: '100%', md: 330 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        backgroundColor: '#f9fafb',
                        height: 40,
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderRadius: '10px',
                      },
                      '& input': {
                        fontSize: '14px',
                        padding: '10px 14px',
                      },
                    }}
                    fullWidth
                    required
                    label="Bank Name"
                    value={bankName}
                    onChange={(e) => {
                      setBankName(e.target.value);
                      if (fieldErrors.bankName) setFieldErrors({...fieldErrors, bankName: ''});
                    }}
                    error={!!fieldErrors.bankName}
                    helperText={fieldErrors.bankName || ''}
                  />
                </Grid>

                {/* Account Number - Numbers Only */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    sx={{
                      width: { xs: '100%', sm: '100%', md: 330 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        backgroundColor: '#f9fafb',
                        height: 40,
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderRadius: '10px',
                      },
                      '& input': {
                        fontSize: '14px',
                        padding: '10px 14px',
                      },
                    }}
                    fullWidth
                    required
                    label="Account Number"
                    value={accountNumber}
                    onChange={(e) => {
                      if (onlyNumbers(e.target.value)) setAccountNumber(e.target.value);
                      if (fieldErrors.accountNumber) setFieldErrors({...fieldErrors, accountNumber: ''});
                    }}
                    error={!!fieldErrors.accountNumber}
                    helperText={fieldErrors.accountNumber || ''}
                  />
                </Grid>

                {/* Re-enter Account Number - Not stored, just UI */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    sx={{
                      width: { xs: '100%', sm: '100%', md: 330 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        backgroundColor: '#f9fafb',
                        height: 40,
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderRadius: '10px',
                      },
                      '& input': {
                        fontSize: '14px',
                        padding: '10px 14px',
                      },
                    }}
                    fullWidth
                    label="Re-enter Account Number"
                  />
                </Grid>

                {/* IFSC - Format: ABCD0E12345 */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    sx={{
                      width: { xs: '100%', sm: '100%', md: 330 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        backgroundColor: '#f9fafb',
                        height: 40,
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderRadius: '10px',
                      },
                      '& input': {
                        fontSize: '14px',
                        padding: '10px 14px',
                      },
                    }}
                    fullWidth
                    required
                    label="IFSC"
                    value={ifscCode}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      if (ifscFormat(val)) setIfscCode(val);
                      if (fieldErrors.ifscCode) setFieldErrors({...fieldErrors, ifscCode: ''});
                    }}
                    error={!!fieldErrors.ifscCode}
                    helperText={fieldErrors.ifscCode || ''}
                  />
                </Grid>

                {/* Remark - Text + Number Allowed */}
                <Grid item xs={12} md={9}>
                  <TextField
                    sx={{
                      width: { xs: '100%', sm: '100%', md: 330 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        backgroundColor: '#f9fafb',
                        height: 40,
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderRadius: '10px',
                      },
                      '& input': {
                        fontSize: '14px',
                        padding: '10px 14px',
                      },
                    }}
                    fullWidth
                    label="Remark"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="outlined">Cancel</Button>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Add
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}