import React, { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  InputBase,
  Breadcrumbs,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import axios from "axios";
import UserMenu from './UserMenu';
import BASE_URL from '../config/api';

const NewInvoicePage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerTab, setCustomerTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [status, setStatus] = useState("Draft");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [subject, setSubject] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [freight, setFreight] = useState(0);
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [rows, setRows] = useState([
    { id: Date.now(), item: "", qty: 0, rate: 0, discount: 0, amount: 0, uom_amount: 0, uom_description: "" },
  ]);
  const [customerBillingStateCode, setCustomerBillingStateCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel
        const [customersRes, invoiceNumberRes, productsRes, unitsRes] = await Promise.all([
          axios.get(`${BASE_URL}/customers`, { timeout: 10000 }),
          axios.get(`${BASE_URL}/invoice/next-number`, { timeout: 10000 }),
          axios.get(`${BASE_URL}/products`, { timeout: 10000 }),
          axios.get(`${BASE_URL}/units`, { timeout: 10000 })
        ]);
        
        console.log('Customers response:', customersRes.data);
        console.log('Invoice number response:', invoiceNumberRes.data);
        console.log('Products response:', productsRes.data);
        console.log('Units response:', unitsRes.data);
        
        setCustomers(customersRes.data || []);
        setInvoiceNumber(invoiceNumberRes.data.nextInvoiceNumber || 'INV-001');
        setProducts(productsRes.data || []);
        setUnits(unitsRes.data || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setLoading(false);
        
        let errorMessage = "Failed to load required data. ";
        
        if (error.code === 'ECONNABORTED') {
          errorMessage += "Request timeout. Please check your internet connection.";
        } else if (error.response) {
          const status = error.response.status;
          if (status === 404) {
            errorMessage += "Backend endpoints not found. Please contact support.";
          } else if (status === 500) {
            errorMessage += "Server error. Please try again later.";
          } else {
            errorMessage += `Server error (${status}). Please try again.`;
          }
        } else if (error.request) {
          errorMessage += "Cannot connect to server. Please check if the backend server is running and accessible.";
        } else {
          errorMessage += error.message || "Unknown error occurred.";
        }
        
        setError(errorMessage);
        
        // Set default values to allow user to continue
        setCustomers([]);
        setInvoiceNumber('INV-001');
        setProducts([]);
        setUnits([]);
      }
    };
    
    fetchInitialData();
  }, []);

  const fetchCustomerBillingStateCode = async (customerId) => {
    try {
      const response = await axios.get(`${BASE_URL}/customers/${customerId}`);
      const customer = response.data;
      setCustomerBillingStateCode(customer.billing_state_code || "");
    } catch (error) {
      console.error("Error fetching customer billing state code:", error);
      setCustomerBillingStateCode("");
    }
  };

  const updateRow = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = ["qty", "rate", "discount"].includes(field)
      ? parseFloat(value) || 0
      : value;
    updated[index].amount = calculateAmount(updated[index]);
    setRows(updated);
  };

  const calculateAmount = (row) => {
    const total = (row.qty || 0) * (row.rate || 0);
    return total - (row.discount || 0);
  };

  const addNewRow = () => {
    setRows([
      ...rows,
      { id: Date.now(), item: "", qty: 0, rate: 0, discount: 0, amount: 0, uom_amount: 0, uom_description: "" },
    ]);
  };

  const deleteRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const subtotal = rows.reduce((sum, row) => sum + calculateAmount(row), 0);
  const subtotalWithFreight = subtotal + parseFloat(freight || 0);
  
  // Conditional GST calculation based on customer billing state code
  let cgst = 0, sgst = 0, igst = 0, total = 0;
  
  console.log("NewInvoice - Customer billing state code:", customerBillingStateCode);
  console.log("NewInvoice - Subtotal with freight:", subtotalWithFreight);
  
  if (customerBillingStateCode === '27') {
    // Maharashtra - apply CGST and SGST
    cgst = subtotalWithFreight * 0.09;
    sgst = subtotalWithFreight * 0.09;
    total = subtotalWithFreight + cgst + sgst;
    console.log("NewInvoice - Using CGST/SGST - CGST:", cgst, "SGST:", sgst);
  } else {
    // Other states - apply IGST
    igst = subtotalWithFreight * 0.18;
    total = subtotalWithFreight + igst;
    console.log("NewInvoice - Using IGST:", igst);
  }

  const validate = () => {
    const e = {};
    if (!invoiceNumber || !invoiceNumber.trim()) e.invoiceNumber = "Invoice Number is required";
    
    if (!selectedCustomer) e.selectedCustomer = "Customer is required";
    
    if (!invoiceDate) e.invoiceDate = "Invoice date is required";
    if (!expiryDate) e.expiryDate = "Due date is required";
    else if (new Date(expiryDate) < new Date(invoiceDate)) e.expiryDate = "Due date cannot be before invoice date";

    if (subject && subject.length > 200) e.subject = "Subject cannot exceed 200 characters";
    
    if (freight !== "" && (isNaN(freight) || parseFloat(freight) < 0)) e.freight = "Freight must be a positive number";

    if (customerNotes && customerNotes.length > 500) e.customerNotes = "Notes cannot exceed 500 characters";
    if (termsAndConditions && termsAndConditions.length > 2000) e.termsAndConditions = "Terms cannot exceed 2000 characters";

    if (rows.length === 0) e.items = "At least one item is required";
    else {
      let hasInvalidItem = false;
      rows.forEach((row) => {
        if (!row.item || row.qty <= 0 || row.rate < 0 || row.discount < 0 || row.discount > 100) {
          hasInvalidItem = true;
        }
      });
      if (hasInvalidItem) {
        e.items = "All items must have a selected product, valid qty (>0), rate (>=0), and discount (0-100)";
      }
    }
    return e;
  };

  const handleSubmit = async (saveAsDraft = false) => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError(validationErrors.items || "Please correct the highlighted errors");
      return;
    }
    setFieldErrors({});

    const customerObj = customers.find((c) => c.id === selectedCustomer);

    setLoading(true);
    setError(null);

    const invoiceData = {
      customer_id: selectedCustomer,
      customer_name: customerObj.customer_name,
      invoice_date: invoiceDate,
      expiry_date: expiryDate,
      subject: subject,
      customer_notes: customerNotes,
      terms_and_conditions: termsAndConditions,
      freight: parseFloat(freight || 0),
      status: saveAsDraft ? "Draft" : status,
      sub_total: subtotal,
      cgst: cgst,
      sgst: sgst,
      igst: igst,
      grand_total: total,
      items: rows.map((row) => ({
        item_detail: row.item_name || row.item,
        quantity: row.qty,
        rate: row.rate,
        discount: row.discount,
        amount: calculateAmount(row),
        uom_amount: row.uom_amount || 0,
        uom_description: row.uom_description || "",
      })),
    };

    console.log("Submitting invoice data:", invoiceData);

    try {
      const response = await axios.post(
        `${BASE_URL}/invoice`,
        {
          invoice: invoiceData,
          items: invoiceData.items,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000, // 30 second timeout
        }
      );
      
      console.log("Invoice saved successfully:", response.data);
      setLoading(false);
      navigate("/invoice-list");
    } catch (err) {
      setLoading(false);
      console.error("Error saving invoice:", err);
      
      let errorMessage = "Failed to save invoice. ";
      
      if (err.code === 'ECONNABORTED') {
        errorMessage += "Request timeout. Please check your internet connection.";
      } else if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 400) {
          errorMessage += `Invalid data: ${data.message || 'Please check your input fields.'}`;
        } else if (status === 401) {
          errorMessage += "Authentication failed. Please login again.";
        } else if (status === 403) {
          errorMessage += "Access denied. You don't have permission to create invoices.";
        } else if (status === 404) {
          errorMessage += "Invoice endpoint not found. Please contact support.";
        } else if (status === 500) {
          errorMessage += "Server error. Please try again later or contact support.";
        } else {
          errorMessage += `Server error (${status}): ${data.message || 'Unknown error'}`;
        }
      } else if (err.request) {
        // Network error
        errorMessage += "Cannot connect to server. Please check if the backend server is running and accessible.";
      } else {
        // Other error
        errorMessage += err.message || "Unknown error occurred.";
      }
      
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  return (
    <Box sx={{ display: "flex", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Sidebar />
      <Box sx={{ flex: 1, p: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            mt: 1,
          }}
        >
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Typography color="text.secondary" fontSize="14px">
              Invoice
            </Typography>
            <Typography color="text.primary" fontWeight={600} fontSize="14px">
              New Invoice
            </Typography>
          </Breadcrumbs>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.5,
                py: 0.5,
                borderRadius: "999px",
                border: "1px solid #e0e0e0",
                bgcolor: "#f9fafb",
                width: 240,
              }}
            >
              <SearchIcon sx={{ fontSize: 20, color: "#999" }} />
              <InputBase
                placeholder="Search anything here..."
                sx={{ ml: 1, fontSize: 14, flex: 1 }}
                inputProps={{ "aria-label": "search" }}
              />
            </Paper>
            <IconButton
              sx={{
                borderRadius: "12px",
                border: "1px solid #e0e0e0",
                bgcolor: "#f9fafb",
                p: 1,
              }}
            >
              <NotificationsNoneIcon sx={{ fontSize: 20, color: "#666" }} />
            </IconButton>
            <Box display="flex" alignItems="center" gap={1}>
              <UserMenu />
            </Box>
          </Box>
        </Box>
        
        {/* Loading Overlay */}
        {loading && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <Paper
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <CircularProgress />
              <Typography>Saving invoice...</Typography>
            </Paper>
          </Box>
        )}
        
        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}
        
        <Paper sx={{ p: 1, borderRadius: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#111",
              mb: 2,
              borderBottom: "1px solid #eee",
              pb: 1,
            }}
          >
            New Invoice
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6} md={1}>
              <TextField
                required
                label="Invoice Number"
                placeholder="Enter invoice number (e.g., INV-2025-001)"
                value={invoiceNumber}
                onChange={(e) => {
                  setInvoiceNumber(e.target.value);
                  if (fieldErrors.invoiceNumber) setFieldErrors({ ...fieldErrors, invoiceNumber: '' });
                }}
                error={!!fieldErrors.invoiceNumber}
                helperText={fieldErrors.invoiceNumber || "You can edit this number as per your format"}
                sx={{
                  width: 500,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "22px",
                    bgcolor: "#f9fafb",
                  },
                }}
              />
            </Grid>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth required error={!!fieldErrors.selectedCustomer}>
                  <InputLabel>Customer Name</InputLabel>
                  <Select
                    value={selectedCustomer}
                    onChange={(e) => {
                      setSelectedCustomer(e.target.value);
                      if (fieldErrors.selectedCustomer) setFieldErrors({ ...fieldErrors, selectedCustomer: '' });
                      if (e.target.value) {
                        fetchCustomerBillingStateCode(e.target.value);
                      }
                    }}
                    displayEmpty
                    sx={{
                      bgcolor: "#f9fafb",
                      borderRadius: "12px",
                      width: 300,
                    }}
                  >
                    {customers.length === 0 ? (
                      <MenuItem disabled>No result found</MenuItem>
                    ) : (
                      customers.map((customer) => (
                        <MenuItem key={customer.id} value={customer.id}>
                          {customer.customer_name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {fieldErrors.selectedCustomer && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                      {fieldErrors.selectedCustomer}
                    </Typography>
                  )}
                </FormControl>
                <Box mt={1}>
                  <Button
                    size="small"
                    sx={{ textTransform: "none", color: "#3f51b5" }}
                    onClick={() => setCustomerModalOpen(true)}
                  >
                    + Add New Customer
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  required
                  label="Invoice Date"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => {
                    setInvoiceDate(e.target.value);
                    if (fieldErrors.invoiceDate) setFieldErrors({ ...fieldErrors, invoiceDate: '' });
                  }}
                  error={!!fieldErrors.invoiceDate}
                  helperText={fieldErrors.invoiceDate || ''}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    sx: {
                      bgcolor: "#f9fafb",
                      borderRadius: "12px",
                      width: 300,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth required sx={{ mt: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    sx={{ bgcolor: "#f9fafb", borderRadius: "12px", width: 200 }}
                  >
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Partial">Partial</MenuItem>
                    <MenuItem value="Paid">Paid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  required
                  label="Due Date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => {
                    setExpiryDate(e.target.value);
                    if (fieldErrors.expiryDate) setFieldErrors({ ...fieldErrors, expiryDate: '' });
                  }}
                  error={!!fieldErrors.expiryDate}
                  helperText={fieldErrors.expiryDate || ''}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    sx: {
                      bgcolor: "#f9fafb",
                      borderRadius: "12px",
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
                  placeholder="Write what this invoice is about"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (fieldErrors.subject) setFieldErrors({ ...fieldErrors, subject: '' });
                  }}
                  error={!!fieldErrors.subject}
                  helperText={fieldErrors.subject || ''}
                  InputProps={{
                    sx: {
                      bgcolor: "#f9fafb",
                      borderRadius: "12px",
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
              <Button
                variant="text"
                sx={{ fontWeight: 500, color: "#1976d2" }}
                onClick={addNewRow}
              >
                + ADD NEW ROW
              </Button>
              <Button variant="text" sx={{ fontWeight: 500, color: "#1976d2" }}>
                + ADD ITEMS IN BULK
              </Button>
            </Box>
            <TableContainer component={Paper} sx={{ mt: 3, boxShadow: "none" }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
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
                    <TableRow key={row.id}>
                      <TableCell>
                        <Select
                          fullWidth
                          value={row.item}
                          onChange={(e) => {
                            const selectedProductId = e.target.value;
                            const selectedProduct = products.find(p => p.id === selectedProductId);
                            updateRow(index, "item", selectedProductId);
                            updateRow(index, "item_name", selectedProduct ? selectedProduct.product_name : "");
                            fetch(`${BASE_URL}/products/${selectedProductId}`)
                              .then((res) => res.json())
                              .then((product) => {
                                updateRow(index, "rate", product.sale_price || 0);
                                updateRow(index, "uom_description", product.unit || "");
                              })
                              .catch((err) => {
                                console.error("Error fetching product details:", err);
                              });
                          }}
                          size="small"
                          displayEmpty
                          sx={{ width: "100%" }}
                        >
                          <MenuItem value="">
                            <em>Select Item</em>
                          </MenuItem>
                          {products.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
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
                          onChange={(e) => updateRow(index, "qty", e.target.value)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          fullWidth
                          value={row.uom_description}
                          onChange={(e) => updateRow(index, "uom_description", e.target.value)}
                          size="small"
                          displayEmpty
                        >
                          <MenuItem value="">
                            <em>Select Unit</em>
                          </MenuItem>
                          {units.map((unit) => (
                            <MenuItem key={unit.id} value={unit.unit_name}>
                              {unit.unit_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="number"
                          value={row.rate}
                          onChange={(e) => updateRow(index, "rate", e.target.value)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth>
                          <Select
                            value={row.discount}
                            onChange={(e) => updateRow(index, "discount", e.target.value)}
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
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <TextField
                    multiline
                    rows={1}
                    label="Customer Notes"
                    value={customerNotes}
                    onChange={(e) => {
                      setCustomerNotes(e.target.value);
                      if (fieldErrors.customerNotes) setFieldErrors({ ...fieldErrors, customerNotes: '' });
                    }}
                    error={!!fieldErrors.customerNotes}
                    helperText={fieldErrors.customerNotes || "Will be displayed on the invoice"}
                    sx={{ bgcolor: "#f9fafb", borderRadius: 1, width: 500 }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={4} sx={{ ml: 15 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: "#fafafa",
                    width: "200%",
                  }}
                >
                  {[
                    { label: "Sub Total", value: `₹${subtotal.toFixed(2)}` },
                    { label: "Freight", value: `₹${parseFloat(freight || 0).toFixed(2)}` },
                    ...(customerBillingStateCode === '27' ? [
                      { label: "CGST (9%)", value: `₹${cgst.toFixed(2)}` },
                      { label: "SGST (9%)", value: `₹${sgst.toFixed(2)}` },
                    ] : [
                      { label: "IGST (18%)", value: `₹${igst.toFixed(2)}` },
                    ])
                  ].map((item, i) => (
                    <Box
                      key={i}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography fontSize={14}>{item.label}</Typography>
                      <Typography fontSize={14}>{item.value}</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight="bold" fontSize="1rem">
                      Total (₹)
                    </Typography>
                    <Typography fontWeight="bold" fontSize="1rem">
                      ₹{total.toFixed(2)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
          <Grid container spacing={2} mt={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Freight"
                type="number"
                value={freight}
                onChange={(e) => {
                  setFreight(e.target.value);
                  if (fieldErrors.freight) setFieldErrors({ ...fieldErrors, freight: '' });
                }}
                error={!!fieldErrors.freight}
                helperText={fieldErrors.freight || ''}
                placeholder="Enter freight amount"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Terms & Conditions"
                value={termsAndConditions}
                onChange={(e) => {
                  setTermsAndConditions(e.target.value);
                  if (fieldErrors.termsAndConditions) setFieldErrors({ ...fieldErrors, termsAndConditions: '' });
                }}
                error={!!fieldErrors.termsAndConditions}
                helperText={fieldErrors.termsAndConditions || ''}
              />
              <Box display="flex" alignItems="center" mt={1}>
                <Checkbox />
                <Typography variant="body2">Use this in future for all invoices</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ ml: 60 }}>
              <Typography>Attachment</Typography>
              <Button variant="outlined" startIcon={<CloudUploadIcon />} sx={{ mt: 1 }}>
                Upload File
              </Button>
              <Typography variant="caption" display="block" mt={1}>
                You can upload a maximum of 10 files, 10MB each
              </Typography>
            </Grid>
          </Grid>
          <Box mt={4} display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                startIcon={<VisibilityOutlinedIcon />}
                sx={{ color: "#002D72", textTransform: "none", fontWeight: "bold" }}
                onClick={() => setPreviewOpen(true)}
              >
                Preview Invoice
              </Button>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                color="inherit"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                }}
                onClick={() => navigate("/invoice-list")}
              >
                Cancel
              </Button>
              <Button
                variant="outlined"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  color: "#003366",
                  border: "1px solid #004085",
                }}
                onClick={() => handleSubmit(true)}
              >
                Save as Draft
              </Button>
              <Button
                variant="contained"
                onClick={() => handleSubmit(false)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor: "#004085",
                  "&:hover": { bgcolor: "#003366" },
                }}
              >
                Save & Send
              </Button>
            </Box>
          </Box>
          <Modal open={customerModalOpen} onClose={() => setCustomerModalOpen(false)}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 350,
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 24,
                p: 3,
              }}
            >
              <TextField
                fullWidth
                placeholder="Search customer here..."
                InputProps={{
                  startAdornment: (
                    <SearchIcon />
                  ),
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Box textAlign="center" mt={3}>
                <Typography color="text.secondary">No result found</Typography>
              </Box>
              <Box mt={2} textAlign="center">
                <Button variant="text" size="small">
                  + Add New Customer
                </Button>
              </Box>
            </Box>
          </Modal>
          <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
            <Box
              sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                bgcolor: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1300,
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  width: 480,
                  bgcolor: "#fff",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: 24,
                  px: 3,
                  py: 4,
                  position: "relative",
                }}
              >
                <Box sx={{ position: "absolute", top: 20, right: 20 }}>
                  <img src="https://cdn-icons-png.flaticon.com/512/8372/8372013.png" alt="logo" width={40} />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography fontWeight="bold" fontSize={20}>
                    INVOICE
                  </Typography>
                  <Typography fontSize={12} color="text.secondary">
                    #{invoiceNumber}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Box>
                    <Typography fontSize={12}>Issued</Typography>
                    <Typography fontSize={13} fontWeight={500}>
                      {invoiceDate || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography fontSize={12}>Due</Typography>
                    <Typography fontSize={13} fontWeight={500}>
                      {expiryDate || "N/A"}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                  <Box>
                    <Typography fontSize={12} fontWeight={500}>
                      Bill To
                    </Typography>
                    <Typography fontSize={13}>
                      {customers.find((c) => c.id === selectedCustomer)?.billing_recipient_name || customers.find((c) => c.id === selectedCustomer)?.customer_name || "N/A"}
                    </Typography>
                    <Typography fontSize={13}>
                      {customers.find((c) => c.id === selectedCustomer)?.billing_address1 || ""}{customers.find((c) => c.id === selectedCustomer)?.billing_address2 ? `, ${customers.find((c) => c.id === selectedCustomer)?.billing_address2}` : ""}
                    </Typography>
                    <Typography fontSize={13}>
                      {customers.find((c) => c.id === selectedCustomer)?.billing_city || ""}, {customers.find((c) => c.id === selectedCustomer)?.billing_state || ""} - {customers.find((c) => c.id === selectedCustomer)?.billing_pincode || ""}
                    </Typography>
                    <Typography fontSize={13}>
                      GSTIN: {customers.find((c) => c.id === selectedCustomer)?.gst || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography fontSize={12} fontWeight={500}>
                      From
                    </Typography>
                    <Typography fontSize={13}>Meraki Expert</Typography>
                    <Typography fontSize={13}>Nagpur, Maharashtra - 441104</Typography>
                    <Typography fontSize={13}>IN +91 83028-29003</Typography>
                    <Typography fontSize={13}>GSTIN: 27AKUPY6544R1ZM</Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    fontWeight: 600,
                    fontSize: 13,
                    borderBottom: "1px solid #ddd",
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
                      display: "flex",
                      fontSize: 13,
                      py: 1,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Box width="40%">
                      {products.find((p) => p.id === row.item)?.product_name || row.item || "-"}
                    </Box>
                    <Box width="15%">{row.qty}</Box>
                    <Box width="20%">₹{row.rate.toFixed(2)}</Box>
                    <Box width="25%" textAlign="right">
                      ₹{calculateAmount(row).toFixed(2)}
                    </Box>
                  </Box>
                ))}
                <Box mt={2} mb={2} sx={{ textAlign: "right", fontSize: 13 }}>
                  <Typography>Subtotal: ₹{subtotal.toFixed(2)}</Typography>
                  <Typography>Freight: ₹{parseFloat(freight || 0).toFixed(2)}</Typography>
                  {customerBillingStateCode === '27' ? (
                    <>
                      <Typography>CGST (9%): ₹{cgst.toFixed(2)}</Typography>
                      <Typography>SGST (9%): ₹{sgst.toFixed(2)}</Typography>
                    </>
                  ) : (
                    <Typography>IGST (18%): ₹{igst.toFixed(2)}</Typography>
                  )}
                  <Typography fontWeight="bold" mt={1}>
                    Total: ₹{total.toFixed(2)}
                  </Typography>
                  <Typography color="primary" mt={1} fontWeight="bold">
                    Amount due: ₹{total.toFixed(2)}
                  </Typography>
                </Box>
                <Box mt={3} sx={{ borderTop: "1px solid #eee", pt: 2, fontSize: 12 }}>
                  <Typography>{customerNotes || "Thanks for your business!"}</Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    This is a system generated invoice.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <IconButton
                  onClick={() => setPreviewOpen(false)}
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: "50%",
                    boxShadow: 3,
                    "&:hover": {
                      bgcolor: "#f5f5f5",
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

export default NewInvoicePage;