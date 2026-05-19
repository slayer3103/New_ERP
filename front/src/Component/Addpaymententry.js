import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Avatar,
  InputBase,
  Grid,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../config/api';

const currencies = ['INR', 'USD', 'EUR'];
const paymentModes = ['Online', 'Cash', 'Cheque'];

const AddPaymentsEntry = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [currency, setCurrency] = useState('INR');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${BASE_URL}/invoice`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(data);
    } catch (err) {
      setError('Failed to load invoices: ' + err.message);
    }
  };

  const handleInvoiceChange = async (invoiceId) => {
    setSelectedInvoice(invoiceId);
    if (invoiceId) {
      try {
        const response = await fetch(`${BASE_URL}/invoice/${invoiceId}`);
        if (!response.ok) throw new Error('Failed to fetch invoice details');
        const data = await response.json();
        setInvoiceDetails(data);
      } catch (err) {
        setError('Failed to load invoice details: ' + err.message);
      }
    } else {
      setInvoiceDetails(null);
    }
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;
    
    if (!selectedInvoice) {
      tempErrors.selectedInvoice = 'Please select an invoice';
      isValid = false;
    }
    if (!paymentDate) {
      tempErrors.paymentDate = 'Payment date is required';
      isValid = false;
    }
    if (!paymentMode) {
      tempErrors.paymentMode = 'Payment mode is required';
      isValid = false;
    }
    if (!currency) {
      tempErrors.currency = 'Currency is required';
      isValid = false;
    }
    
    if (!amount) {
      tempErrors.amount = 'Amount is required';
      isValid = false;
    } else {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        tempErrors.amount = 'Amount must be greater than 0';
        isValid = false;
      } else if (invoiceDetails) {
        const grandTotal = parseFloat(invoiceDetails.invoice.grand_total);
        if (amountNum > grandTotal) {
          tempErrors.amount = `Amount cannot exceed invoice total of ₹${grandTotal.toFixed(2)}`;
          isValid = false;
        }
      }
    }

    const today = new Date().toISOString().split('T')[0];
    if (paymentDate && paymentDate > today) {
      tempErrors.paymentDate = 'Payment date cannot be in the future';
      isValid = false;
    }

    if (invoiceDetails && paymentDate) {
      const invoiceDate = new Date(invoiceDetails.invoice.invoice_date).toISOString().split('T')[0];
      if (paymentDate < invoiceDate) {
        tempErrors.paymentDate = 'Payment date cannot be before invoice date';
        isValid = false;
      }
      if (invoiceDetails.invoice.status === 'Paid') {
        tempErrors.selectedInvoice = 'This invoice is already fully paid';
        isValid = false;
      }
    }

    setFieldErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      setError('Please resolve the errors highlighted below.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const paymentData = {
        invoice_id: selectedInvoice,
        invoice_number: invoiceDetails.invoice.invoice_number,
        payment_date: paymentDate,
        payment_mode: paymentMode,
        currency: currency,
        amount: parseFloat(amount)
      };

      const response = await fetch(`${BASE_URL}/payment-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save payment entry');
      }

      const result = await response.json();
      setSuccess(`Payment entry saved successfully! Remaining balance: ₹${result.remainingBalance}`);
      
      // Reset form
      setSelectedInvoice('');
      setInvoiceDetails(null);
      setAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMode('Cash');
      setCurrency('INR');
      
    } catch (err) {
      setError('Error saving payment entry: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f5fa', minHeight: '100vh' }}>
  
      <Sidebar />

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      
        <Box
          sx={{
            backgroundColor: '#fff',
            p: 2,
            px: 3,
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Payments Settings
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#f0f0f0',
                px: 2,
                py: 0.5,
                borderRadius: '8px',
              }}
            >
              <SearchIcon fontSize="small" sx={{ mr: 1 }} />
              <InputBase placeholder="Search anything here..." />
            </Box>
            <IconButton>
              <NotificationsNoneIcon />
            </IconButton>
            <Avatar src="/avatar.png" sx={{ width: 32, height: 32 }} />
            <Typography fontSize={14}>Admin name</Typography>
          </Box>
        </Box>

       
        <Box sx={{ p: 3 }}>
          {/* Error and Success Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <Paper elevation={0} sx={{ p: 4, borderRadius: '12px' }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <ArrowBackIosNewIcon fontSize="small" />
              <Typography variant="h6" fontWeight="bold">
                Add Payments Entry
              </Typography>
            </Box>

            {/* Invoice Details Display */}
            {invoiceDetails && (
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Invoice Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Customer:</strong> {invoiceDetails.invoice.customer_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Invoice Date:</strong> {new Date(invoiceDetails.invoice.invoice_date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="success.main">
                      <strong>Total Amount:</strong> ₹{invoiceDetails.invoice.grand_total}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Status:</strong> {invoiceDetails.invoice.status}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            <form onSubmit={handleSubmit}>

            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="Invoice No"
                    value={selectedInvoice}
                    onChange={(e) => {
                      handleInvoiceChange(e.target.value);
                      if (fieldErrors.selectedInvoice) setFieldErrors({ ...fieldErrors, selectedInvoice: '' });
                    }}
                    error={!!fieldErrors.selectedInvoice}
                    helperText={fieldErrors.selectedInvoice}
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
                    <MenuItem value="">
                      <em>Select Invoice</em>
                    </MenuItem>
                    {invoices.map((invoice) => (
                      <MenuItem key={invoice.invoice_id} value={invoice.invoice_id}>
                        {invoice.invoice_number} - {invoice.customer_name} (₹{invoice.grand_total})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    required
                    label="Payment Date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => {
                      setPaymentDate(e.target.value);
                      if (fieldErrors.paymentDate) setFieldErrors({ ...fieldErrors, paymentDate: '' });
                    }}
                    error={!!fieldErrors.paymentDate}
                    helperText={fieldErrors.paymentDate}
                    InputLabelProps={{ shrink: true }}
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
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField 
                    select 
                    fullWidth 
                    required 
                    label="Payment Mode"
                    value={paymentMode}
                    onChange={(e) => {
                      setPaymentMode(e.target.value);
                      if (fieldErrors.paymentMode) setFieldErrors({ ...fieldErrors, paymentMode: '' });
                    }}
                    error={!!fieldErrors.paymentMode}
                    helperText={fieldErrors.paymentMode}
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
                      }}>
                    {paymentModes.map((mode) => (
                      <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              <Grid item xs={12} md={4}>
                  <TextField 
                    select 
                    fullWidth 
                    required 
                    label="Currency Preference"
                    value={currency}
                    onChange={(e) => {
                      setCurrency(e.target.value);
                      if (fieldErrors.currency) setFieldErrors({ ...fieldErrors, currency: '' });
                    }}
                    error={!!fieldErrors.currency}
                    helperText={fieldErrors.currency}
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
                      }}>
                    {currencies.map((curr) => (
                      <MenuItem key={curr} value={curr}>{curr}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField 
                    fullWidth 
                    required 
                    label="Amount" 
                    placeholder="Enter amount"
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (fieldErrors.amount) setFieldErrors({ ...fieldErrors, amount: '' });
                    }}
                    error={!!fieldErrors.amount}
                    helperText={fieldErrors.amount}
                    inputProps={{ min: 0, step: 0.01 }}
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
                  />
                </Grid>

                {/* Remaining Balance Display */}
                {invoiceDetails && amount && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, mt: 2 }}>
                      <Typography variant="body2" color="info.main">
                        <strong>Remaining Balance after this payment:</strong> ₹{Math.max(0, invoiceDetails.invoice.grand_total - parseFloat(amount || 0)).toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                )}
            </Grid>

       
            <Box
              mt={6}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderTop="1px solid #eee"
              pt={2}
            >
              <Typography sx={{ color: '#888' }}>Payment Entry Form</Typography>
              <Box display="flex" gap={2}>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  sx={{ textTransform: 'none' }}
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  sx={{ textTransform: 'none', bgcolor: '#003865' }}
                  disabled={loading || !selectedInvoice || !amount}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? 'Saving...' : 'Save Payment'}
                </Button>
              </Box>
            </Box>
            </form>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AddPaymentsEntry;
