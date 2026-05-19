import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, TextField, Button, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider } from "@mui/material";


import MoreVertIcon from "@mui/icons-material/MoreVert";
import Sidebar from "./Sidebar";
import AddIcon from "@mui/icons-material/Add";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import jsPDF from "jspdf";
import axios from 'axios';
import UserMenu from './UserMenu';
import BASE_URL from '../config/api';

export default function EditQuotationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    quotation_id: '',
    customer_name: '',
    quotation_date: '',
    expiry_date: '',
    status: 'Draft',
    grand_total: '',
    subject: '',
    customer_notes: '',
    terms_and_conditions: '',
    freight: 0,
    attachment_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchQuotation = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${BASE_URL}/quotation/${id}`);
        const q = res.data.quotation;
        
        // Format dates properly for input fields
        const formatDate = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };
        
        setFormData({
          quotation_id: q.quotation_id || '',
          customer_name: q.customer_name || '',
          quotation_date: formatDate(q.quotation_date),
          expiry_date: formatDate(q.expiry_date),
          status: q.status || 'Draft',
          grand_total: res.data.grand_total || q.grand_total || '',
          subject: q.subject || '',
          customer_notes: q.customer_notes || '',
          terms_and_conditions: q.terms_and_conditions || 
            "Delivery Period    : 3 to 4 weeks from the date of technically and\n" +
            "                     commercially clear order.\n" +
            "Installation Period: 2 to 3 weeks\n" +
            "Transportation     : Extra at Actual\n" +
            "Payment Terms      : Supply/Installation Terms\n" +
            "                     a) 30% Advance along with Purchase order\n" +
            "                     b) 65% Against proforma invoice prior to dispatch\n" +
            "                     c) 5% after successfull Installation and commissioning\n" +
            "Warranty           : Offer a standard warranty of 15 months from date of dispatch or 12 months from date of\n" +
            "                     satisfactory installation whichever is earlier\n" +
            "Validity           : Our Offer shall remain valid for 15 days\n" +
            "Exclusions         : Civil work, MS work, Loading / Unloading at site, Power supply, Adequate lighting\n" +
            "                     arrangement for installation activities, Scrap folding, Scissor lift.",
          freight: q.freight || 0,
          attachment_url: q.attachment_url || ''
        });
        
        // Set items from API response
        setItems(res.data.items || []);
      } catch (err) {
        console.error('Error fetching quotation:', err);
        setError('Failed to fetch quotation: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [id]);

  useEffect(() => {
    axios.get(`${BASE_URL}/customers`)
      .then(res => setCustomers(res.data))
      .catch(() => setCustomers([]));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic validation
    if (!formData.customer_name) {
      setError('Please select a customer');
      setLoading(false);
      return;
    }
    
    if (!formData.quotation_date) {
      setError('Please select quotation date');
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.put(`${BASE_URL}/quotation/${id}`, {
        quotation: {
          customer_name: formData.customer_name,
          quotation_date: formData.quotation_date,
          expiry_date: formData.expiry_date,
          status: formData.status,
          subject: formData.subject || '',
          customer_notes: formData.customer_notes || '',
          terms_and_conditions: formData.terms_and_conditions || '',
          freight: parseFloat(formData.freight) || 0,
          attachment_url: formData.attachment_url || ''
        },
        items: [] // For now, we'll handle basic quotation info only
      });
      
      console.log('Update response:', response.data);
      alert('Quotation updated successfully!');
      navigate('/quotation-list');
    } catch (err) {
      console.error('Error updating quotation:', err);
      setError('Failed to update quotation: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          p: 2, 
          borderBottom: "1px solid #e0e0e0" 
        }}>
          <Typography variant="h6" fontWeight={600}>
            Edit Quotation
          </Typography>
          <UserMenu />
        </Box>

        {/* Main Content */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, p: 2 }}>
          <Paper sx={{ width: 800, p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={600} mb={3} textAlign="center">
            Edit Quotation
          </Typography>
          {error && (
            <Typography color="error" mb={2} textAlign="center">
              {error}
            </Typography>
          )}
          {loading && (
            <Typography color="primary" mb={2} textAlign="center">
              Loading...
            </Typography>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              name="quotation_id"
              label="Quotation #"
              value={formData.quotation_id}
              onChange={handleChange}
              margin="normal"
              disabled
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Customer</InputLabel>
              <Select
                name="customer_name"
                value={formData.customer_name || ''}
                label="Customer"
                onChange={handleChange}
              >
                {customers.map(customer => (
                  <MenuItem key={customer.customer_id} value={customer.customer_name}>
                    {customer.customer_name}
                  </MenuItem>
                ))}
                {formData.customer_name && !customers.some(c => c.customer_name === formData.customer_name) && (
                  <MenuItem value={formData.customer_name}>{formData.customer_name}</MenuItem>
                )}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              name="quotation_date"
              label="Created Date"
              type="date"
              value={formData.quotation_date}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
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
            />
            <TextField
              fullWidth
              name="subject"
              label="Subject"
              value={formData.subject}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              name="customer_notes"
              label="Customer Notes"
              value={formData.customer_notes}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              name="freight"
              label="Freight"
              type="number"
              value={formData.freight}
              onChange={handleChange}
              margin="normal"
            />
            
            {/* Items Table */}
            <Box mt={3}>
              <Divider />
              <Typography variant="h6" fontWeight={600} mb={2} mt={2}>
                Items/Products
              </Typography>
              
              {items.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell><strong>Item Details</strong></TableCell>
                        <TableCell><strong>Quantity</strong></TableCell>
                        <TableCell><strong>UOM</strong></TableCell>
                        <TableCell><strong>Rate</strong></TableCell>
                        <TableCell><strong>Discount</strong></TableCell>
                        <TableCell><strong>Amount</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.item_detail || 'N/A'}</TableCell>
                          <TableCell>{item.quantity || 0}</TableCell>
                          <TableCell>{item.uom_description || 'N/A'}</TableCell>
                          <TableCell>₹{parseFloat(item.rate || 0).toFixed(2)}</TableCell>
                          <TableCell>₹{parseFloat(item.discount || 0).toFixed(2)}</TableCell>
                          <TableCell>₹{parseFloat(item.amount || 0).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary" sx={{ mt: 2, p: 2, textAlign: 'center', bgcolor: '#f9f9f9', borderRadius: 1 }}>
                  No items found for this quotation
                </Typography>
              )}
            </Box>
            
            <TextField
              fullWidth
              name="terms_and_conditions"
              label="Terms & Conditions"
              value={formData.terms_and_conditions}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={8}
              variant="outlined"
              sx={{
                minHeight: 250,
                bgcolor: "#f9fafb",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  fontSize: 15,
                  fontFamily: "monospace",
                  lineHeight: 1.4,
                  padding: "12px",
                },
              }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value="Sent">Sent</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
              </Select>
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
              <Button variant="contained" type="submit">
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
