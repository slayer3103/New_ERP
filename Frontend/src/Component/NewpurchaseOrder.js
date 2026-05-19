import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Select,
  InputLabel,
  FormControl,
  Divider,
  Breadcrumbs,
  InputBase,
  
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Modal,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserMenu from './UserMenu';
import BASE_URL from '../config/api';

const PurchaseOrderForm = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [purchaseOrderNo, setPurchaseOrderNo] = useState("");
  const [purchaseOrderDate, setPurchaseOrderDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Due end of the month");
  const [dueDate, setDueDate] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("• Payment Terms: 100% After Delivery.\n• PO Validity : 4 Month\n• Delivery: 1 to 2 Weeks (Immediate)\n• Document Required: Test Certificate");
  const [freight, setFreight] = useState(0);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [rows, setRows] = useState([
    { id: Date.now(), item: "", qty: 0, rate: 0, discount: 0, amount: 0, uom_amount: 0, uom_description: "" },
  ]);
  const [attachment, setAttachment] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    // Fetch vendors
    axios
      .get(`${BASE_URL}/vendors`)
      .then((res) => setVendors(res.data))
      .catch(() => setVendors([]));

    // Fetch products
    fetch(`${BASE_URL}/products`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
      
    // Fetch units
    axios
      .get(`${BASE_URL}/product_units`)
      .then((res) => setUnits(res.data))
      .catch((error) => {
        console.error("Error fetching units:", error);
        setUnits([]);
      });

    // Fetch purchase order number (assuming a similar endpoint exists)
    axios
      .get(`${BASE_URL}/purchase/next-number`)
      .then((res) => setPurchaseOrderNo(res.data.nextPurchaseOrderNo || ""))
      .catch(() => setPurchaseOrderNo(""));
  }, []);

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
    if (updated.length === 0) {
      updated.push({
        id: Date.now(),
        item: "",
        qty: 0,
        rate: 0,
        discount: 0,
        amount: 0,
        uom_amount: 0,
        uom_description: "",
      });
    }
    setRows(updated);
  };

  const subtotal = rows.reduce((sum, row) => sum + calculateAmount(row), 0);
  const subtotalWithFreight = subtotal + (parseFloat(freight) || 0);
  const gst = subtotalWithFreight * 0.09;
  const total = subtotalWithFreight + gst * 2;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit");
      return;
    }
    setAttachment(file);
  };

  const validate = () => {
    const e = {};
    if (!purchaseOrderNo || !purchaseOrderNo.trim()) e.purchaseOrderNo = "Purchase Order No is required";
    
    if (!selectedVendor) e.selectedVendor = "Vendor is required";
    
    if (!purchaseOrderDate) e.purchaseOrderDate = "Purchase order date is required";
    
    if (!deliveryDate) e.deliveryDate = "Delivery date is required";
    else if (new Date(deliveryDate) < new Date(purchaseOrderDate)) e.deliveryDate = "Delivery date cannot be before PO date";
    
    if (!dueDate) e.dueDate = "Due date is required";
    else if (new Date(dueDate) < new Date(purchaseOrderDate)) e.dueDate = "Due date cannot be before PO date";

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

  const handleSaveAndSend = async (saveAsDraft = false) => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      if (validationErrors.items) {
        alert(validationErrors.items);
      } else {
        alert("Please correct the highlighted errors");
      }
      return;
    }
    setFieldErrors({});

    const vendorObj = vendors.find((v) => v.vendor_name === selectedVendor);
    console.log('Creating purchase order with vendor:', vendorObj);
    
    const payload = {
      purchase_order_no: purchaseOrderNo,
      delivery_to: "organization",
      delivery_address: `Laxmi Enterprises,\nNagpur, Maharashtra, 200145`,
      vendor_name: vendorObj ? vendorObj.vendor_name : selectedVendor,
      vendor_id: vendorObj ? vendorObj.vendor_id : null,
      purchase_order_date: purchaseOrderDate,
      delivery_date: deliveryDate,
      payment_terms: paymentTerms,
      due_date: dueDate,
      customer_notes: customerNotes,
      terms_and_conditions: termsAndConditions,
      freight: parseFloat(freight) || 0,
      sub_total: subtotal,
      cgst: gst,
      sgst: gst,
      total: total,
      attachment: attachment ? attachment.name : "",
      items: rows.map((row) => ({
        item_name: row.item,
        qty: row.qty,
        rate: row.rate,
        discount: row.discount,
        amount: calculateAmount(row),
        uom_amount: row.uom_amount || 0,
        uom_description: row.uom_description || "",
      })),
    };

    try {
      await axios.post(`${BASE_URL}/purchase`, payload);
      navigate("/purchase-order-list");
    } catch (error) {
      console.error('Purchase order creation error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
      alert(`Failed to create purchase order: ${errorMessage}`);
    }
  };

  const vendorObj = vendors.find((v) => v.vendor_name === selectedVendor);

  return (
    <Box
      sx={{ display: "flex", backgroundColor: "#f9f9f9", minHeight: "100vh" }}
    >
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column" minHeight="100vh">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            mt: 1,
            px: 3,
          }}
        >
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            <Typography color="text.secondary" fontSize="14px">
              Purchase Order
            </Typography>
            <Typography color="text.primary" fontWeight={600} fontSize="14px">
              New Purchase Order
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
              <NotificationsNoneIcon />
              <UserMenu />
            </Box>
          </Box>
        </Box>
        <Box p={3}>
          <Paper sx={{ p: 1, borderRadius: 2 }}>
            <Typography fontWeight="bold" fontSize={18} mb={2}>
              New Purchase Order
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Purchase Order*"
                  value={purchaseOrderNo}
                  onChange={(e) => {
                    setPurchaseOrderNo(e.target.value);
                    if (fieldErrors.purchaseOrderNo) setFieldErrors({ ...fieldErrors, purchaseOrderNo: '' });
                  }}
                  error={!!fieldErrors.purchaseOrderNo}
                  helperText={fieldErrors.purchaseOrderNo || ''}
                  sx={{
                    width: 500,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "22px",
                      bgcolor: "#f9fafb",
                      height: 40,
                    },
                  }}
                />
              </Grid>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography fontWeight="bold" fontSize={13}>
                    Delivery Address*
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    defaultValue={`Laxmi Enterprises,\nNagpur, Maharashtra, 200145`}
                  />
                  <Button size="small" sx={{ textTransform: "none", mt: 1 }}>
                    ✏️ Edit Details
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4} sx={{ mx: 1, my: 1 }}>
                  <FormControl
                    sx={{
                      width: 200, // Increased width for better appearance
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "22px",
                        bgcolor: "#f9fafb",
                        height: 40,
                      },
                    }}
                    required
                    error={!!fieldErrors.selectedVendor}
                  >
                    <InputLabel>Vendor Name</InputLabel>
                    <Select
                      value={selectedVendor}
                      onChange={(e) => {
                        setSelectedVendor(e.target.value);
                        if (fieldErrors.selectedVendor) setFieldErrors({ ...fieldErrors, selectedVendor: '' });
                      }}
                      displayEmpty
                    >
                      <MenuItem value=""></MenuItem>
                      {vendors.length === 0 ? (
                        <MenuItem disabled>No result found</MenuItem>
                      ) : (
                        vendors.map((vendor) => (
                          <MenuItem
                            key={vendor.vendor_id}
                            value={vendor.vendor_name}
                          >
                            {vendor.vendor_name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {fieldErrors.selectedVendor && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                        {fieldErrors.selectedVendor}
                      </Typography>
                    )}
                  </FormControl>
                  <Box mt={1}>
                    <Button
                      size="small"
                      sx={{ textTransform: "none", color: "#3f51b5" }}
                      onClick={() => setVendorModalOpen(true)}
                    >
                      + Add New Vendor
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Purchase Order Date*"
                    type="date"
                    value={purchaseOrderDate}
                    onChange={(e) => {
                      setPurchaseOrderDate(e.target.value);
                      if (fieldErrors.purchaseOrderDate) setFieldErrors({ ...fieldErrors, purchaseOrderDate: '' });
                    }}
                    error={!!fieldErrors.purchaseOrderDate}
                    helperText={fieldErrors.purchaseOrderDate || ''}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      width: 150,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "22px",
                        bgcolor: "#f9fafb",
                        height: 40,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Delivery Date*"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => {
                      setDeliveryDate(e.target.value);
                      if (fieldErrors.deliveryDate) setFieldErrors({ ...fieldErrors, deliveryDate: '' });
                    }}
                    error={!!fieldErrors.deliveryDate}
                    helperText={fieldErrors.deliveryDate || ''}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      width: 150,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "22px",
                        bgcolor: "#f9fafb",
                        height: 40,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl
                    fullWidth
                    sx={{
                      width: 150,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "22px",
                        bgcolor: "#f9fafb",
                        height: 40,
                      },
                    }}
                  >
                    <InputLabel>Payment Terms</InputLabel>
                    <Select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                    >
                      <MenuItem value="Due end of the month">
                        Due end of the month
                      </MenuItem>
                      <MenuItem value="Due on receipt">Due on receipt</MenuItem>
                      <MenuItem value="Net 15">Net 15</MenuItem>
                      <MenuItem value="Net 30">Net 30</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Due Date*"
                    type="date"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      if (fieldErrors.dueDate) setFieldErrors({ ...fieldErrors, dueDate: '' });
                    }}
                    error={!!fieldErrors.dueDate}
                    helperText={fieldErrors.dueDate || ''}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      width: 150,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "22px",
                        bgcolor: "#f9fafb",
                        height: 40,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Box mt={3}>
              <Divider />
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                mb={1}
                sx={{ fontWeight: 600, fontSize: 18 }}
              >
                Item Table
              </Typography>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="text"
                  sx={{ fontWeight: 500, color: "#1976d2" }}
                  onClick={addNewRow}
                >
                  + ADD NEW ROW
                </Button>
                <Button
                  variant="text"
                  sx={{ fontWeight: 500, color: "#1976d2" }}
                >
                  + ADD ITEMS IN BULK
                </Button>
              </Box>
              <TableContainer
                component={Paper}
                sx={{ mt: 3, boxShadow: "none" }}
              >
                <Table size="small">
                  <TableHead sx={{ backgroundColor: "#f9fafb" }}>
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
                              const selectedProductName = e.target.value;
                              const selectedProduct = products.find(p => p.product_name === selectedProductName);
                              updateRow(index, "item", selectedProductName);
                              if (selectedProduct) {
                                fetch(
                                  `${BASE_URL}/products/${selectedProduct.id}`
                                )
                                  .then((res) => res.json())
                                  .then((product) => {
                                    updateRow(
                                      index,
                                      "rate",
                                      product.sale_price || 0
                                    );
                                    updateRow(
                                      index,
                                      "uom_description",
                                      product.unit || ""
                                    );
                                  })
                                  .catch((err) => {
                                    console.error(
                                      "Error fetching product details:",
                                      err
                                    );
                                  });
                              }
                            }}
                            size="small"
                            displayEmpty
                            sx={{ width: "100%" }}
                          >
                            <MenuItem value="">
                              <em>Select Item</em>
                            </MenuItem>
                            {products.map((product) => (
                              <MenuItem key={product.id} 
                                   value={product.product_name}>
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
                            onChange={(e) =>
                              updateRow(index, "qty", e.target.value)
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            fullWidth
                            value={row.uom_description || ""}
                            onChange={(e) =>
                              updateRow(index, "uom_description", e.target.value)
                            }
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
                            onChange={(e) =>
                              updateRow(index, "rate", e.target.value)
                            }
                            size="small"
                          />
                        </TableCell>

                        <TableCell>
                          <FormControl fullWidth>
                            <Select
                              value={row.discount}
                              onChange={(e) =>
                                updateRow(index, "discount", e.target.value)
                              }
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
                          <IconButton
                            onClick={() => deleteRow(index)}
                            color="error"
                          >
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
                  rows={4}
                  label="Vendor Notes"
                  value={customerNotes}
                  onChange={(e) => {
                    setCustomerNotes(e.target.value);
                    if (fieldErrors.customerNotes) setFieldErrors({ ...fieldErrors, customerNotes: '' });
                  }}
                  error={!!fieldErrors.customerNotes}
                  helperText={fieldErrors.customerNotes || "Will be displayed on the purchase order"}
                  sx={{ bgcolor: "#f9fafb", borderRadius: 1, width: 500 }}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ ml: 20 }}>
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
                      { label: "Freight", value: `₹${(parseFloat(freight) || 0).toFixed(2)}` },
                      { label: "CGST (9%)", value: `₹${gst.toFixed(2)}` },
                      { label: "SGST (9%)", value: `₹${gst.toFixed(2)}` },
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
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
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
                  multiline
                  rows={4}
                  label="Terms & Conditions"
                  value={termsAndConditions}
                  onKeyDown={(e) => {
                    // Add bullet point on Enter key press
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const cursorPosition = e.target.selectionStart;
                      const currentValue = termsAndConditions;
                      const newValue = currentValue.substring(0, cursorPosition) + '\n• ' + currentValue.substring(cursorPosition);
                      setTermsAndConditions(newValue);
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
                      if (!line.trim().startsWith('•') && !line.trim().startsWith('*')) {
                        return '• ' + line.trim();
                      }
                      return line;
                    });
                    setTermsAndConditions(preservedLines.join('\n'));
                    if (fieldErrors.termsAndConditions) setFieldErrors({ ...fieldErrors, termsAndConditions: '' });
                  }}
                  error={!!fieldErrors.termsAndConditions}
                  helperText={fieldErrors.termsAndConditions || "Will be displayed on the purchase order"}
                />
                <Box display="flex" alignItems="center" mt={1}>
                  <Checkbox />
                  <Typography variant="body2">
                    Use this in future for all purchase orders
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ ml: 60 }}>
                <Typography>Attachment</Typography>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 1 }}
                  component="label"
                >
                  Upload File
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>
                <Typography variant="caption" display="block" mt={1}>
                  You can upload a maximum of 10 files, 10MB each
                </Typography>
                {attachment && (
                  <Typography variant="body2" mt={1}>
                    Attached: {attachment.name}
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Box
              mt={4}
              display="flex"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={2}
            >
              <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button
                  startIcon={<VisibilityOutlinedIcon />}
                  sx={{
                    color: "#002D72",
                    textTransform: "none",
                    fontWeight: "bold",
                  }}
                  onClick={() => setPreviewOpen(true)}
                >
                  Preview Purchase Order
                </Button>
              </Box>
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  color="inherit"
                  sx={{ textTransform: "none", borderRadius: 2 }}
                  onClick={() => navigate("/purchase-order-list")}
                >
                  Cancel
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    px: 4,
                    color: "#003366",
                    border: "1px solid #004085",
                  }}
                  onClick={() => handleSaveAndSend(true)}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    px: 4,
                    bgcolor: "#004085",
                    "&:hover": { bgcolor: "#003366" },
                  }}
                  onClick={() => handleSaveAndSend(false)}
                >
                  Save & Send
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
        <Modal open={vendorModalOpen} onClose={() => setVendorModalOpen(false)}>
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              bgcolor: "rgba(0,0,0,0.2)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Paper sx={{ p: 4, minWidth: 300 }}>
              <Typography variant="h6">Add New Vendor (Coming Soon)</Typography>
              <Button onClick={() => setVendorModalOpen(false)} sx={{ mt: 2 }}>
                Close
              </Button>
            </Paper>
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
                <img
                  src="https://cdn-icons-png.flaticon.com/512/8372/8372013.png"
                  alt="logo"
                  width={40}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography fontWeight="bold" fontSize={20}>
                  PURCHASE ORDER
                </Typography>
                <Typography fontSize={12} color="text.secondary">
                  {purchaseOrderNo ? `#${purchaseOrderNo}` : "-"}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Box>
                  <Typography fontSize={12}>Order Date</Typography>
                  <Typography fontSize={13} fontWeight={500}>
                    {purchaseOrderDate || "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography fontSize={12}>Delivery Date</Typography>
                  <Typography fontSize={13} fontWeight={500}>
                    {deliveryDate || "-"}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
              >
                <Box>
                  <Typography fontSize={12} fontWeight={500}>
                    Vendor
                  </Typography>
                  <Typography fontSize={13}>
                    {vendorObj ? vendorObj.vendor_name : selectedVendor || "-"}
                  </Typography>
                  {vendorObj && (
                    <>
                      <Typography fontSize={13}>
                        {vendorObj.company_name || "-"}
                      </Typography>
                      <Typography fontSize={13}>
                        {vendorObj.billing_address1 || ""}{" "}
                        {vendorObj.billing_city || ""}
                      </Typography>
                      <Typography fontSize={13}>
                        {vendorObj.phone || "-"}
                      </Typography>
                    </>
                  )}
                </Box>
                <Box>
                  <Typography fontSize={12} fontWeight={500}>
                    Payment Terms
                  </Typography>
                  <Typography fontSize={13}>{paymentTerms || "-"}</Typography>
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
                <Box width="40%">Item</Box>
                <Box width="15%">Qty</Box>
                <Box width="20%">Rate</Box>
                <Box width="25%" textAlign="right">
                  Line Total
                </Box>
              </Box>
              {rows.map((row, i) => (
                <Box
                  key={row.id}
                  sx={{
                    display: "flex",
                    fontSize: 13,
                    py: 1,
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <Box width="40%">
                    {products.find((p) => p.id === row.item)?.product_name ||
                      row.item ||
                      "-"}
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
                <Typography>Freight: ₹{(parseFloat(freight) || 0).toFixed(2)}</Typography>
                <Typography>CGST (9%): ₹{gst.toFixed(2)}</Typography>
                <Typography>SGST (9%): ₹{gst.toFixed(2)}</Typography>
                <Typography fontWeight="bold" mt={1}>
                  Total: ₹{total.toFixed(2)}
                </Typography>
              </Box>
              <Box
                mt={3}
                sx={{ borderTop: "1px solid #eee", pt: 2, fontSize: 12 }}
              >
                <Typography>
                  {customerNotes || "Thanks for your business!"}
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  This is a system generated purchase order.
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
      </Box>
    </Box>
  );
};

export default PurchaseOrderForm;
