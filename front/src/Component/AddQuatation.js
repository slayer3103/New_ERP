import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Paper,
  Divider,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Sidebar from "./Sidebar";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useNavigate } from "react-router-dom";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import axios from "axios";
import UserMenu from './UserMenu';
import BASE_URL from '../config/api';

export default function NewQuotation() {
  const [quoteDate, setQuoteDate] = useState("2025-08-21");
  const [expiryDate, setExpiryDate] = useState("2025-09-21");
  const [customerName, setCustomerName] = useState("");
  const [subject, setSubject] = useState("");
  const [freight, setFreight] = useState(0);
  const [customerNotes, setCustomerNotes] = useState(
    "Thanks for your business."
  );
  const [termsAndConditions, setTermsAndConditions] = useState(
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
    "                     arrangement for installation activities, Scrap folding, Scissor lift."
  );

  const [attachment, setAttachment] = useState(null);
  const [rows, setRows] = useState([
    {
      id: Date.now(),
      itemId: "",
      item: "",
      qty: 0,
      uom : "",
      rate: 0,
      
      discount: 0,
      amount: 0,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [quoteNumber, setQuoteNumber] = useState("");
  const [customerBillingStateCode, setCustomerBillingStateCode] = useState("");
  const [units, setUnits] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/product_units`)
      .then((res) => setUnits(res.data))
      .catch((error) => {
        console.error("Error fetching units:", error);
        setUnits([]);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/customers`)
      .then((res) => setCustomers(res.data))
      .catch(() => setCustomers([]));
  }, []);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/quotation/next-number`)
      .then((res) => setQuoteNumber(res.data.nextQuoteNumber))
      .catch(() => setQuoteNumber(""));
  }, []);

  // Fetch customer billing state code when customer is selected
  const fetchCustomerBillingStateCode = async (customerName) => {
    if (!customerName) {
      setCustomerBillingStateCode("");
      return;
    }
    
    try {
      const response = await axios.get(`${BASE_URL}/customers`);
      const customer = response.data.find(c => c.customer_name === customerName);
      if (customer) {
        console.log("Found customer:", customer);
        console.log("Billing state code:", customer.billing_state_code);
        setCustomerBillingStateCode(customer.billing_state_code || "");
      } else {
        console.log("Customer not found:", customerName);
        setCustomerBillingStateCode("");
      }
    } catch (error) {
      console.error("Error fetching customer billing state code:", error);
      setCustomerBillingStateCode("");
    }
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        id: Date.now(),
        itemId: "",
        item: "",
        qty: 0,
        uom : "",
        rate: 0,
        discount: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const updateRow = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = ["qty", "rate", "discount"].includes(field)
      ? Number(value)
      : value;
    updated[index].amount = calculateAmount(updated[index]);
    setRows(updated);
  };

  const calculateAmount = (row) => {
    const amount = row.qty * row.rate - row.discount;
    return isNaN(amount) ? 0 : amount;
  };

  const subtotal = rows.reduce((sum, row) => sum + calculateAmount(row), 0);
  const subtotalWithFreight = subtotal + (parseFloat(freight) || 0);
  
  // Conditional GST calculation based on customer billing state code
  let cgst = 0, sgst = 0, igst = 0;
  
  console.log("Customer billing state code:", customerBillingStateCode);
  console.log("Subtotal with freight:", subtotalWithFreight);
  
  if (customerBillingStateCode === '27') {
    // Maharashtra - use CGST/SGST
    cgst = subtotalWithFreight * 0.09;
    sgst = subtotalWithFreight * 0.09;
    igst = 0;
    console.log("Using CGST/SGST - CGST:", cgst, "SGST:", sgst);
  } else {
    // Other states - use IGST
    cgst = 0;
    sgst = 0;
    igst = subtotalWithFreight * 0.18;
    console.log("Using IGST:", igst);
  }
  
  const total = subtotalWithFreight + cgst + sgst + igst;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return;
    }
    setAttachment(file);
  };

  const validate = () => {
    const e = {};
    if (!customerName) e.customerName = "Customer name is required";
    if (!quoteDate) e.quoteDate = "Quote date is required";
    if (!expiryDate) e.expiryDate = "Expiry date is required";
    else if (new Date(expiryDate) < new Date(quoteDate)) e.expiryDate = "Expiry date cannot be before quote date";

    if (subject && subject.length > 200) e.subject = "Subject cannot exceed 200 characters";
    
    if (freight !== "" && (isNaN(freight) || parseFloat(freight) < 0)) e.freight = "Freight must be a positive number";

    if (customerNotes && customerNotes.length > 500) e.customerNotes = "Notes cannot exceed 500 characters";
    if (termsAndConditions && termsAndConditions.length > 2000) e.termsAndConditions = "Terms cannot exceed 2000 characters";

    if (rows.length === 0) e.items = "At least one item is required";
    else {
      let hasInvalidItem = false;
      rows.forEach((row) => {
        if (!row.itemId || row.qty <= 0 || row.rate < 0 || row.discount < 0 || row.discount > 100) {
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
    setLoading(true);
    setError("");
    setSuccess("");

    const quotationData = {
      customer_name: customerName,
      quotation_date: quoteDate,
      expiry_date: expiryDate,
      subject,
      customer_notes: customerNotes,
      terms_and_conditions: termsAndConditions,
      freight: parseFloat(freight) || 0,
      sub_total: subtotal,
      cgst: cgst,
      sgst: sgst,
      igst: igst,
      total_amount: total,
      status: saveAsDraft ? "Draft" : "Sent",
      items: rows.map((row) => ({
        item_detail: row.item,
        quantity: row.qty,
        rate: row.rate,
        discount: row.discount,
        amount: calculateAmount(row),
        uom_amount: 0,
        uom_description: row.uom || "",
      })),
    };

    console.log("Sending to backend:", {
      quotation: quotationData,
      items: rows,
    });

    try {
      const response = await axios.post(
        `${BASE_URL}/quotation`,
        {
          quotation: quotationData,
          // Send items in the shape the backend expects (item_detail, quantity, rate, discount, amount)
          items: quotationData.items,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setQuoteNumber(response.data.quoteNumber || "");
      setSuccess(
        "Quotation saved successfully" +
          (response.data.quoteNumber
            ? ` (Quote#: ${response.data.quoteNumber})`
            : "")
      );
      // Navigate to quotation list for both Save as Draft and Save as Send
      navigate("/quotation-list");
    } catch (err) {
      setError(
        err.response?.data?.error?.sqlMessage ||
          err.response?.data?.error ||
          "Failed to save quotation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flex: 1, bgcolor: "#f9fafc", minHeight: "100vh" }}>
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
              Quotation
            </Typography>
            <Typography variant="h6" fontWeight={100} sx={{ fontSize: 15 }}>
              Add Quotation
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
        <Box sx={{ px: 4, py: 3 }}>
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
              Quotation
            </Typography>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Quote"
                  fullWidth
                  value={quoteNumber ? quoteNumber : "Number Was Generated"}
                  InputProps={{ readOnly: true }}
                  sx={{
                    width: { xs: "100%", sm: "100%", md: 400 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#f9fafb",
                      height: 40,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl
                  fullWidth
                  error={!!fieldErrors.customerName}
                  sx={{
                    width: { xs: "100%", sm: "100%", md: 400 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#f9fafb",
                      height: 40,
                    },
                  }}
                >
                  <InputLabel>Customer Name*</InputLabel>
                  <Select
                    value={customerName}
                    onChange={(e) => {
                      const selectedCustomerName = e.target.value;
                      setCustomerName(selectedCustomerName);
                      if (fieldErrors.customerName) setFieldErrors({ ...fieldErrors, customerName: '' });
                      fetchCustomerBillingStateCode(selectedCustomerName);
                    }}
                  >
                    <MenuItem value="">
                      <em>Select or add a customer</em>
                    </MenuItem>
                    {customers.map((customer) => (
                      <MenuItem
                        key={customer.customer_id}
                        value={customer.customer_name}
                      >
                        {customer.customer_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.customerName && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                      {fieldErrors.customerName}
                    </Typography>
                  )}
                </FormControl>
                
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Quote Date*"
                  type="date"
                  fullWidth
                  value={quoteDate}
                  onChange={(e) => {
                    setQuoteDate(e.target.value);
                    if (fieldErrors.quoteDate) setFieldErrors({ ...fieldErrors, quoteDate: '' });
                  }}
                  error={!!fieldErrors.quoteDate}
                  helperText={fieldErrors.quoteDate || ''}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    width: { xs: "100%", sm: "100%", md: 400 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#f9fafb",
                      height: 40,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Expiry Date*"
                  type="date"
                  fullWidth
                  value={expiryDate}
                  onChange={(e) => {
                    setExpiryDate(e.target.value);
                    if (fieldErrors.expiryDate) setFieldErrors({ ...fieldErrors, expiryDate: '' });
                  }}
                  error={!!fieldErrors.expiryDate}
                  helperText={fieldErrors.expiryDate || ''}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    width: { xs: "100%", sm: "100%", md: 400 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#f9fafb",
                      height: 40,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Subject"
                  fullWidth
                  placeholder="Write what this quotation is about"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (fieldErrors.subject) setFieldErrors({ ...fieldErrors, subject: '' });
                  }}
                  error={!!fieldErrors.subject}
                  helperText={fieldErrors.subject || ''}
                  sx={{
                    width: { xs: "100%", sm: "100%", md: 400 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#f9fafb",
                      height: 40,
                    },
                  }}
                />
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
                  onClick={handleAddRow}
                >
                  + ADD NEW ROW
                </Button>
                <Button
                  variant="text"
                  sx={{ fontWeight: 500, color: "#1976d2" }}
                  onClick={() => {
                    setItemModalOpen(true);
                    setItemSearchTerm("");
                  }}
                >
                  + ADD ITEMS IN BULK
                </Button>
              </Box>

              <TableContainer
                component={Paper}
                sx={{ mt: 3, boxShadow: "none" }}
              >
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
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            fullWidth
                            value={row.itemId}
                            onChange={(e) => {
                              const selectedProductId = e.target.value;
                              updateRow(index, "itemId", selectedProductId);
                              fetch(
                                `${BASE_URL}/products/${selectedProductId}`
                              )
                                .then((res) => res.json())
                                .then((product) => {
                                  updateRow(
                                    index,
                                    "item",
                                    product.product_name || ""
                                  );
                                  updateRow(
                                    index,
                                    "rate",
                                    product.sale_price || 0
                                  );
                                  updateRow(
                                    index,
                                    "uom",
                                    product.unit || ""
                                  );
                                })
                                .catch((err) => {
                                  console.error(
                                    "Error fetching product details:",
                                    err
                                  );
                                });
                            }}
                            size="small"
                            displayEmpty
                            sx={{ width: "100%" }}
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
                            onChange={(e) =>
                              updateRow(index, "qty", e.target.value)
                            }
                            size="small"
                          />
                        </TableCell>
                         <TableCell>
                          <Select
                            fullWidth
                            value={row.uom}
                            onChange={(e) =>
                              updateRow(index, "uom", e.target.value)
                            }
                            size="small"
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
                            onClick={() => handleRemoveRow(row.id)}
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
                      rows={1}
                      label="Customer Notes"
                      value={customerNotes}
                      onChange={(e) => {
                        setCustomerNotes(e.target.value);
                        if (fieldErrors.customerNotes) setFieldErrors({ ...fieldErrors, customerNotes: '' });
                      }}
                      error={!!fieldErrors.customerNotes}
                      helperText={fieldErrors.customerNotes || "Will be displayed on the quotation"}
                      sx={{ bgcolor: "#f9fafb", borderRadius: 1, width: 500 }}
                    />
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <TextField
                      multiline
                      rows={1}
                      label="Add: Freight"
                      value={freight}
                      onChange={(e) => {
                        setFreight(e.target.value);
                        if (fieldErrors.freight) setFieldErrors({ ...fieldErrors, freight: '' });
                      }}
                      error={!!fieldErrors.freight}
                      helperText={fieldErrors.freight || ''}
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
                      { label: "Freight", value: `₹${(parseFloat(freight) || 0).toFixed(2)}` },
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Terms & Conditions"
                  value={termsAndConditions}
                  onKeyDown={(e) => {
                    // Add bullet point on Enter key press
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const cursorPosition = e.target.selectionStart;
                      const currentValue = termsAndConditions;
                      const newValue = currentValue.substring(0, cursorPosition) + '\n* ' + currentValue.substring(cursorPosition);
                      setTermsAndConditions(newValue);
                      // Set cursor position after the new bullet point
                      setTimeout(() => {
                        e.target.setSelectionRange(cursorPosition + 3, cursorPosition + 3);
                      }, 0);
                    }
                  }}
                  onChange={(e) => {
                    setTermsAndConditions(e.target.value);
                    if (fieldErrors.termsAndConditions) setFieldErrors({ ...fieldErrors, termsAndConditions: '' });
                  }}
                  error={!!fieldErrors.termsAndConditions}
                  helperText={fieldErrors.termsAndConditions || ''}
                  multiline
                  rows={8}
                  placeholder="Enter terms and conditions here..."
                  variant="outlined"
                  sx={{
                    minHeight: 250,
                    bgcolor: "#f9fafb",
                    borderRadius: 1,
                    width: "207%", // Take full width
                    "& .MuiOutlinedInput-root": {
                      fontSize: 15,
                    },
                  }}
                />
                
                <Box
                  display="flex"
                  alignItems="center"
                  mt={1}
                  justifyContent="space-between"
                >
                  <Box display="flex" alignItems="center">
                    <Checkbox />
                    <Typography variant="body2">
                      Use this in future for all quotations
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <FormControl size="small"></FormControl>
                  </Box>
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
                  Preview Quotation
                </Button>
              </Box>
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  color="error"
                  sx={{
                    px: 1,
                    py: 1,
                    borderRadius: "15px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                  onClick={() => navigate("/quotation-list")}
                >
                  Cancel
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    px: 1,
                    py: 1,
                    borderRadius: "15px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Save as Draft"}
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#004085",
                    "&:hover": { backgroundColor: "#003366" },
                    px: 1,
                    py: 1,
                    borderRadius: "15px",
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                  }}
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Save & Send"}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
        >
          <Alert onClose={() => setError("")} severity="error">
            {typeof error === "string"
              ? error
              : error?.sqlMessage || JSON.stringify(error)}
          </Alert>
        </Snackbar>
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess("")}
        >
          <Alert onClose={() => setSuccess("")} severity="success">
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
