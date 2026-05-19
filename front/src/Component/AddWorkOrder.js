import {
  Box,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  IconButton,
  Paper,
  Checkbox,
  Modal,
  Tabs,
  Tab,
  InputBase,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from 'react';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { Breadcrumbs } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BASE_URL from '../config/api';

const NewWorkOrder = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [vendorTab, setVendorTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const [workOrderNumber, setWorkOrderNumber] = useState('ME-000001');
  const [workOrderDate, setWorkOrderDate] = useState('2025-06-21');
  const [paymentTerms, setPaymentTerms] = useState('Due end of the month');
  const [dueDate, setDueDate] = useState('2025-06-30');
  const [subject, setSubject] = useState('');
  const [vendorNotes, setVendorNotes] = useState('Thanks for your business.');
  const [termsConditions, setTermsConditions] = useState(`* Advance Payment 20%
* 80% payment will be done after 15 Days WCC Report.
* Payment will be done as per work order.
* Payment will be done as per measurement of Installation of Panel in Sq.Mtr.
* Ensure minimum wastage of Materials.
* The quality requirement of the work shall be qualified.
* All the work will be carried out with safety equipment.
* Wearing PPT Kit is compalsatory while working on site.
* Chewing Gutkha, Smoking and Drinking Alcohol is not allowed while working on Site.
* Child Labour is not allowed.
* All the work will be done as per given drawing.
* As per drawing, If any misconduct is observed the contractor shall be penalized.
* All The Machines and Tools should be Ready with Safety Before Reaching on site.
* After completion of installation debries cleaning is mandatory.`);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [status, setStatus] = useState('Draft');
  const [purchaseordernumber, setpurchaseordernumber] = useState('');
  const [purchaseorderdate, setpurchaseorderdate] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);

  const [rows, setRows] = useState([{ item: '', itemName: '', qty: 0, rate: 0, discount: 0, amount: 0, uom_description: '', uom_amount: 0 }]);
  const [subtotal, setSubtotal] = useState(0);
  const [gst, setGst] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch(`${BASE_URL}/vendors`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setVendors(data);
      })
      .catch((error) => {
        console.error('Error fetching vendors:', error);
      });
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/products`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
      });
  }, []);
  
  useEffect(() => {
    fetch(`${BASE_URL}/product_units`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setUnits(data);
      })
      .catch((error) => {
        console.error('Error fetching units:', error);
        setUnits([]);
      });
  }, []);

  const handleAddVendor = () => {
    setVendorModalOpen(true);
  };

  const updateRow = (index, field, value) => {
    const updated = [...rows];
    if (field === 'rate') {
      updated[index][field] = Number(value) || 0;
    } else if (field === 'qty' || field === 'discount') {
      updated[index][field] = parseFloat(value) || 0;
    } else {
      updated[index][field] = value;
    }
    updated[index].amount = calculateAmount(updated[index]);
    setRows(updated);
  };

  const calculateAmount = (row) => {
    const total = (row.qty || 0) * (row.rate || 0);
    return total - (row.discount || 0);
  };

  const addNewRow = () => {
    setRows([...rows, { item: '', qty: 0, rate: 0, discount: 0, amount: 0, uom_description: '', uom_amount: 0 }]);
  };

  const deleteRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  useEffect(() => {
    const newSubtotal = rows.reduce((sum, row) => sum + calculateAmount(row), 0);
    const newGst = newSubtotal * 0.09;
    const newTotal = newSubtotal + newGst * 2;
    setSubtotal(newSubtotal);
    setGst(newGst);
    setTotal(newTotal);
  }, [rows]);

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!workOrderNumber.trim()) {
      tempErrors.workOrderNumber = 'Work Order Number is required';
      isValid = false;
    }
    if (!purchaseorderdate) {
      tempErrors.purchaseorderdate = 'PO Date is required';
      isValid = false;
    }
    if (!selectedVendor) {
      tempErrors.selectedVendor = 'Vendor Name is required';
      isValid = false;
    }
    if (!workOrderDate) {
      tempErrors.workOrderDate = 'Work Order Date is required';
      isValid = false;
    }
    if (!dueDate) {
      tempErrors.dueDate = 'Due Date is required';
      isValid = false;
    } else if (new Date(dueDate) < new Date(workOrderDate)) {
      tempErrors.dueDate = 'Due Date cannot be before Work Order Date';
      isValid = false;
    }
    if (!paymentTerms) {
      tempErrors.paymentTerms = 'Payment Terms are required';
      isValid = false;
    }

    if (purchaseorderdate && new Date(purchaseorderdate) > new Date(workOrderDate)) {
        tempErrors.purchaseorderdate = 'PO Date cannot be after Work Order Date';
        isValid = false;
    }

    if (rows.length === 0) {
      alert("Please add at least one item.");
      isValid = false;
    } else {
      for (let i = 0; i < rows.length; i++) {
        if (!rows[i].item) {
          alert(`Please select an item in row ${i + 1}`);
          isValid = false;
          break;
        }
        if (rows[i].qty <= 0) {
          alert(`Quantity must be greater than 0 in row ${i + 1}`);
          isValid = false;
          break;
        }
        if (rows[i].rate < 0) {
          alert(`Rate cannot be negative in row ${i + 1}`);
          isValid = false;
          break;
        }
      }
    }

    setFieldErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validate()) {
      alert("Please correct the errors in the form before submitting.");
      return;
    }
    
    const workOrderData = {
      work_order_number: workOrderNumber,
      vendor_name: selectedVendor,
      work_order_date: workOrderDate,
      due_date: dueDate,
      payment_terms: paymentTerms,
      subject: subject,
      vendor_notes: vendorNotes,
      terms_and_conditions: termsConditions,
      attachment_url: attachmentUrl,
      sub_total: subtotal,
      cgst: gst,
      sgst: gst,
      grand_total: total,
      status: status,
      purchase_order_number: purchaseordernumber,
      purchase_order_date: purchaseorderdate,
      items: rows.map((row) => ({
        item_detail: row.itemName,
        quantity: row.qty,
        rate: row.rate,
        discount: row.discount,
        amount: calculateAmount(row),
        uom_description: row.uom_description,
        uom_amount: row.uom_amount,
      })),
    };

    fetch(`${BASE_URL}/work-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workOrderData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to save work order');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Work order saved:', data);
        navigate('/Work-Order-list');
      })
      .catch((error) => {
        console.error('Error saving work order:', error);
        alert('Error saving work order');
      });
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flex: 1, p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            mt: 1,
          }}
        >
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Typography color="text.secondary" fontSize="14px">
              Work Order
            </Typography>
            <Typography color="text.primary" fontWeight={600} fontSize="14px">
              New Work Order
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              <Avatar src="https://i.pravatar.cc/40?img=1" />
              <Typography fontSize={14}>Admin name</Typography>
              <ArrowDropDownIcon />
            </Box>
          </Box>
        </Box>
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
            New Work Order
          </Typography>

          
         
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="purchase order number"
                  value={purchaseordernumber}
                  onChange={(e) => setpurchaseordernumber(e.target.value)}
                   sx={{
                  width: 300,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '22px',
                    bgcolor: '#f9fafb',
                  },
                }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  required
                  label="purchase order date"
                  type="date"
                  value={purchaseorderdate}
                  onChange={(e) => {
                    setpurchaseorderdate(e.target.value);
                    if (fieldErrors.purchaseorderdate) setFieldErrors({...fieldErrors, purchaseorderdate: ''});
                  }}
                  error={!!fieldErrors.purchaseorderdate}
                  helperText={fieldErrors.purchaseorderdate}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    sx: {
                      bgcolor: '#f9fafb',
                      borderRadius: '12px',
                      width: 300,
                    },
                  }}
                />
              </Grid>

            <Grid item xs={12} sm={6} md={1}>
              <TextField
                required
                label="Work Order Number"
                value={workOrderNumber}
                onChange={(e) => {
                  setWorkOrderNumber(e.target.value);
                  if (fieldErrors.workOrderNumber) setFieldErrors({...fieldErrors, workOrderNumber: ''});
                }}
                error={!!fieldErrors.workOrderNumber}
                helperText={fieldErrors.workOrderNumber}
                sx={{
                  width: 500,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '22px',
                    bgcolor: '#f9fafb',
                  },
                }}
              />
            </Grid>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth required error={!!fieldErrors.selectedVendor}>
                  <InputLabel>Vendor Name</InputLabel>
                  <Select
                    value={selectedVendor}
                    onChange={(e) => {
                      setSelectedVendor(e.target.value);
                      if (fieldErrors.selectedVendor) setFieldErrors({...fieldErrors, selectedVendor: ''});
                    }}
                    displayEmpty
                    sx={{
                      bgcolor: '#f9fafb',
                      borderRadius: '12px',
                      width: 300,
                    }}
                  >
                    {vendors.length === 0 ? (
                      <MenuItem disabled>No result found</MenuItem>
                    ) : (
                      vendors.map((vendor, index) => (
                        <MenuItem key={index} value={vendor.vendor_name}>
                          {vendor.vendor_name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {fieldErrors.selectedVendor && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {fieldErrors.selectedVendor}
                    </Typography>
                  )}
                </FormControl>
                <Box mt={1}>
                  <Button
                    size="small"
                    sx={{ textTransform: 'none', color: '#3f51b5' }}
                    onClick={handleAddVendor}
                  >
                    + Add New Vendor
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  required
                  label="Work Order Date"
                  type="date"
                  value={workOrderDate}
                  onChange={(e) => {
                    setWorkOrderDate(e.target.value);
                    if (fieldErrors.workOrderDate) setFieldErrors({...fieldErrors, workOrderDate: ''});
                  }}
                  error={!!fieldErrors.workOrderDate}
                  helperText={fieldErrors.workOrderDate}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    sx: {
                      bgcolor: '#f9fafb',
                      borderRadius: '12px',
                      width: 300,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth required error={!!fieldErrors.paymentTerms}>
                  <InputLabel>Payment Terms</InputLabel>
                  <Select
                    label="Payment Terms"
                    value={paymentTerms}
                    onChange={(e) => {
                      setPaymentTerms(e.target.value);
                      if (fieldErrors.paymentTerms) setFieldErrors({...fieldErrors, paymentTerms: ''});
                    }}
                    sx={{
                      bgcolor: '#f9fafb',
                      borderRadius: '12px',
                      width: 200,
                    }}
                  >
                    <MenuItem value="Due end of the month">Due end of the month</MenuItem>
                    <MenuItem value="Net 15">Net 15</MenuItem>
                    <MenuItem value="Net 30">Net 30</MenuItem>
                  </Select>
                  {fieldErrors.paymentTerms && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {fieldErrors.paymentTerms}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  required
                  label="Due Date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    if (fieldErrors.dueDate) setFieldErrors({...fieldErrors, dueDate: ''});
                  }}
                  error={!!fieldErrors.dueDate}
                  helperText={fieldErrors.dueDate}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    sx: {
                      bgcolor: '#f9fafb',
                      borderRadius: '12px',
                      width: 200,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  placeholder="Write what this Work Order is about"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  InputProps={{
                    sx: {
                      bgcolor: '#f9fafb',
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Box mt={5}>
            <Divider />
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              mb={2}
              sx={{ fontWeight: 600, fontSize: 18 }}
            >
              Item Table
            </Typography>
            <Box display="flex" justifyContent="flex-end" mt={1} gap={3}>
              <Button variant="text" sx={{ fontWeight: 500, color: '#1976d2' }} onClick={addNewRow}>
                + ADD NEW ROW
              </Button>
              <Button variant="text" sx={{ fontWeight: 500, color: '#1976d2' }}>
                + ADD ITEMS IN BULK
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 'none' }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Item Details</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>UOM</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Discount</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select
                          fullWidth
                          value={row.item}
                          onChange={(e) => {
                            const selectedProductId = e.target.value;
                            const selectedProduct = products.find(p => p.id === selectedProductId);
                            updateRow(index, 'item', selectedProductId);
                            updateRow(index, 'itemName', selectedProduct ? selectedProduct.product_name : '');
                            // Fetch product details by id and update rate
                            fetch(`${BASE_URL}/products/${selectedProductId}`)
                              .then((res) => res.json())
                              .then((product) => {
                                updateRow(index, 'rate', product.sale_price || 0);
                                updateRow(index, 'uom_description', product.unit || '');
                              })
                              .catch((err) => {
                                console.error('Error fetching product details:', err);
                              });
                          }}
                          size="small"
                          displayEmpty
                          sx={{ width: '100%' }}
                        >
                          <MenuItem value="">
                            <em>Select Item</em>
                          </MenuItem>
                          {products.map((product, idx) => (
                            <MenuItem key={idx} value={product.id}>
                              {product.product_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="number"
                          value={row.qty}
                          onChange={(e) => updateRow(index, 'qty', e.target.value)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={row.uom_description}
                            onChange={(e) => updateRow(index, 'uom_description', e.target.value)}
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>Select Unit</em>
                            </MenuItem>
                            {units.map((unit, idx) => (
                              <MenuItem key={idx} value={unit.unit_name}>
                                {unit.unit_name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="number"
                          value={row.rate}
                          onChange={(e) => updateRow(index, 'rate', e.target.value)}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <FormControl fullWidth>
                          <Select
                            value={row.discount}
                            onChange={(e) => updateRow(index, 'discount', e.target.value)}
                          >
                            <MenuItem value={0}>0%</MenuItem>
                            <MenuItem value={5}>5%</MenuItem>
                            <MenuItem value={10}>10%</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="number"
                          value={calculateAmount(row).toFixed(2)}
                          InputProps={{ readOnly: true }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => deleteRow(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

          <Grid container spacing={2} mt={4}>
            <Grid item xs={12} sm={8}>
              <Paper variant="outlined" sx={{ p: 1 }}>
                <TextField
                  multiline
                  rows={1}
                  label="Vendor Notes"
                  value={vendorNotes}
                  onChange={(e) => setVendorNotes(e.target.value)}
                  helperText="Will be displayed on the Work Order"
                  sx={{ bgcolor: '#f9fafb', borderRadius: 1, width: 500 }}
                />
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2} mt={2} justifyContent="space-between" alignItems="flex-start">
            <Grid item xs={12} sm={12} md={11}>
              <TextField
                  fullWidth
                  label="Terms & Conditions"
                  value={termsConditions}
                  onKeyDown={(e) => {
                    // Add bullet point on Enter key press
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const cursorPosition = e.target.selectionStart;
                      const currentValue = termsConditions;
                      const newValue = currentValue.substring(0, cursorPosition) + '\n* ' + currentValue.substring(cursorPosition);
                      setTermsConditions(newValue);
                      // Set cursor position after the new bullet point
                      setTimeout(() => {
                        e.target.setSelectionRange(cursorPosition + 3, cursorPosition + 3);
                      }, 0);
                    }
                  }}
                  onChange={(e) => {
                    // Ensure bullet points are preserved
                    const lines = e.target.value.split('\n');
                    const preservedLines = lines.map(line => {
                      // If line doesn't start with bullet point, add it
                      if (!line.trim().startsWith('*')) {
                        return '* ' + line.trim();
                      }
                      return line;
                    });
                    setTermsConditions(preservedLines.join('\n'));
                  }}
                multiline
                rows={8}
                helperText="Each line will automatically start with a bullet point (*). Will be displayed on the work order"
              />
              <Box display="flex" alignItems="center" mt={1}>
                <Checkbox />
                <Typography variant="body2">Use this in future for all Work Orders</Typography>
              </Box>
            </Grid>
            <Grid item xs={0} sm={0} md={1} sx={{ display: { xs: 'none', sm: 'none', md: 'block' } }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: '#f0f0f0',
                  width: '100%',
                  boxShadow: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  minHeight: 150,
                  ml: '-40px',
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" mb={1} justifyContent={'right'}>GST Summary
                  
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={0.5} width="100%">
                  <Typography>CGST (9%)</Typography>
                  <Typography>₹{gst.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={0.5} width="100%">
                  <Typography>SGST (9%)</Typography>
                  <Typography>₹{gst.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1, width: '100%' }} />
                <Box display="flex" justifyContent="space-between" mb={0.5} width="100%">
                  <Typography>Total GST (18%)</Typography>
                  <Typography>₹{(gst * 2).toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1, width: '100%' }} />
                <Box display="flex" justifyContent="space-between" fontWeight="bold" width="100%">
                  <Typography>Final Amount</Typography>
                  <Typography>₹{(subtotal + gst * 2).toFixed(2)}</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          </Box>

          <Grid container spacing={2} mt={3}>
            <Grid item xs={12} sm={6}>
              <Typography>Attachment</Typography>
              <Button variant="outlined" startIcon={<CloudUploadIcon />} sx={{ mt: 1 }}>
                Upload File
              </Button>
              <Typography variant="caption" display="block" mt={1}>
                You can upload a maximum of 10 files, 10MB each
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ ml: 90 }}>
              <Box mt={4} display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <Box display="flex" justifyContent="flex-end" mb={2}>
                  <Button
                    startIcon={<VisibilityOutlinedIcon />}
                    sx={{ color: '#002D72', textTransform: 'none', fontWeight: 'bold' }}
                    onClick={() => setPreviewOpen(true)}
                  >
                    Preview Work Order
                  </Button>
                </Box>
                <Box display="flex" gap={2}>
                  <Button variant="outlined" color="inherit" onClick={() => navigate('/Work-Order-list')}>
                    Cancel
                  </Button>
                  <Button variant="outlined" onClick={handleSubmit}>
                    Save as Draft
                  </Button>
                  <Button variant="contained" onClick={handleSubmit}>
                    Save & Send
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Modal open={vendorModalOpen} onClose={() => setVendorModalOpen(false)}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 350,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 3,
              }}
            >
              <TextField
                fullWidth
                placeholder="Search vendor here..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Tabs value={vendorTab} onChange={(e, val) => setVendorTab(val)} centered sx={{ mt: 2 }}>
                <Tab label="Business" />
                <Tab label="Individual" />
              </Tabs>
              <Box textAlign="center" mt={3}>
                <Typography color="text.secondary">No result found</Typography>
              </Box>
              <Box mt={2} textAlign="center">
                <Button variant="text" size="small">
                  + Add New Vendor
                </Button>
              </Box>
            </Box>
          </Modal>

          <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                bgcolor: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1300,
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  width: 480,
                  bgcolor: '#fff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: 24,
                  px: 3,
                  py: 4,
                  position: 'relative',
                }}
              >
                <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
                  <img src="https://cdn-icons-png.flaticon.com/512/8372/8372013.png" alt="logo" width={40} />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography fontWeight="bold" fontSize={20}>
                    Work Order
                  </Typography>
                  <Typography fontSize={12} color="text.secondary">
                    #ME22334-01
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography fontSize={12}>Issued</Typography>
                    <Typography fontSize={13} fontWeight={500}>
                      01 Aug, 2023
                    </Typography>
                  </Box>
                  <Box>
                    <Typography fontSize={12}>Due</Typography>
                    <Typography fontSize={13} fontWeight={500}>
                      10 Aug, 2023
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Box>
                    <Typography fontSize={12} fontWeight={500}>
                      Bill To
                    </Typography>
                    <Typography fontSize={13}>Company Name</Typography>
                    <Typography fontSize={13}>Delhi, India - 000000</Typography>
                    <Typography fontSize={13}>+91 92483-64327</Typography>
                  </Box>
                  <Box>
                    <Typography fontSize={12} fontWeight={500}>
                      From
                    </Typography>
                    <Typography fontSize={13}>Ramesh, Inc</Typography>
                    <Typography fontSize={13}>Dudu, India - 303008</Typography>
                    <Typography fontSize={13}>IN +91 83028-29003</Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    fontWeight: 600,
                    fontSize: 13,
                    borderBottom: '1px solid #ddd',
                    pb: 1,
                  }}
                >
                  <Box width="40%">Service</Box>
                  <Box width="15%">Qty</Box>
                  <Box width="20%">Rate</Box>
                  <Box width="25%" textAlign="right">
                    Line Total
                  </Box>
                </Box>

                {rows.map((row, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      fontSize: 13,
                      py: 1,
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <Box width="40%">{row.item || '-'}</Box>
                    <Box width="15%">{row.qty}</Box>
                    <Box width="20%">₹{row.rate}</Box>
                    <Box width="25%" textAlign="right">
                      ₹{calculateAmount(row).toFixed(2)}
                    </Box>
                  </Box>
                ))}

          <Box mt={2} mb={2} sx={{ textAlign: 'right', fontSize: 13 }}>
            <Typography>Subtotal: ₹{subtotal.toFixed(2)}</Typography>
            <Typography>CGST (9%): ₹{gst.toFixed(2)}</Typography>
            <Typography>SGST (9%): ₹{gst.toFixed(2)}</Typography>
            <Typography fontWeight="bold" mt={1}>
              Total GST (18%): ₹{(gst * 2).toFixed(2)}
            </Typography>
            <Typography fontWeight="bold" mt={1}>
              Total: ₹{total.toFixed(2)}
            </Typography>
            <Typography color="primary" mt={1} fontWeight="bold">
              Amount due: ₹{total.toFixed(2)}
            </Typography>
          </Box>

                <Box mt={3} sx={{ borderTop: '1px solid #eee', pt: 2, fontSize: 12 }}>
                  <Typography>Thanks for your business!</Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    This is a system generated Work Order.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <IconButton
                  onClick={() => setPreviewOpen(false)}
                  sx={{
                    bgcolor: '#fff',
                    borderRadius: '50%',
                    boxShadow: 3,
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          </Modal>
        </Paper>
      </Box>
    </Box>
  );
};

export default NewWorkOrder;
