import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  InputBase,
  Paper,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';

import Sidebar from './Sidebar';
import BASE_URL from '../config/api';

const PaymentsSettings = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Fetch payment entries from API
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/payment-entries`);
      setPayments(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to fetch payment entries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  // Handle menu open
  const handleMenuOpen = (event, payment) => {
    setAnchorEl(event.currentTarget);
    setSelectedPayment(payment);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPayment(null);
  };

  // Update payment status
  const updatePaymentStatus = async (newStatus) => {
    if (!selectedPayment) return;
    
    try {
      setUpdating(true);
      
      // Calculate new remaining balance based on status
      let newRemainingBalance;
      if (newStatus === 'Completed') {
        newRemainingBalance = 0;
      } else {
        // For pending, set remaining balance to invoice total minus current payment
        newRemainingBalance = selectedPayment.invoice_total - selectedPayment.amount;
      }
      
      await axios.put(`${BASE_URL}/payment-entries/${selectedPayment.payment_id}`, {
        payment_date: selectedPayment.payment_date,
        payment_mode: selectedPayment.payment_mode,
        currency: selectedPayment.currency,
        amount: selectedPayment.amount,
        remaining_balance: newRemainingBalance
      });
      
      // Refresh the payments list
      await fetchPayments();
      setError('');
    } catch (err) {
      console.error('Error updating payment status:', err);
      setError('Failed to update payment status. Please try again.');
    } finally {
      setUpdating(false);
      handleMenuClose();
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Determine status based on remaining balance
    const status = payment.remaining_balance <= 0 ? 'Completed' : 'Pending';
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && status === filter;
  });

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f5fa', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ 
          backgroundColor: '#fff', 
          p: 2, 
          borderRadius: '12px',
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h5" fontWeight="600">
            Payments Settings
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton>
              <NotificationsNoneIcon />
            </IconButton>
            <Avatar sx={{ width: 35, height: 35 }} />
          </Box>
        </Box>

        {/* Main Content */}
        <Paper sx={{ p: 3, borderRadius: '12px' }}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {/* Top Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight="600">
              Payments List
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/Add-Payment-settings')}
              sx={{
                bgcolor: '#003865',
                '&:hover': { bgcolor: '#002548' },
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              Add New Payment
            </Button>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'contained' : 'outlined'}
              sx={{
                bgcolor: filter === 'all' ? '#003865' : 'transparent',
                color: filter === 'all' ? '#fff' : '#003865',
                '&:hover': { bgcolor: filter === 'all' ? '#002548' : '#f0f0f0' },
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              All
            </Button>
            <Button
              onClick={() => setFilter('Completed')}
              variant={filter === 'Completed' ? 'contained' : 'outlined'}
              sx={{
                bgcolor: filter === 'Completed' ? '#003865' : 'transparent',
                color: filter === 'Completed' ? '#fff' : '#003865',
                '&:hover': { bgcolor: filter === 'Completed' ? '#002548' : '#f0f0f0' },
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              Completed
            </Button>
            <Button
              onClick={() => setFilter('Pending')}
              variant={filter === 'Pending' ? 'contained' : 'outlined'}
              sx={{
                bgcolor: filter === 'Pending' ? '#003865' : 'transparent',
                color: filter === 'Pending' ? '#fff' : '#003865',
                '&:hover': { bgcolor: filter === 'Pending' ? '#002548' : '#f0f0f0' },
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              Pending
            </Button>
          </Box>

          {/* Search */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#f5f5f5',
                px: 2,
                py: 1,
                borderRadius: '8px',
                width: '300px'
              }}
            >
              <SearchIcon sx={{ color: '#666', mr: 1 }} />
              <InputBase
                placeholder="Search payments..."
                value={searchTerm}
                onChange={handleSearch}
                fullWidth
              />
            </Box>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f9fafb' }}>Customer Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f9fafb' }}>Invoice Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f9fafb' }}>Payment Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f9fafb' }}>Amount Received</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f9fafb' }}>Pending Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f9fafb' }}>Payment Mode</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f9fafb' }}>Payment Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f9fafb' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f9fafb' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={40} />
                      <Typography variant="body2" sx={{ mt: 2 }}>Loading payment entries...</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {payments.length === 0 ? 'No payment entries found.' : 'No payments match your search criteria.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => {
                    const status = payment.remaining_balance <= 0 ? 'Completed' : 'Pending';
                    return (
                      <TableRow key={payment.payment_id} hover>
                        <TableCell>{payment.customer_name}</TableCell>
                        <TableCell>{payment.invoice_number}</TableCell>
                        <TableCell>{`PAY-${payment.payment_id.toString().padStart(4, '0')}`}</TableCell>
                        <TableCell>₹{parseFloat(payment.amount).toLocaleString()}</TableCell>
                        <TableCell>₹{parseFloat(payment.remaining_balance).toLocaleString()}</TableCell>
                        <TableCell>{payment.payment_mode}</TableCell>
                        <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={status}
                            size="small"
                            sx={{
                              bgcolor: status === 'Completed' ? '#e6f4ea' : '#feeaea',
                              color: status === 'Completed' ? '#0b8f3c' : '#d32f2f',
                              fontWeight: 500,
                              borderRadius: '6px',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleMenuOpen(e, payment)}
                            disabled={updating}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Action Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem 
              onClick={() => updatePaymentStatus('Completed')}
              disabled={updating || (selectedPayment && selectedPayment.remaining_balance <= 0)}
            >
              Mark as Complete
            </MenuItem>
            <MenuItem 
              onClick={() => updatePaymentStatus('Pending')}
              disabled={updating || (selectedPayment && selectedPayment.remaining_balance > 0)}
            >
              Mark as Pending
            </MenuItem>
          </Menu>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Pagination
              count={Math.ceil(filteredPayments.length / 10)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#003865',
                },
                '& .Mui-selected': {
                  bgcolor: '#003865 !important',
                  color: '#fff !important',
                },
              }}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default PaymentsSettings;

