import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  Checkbox,
  Avatar,
  InputBase,
  Tabs,
  Tab,
  Breadcrumbs,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import Sidebar from "./Sidebar";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ui from '../assets/mera.png';

import axios from "axios";
import BASE_URL from '../config/api';

const PurchaseOrderActions = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuIndex, setMenuIndex] = useState(null);
  const [tab, setTab] = useState(0);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/purchase`)
      .then((res) => {
        console.log("Purchase Orders API Response:", res.data);
        setRows(res.data);
      })
      .catch((error) => {
        console.error("Failed to fetch purchase orders:", error);
        setRows([]);
      });
  }, []);

  const filteredRows = rows.filter((row) => {
    if (tab === 0) return true;
    if (tab === 1) return row.status === "Sent";
    if (tab === 2) return row.status === "Draft";
    return true;
  });

  const handleMenuOpen = (event, index) => {
    setAnchorEl(event.currentTarget);
    setMenuIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIndex(null);
  };

  const handleEditPurchase = (id) => {
    navigate(`/edit-purchase/${id}`);
  };

  const handleDownloadPdf = async (order) => {
    try {
      // Test if backend is reachable
      console.log('Testing API endpoint...');
      const testResponse = await axios.get(`${BASE_URL}/purchase`);
      console.log('API test successful:', testResponse.status);
      
      // Fetch purchase order data from backend API using purchase order number instead of ID
      const response = await axios.get(`${BASE_URL}/purchase/${order.purchase_order_no}`);
      console.log('Purchase order data fetched:', response.data);
      
      const { purchase_order: poData, vendor } = response.data;
  
      // Format date
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      };
  
      // Format currency
      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2
        }).format(amount);
      };
  
      // Generate items HTML
      const itemsHtml = poData.items.map((item, index) => `
        <tr>
          <td style="border: 1px solid #000; padding: 3px; text-align: center;">${index + 1}</td>
          <td style="border: 1px solid #000; padding: 3px;">${item.description}</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: center;">${item.quantity}</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: center;">${item.mou}</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: right;">${formatCurrency(item.rate)}</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: right;">${formatCurrency(item.amount)}</td>
        </tr>
      `).join('');
  
      // Build HTML using dynamic data
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Order - ${poData.purchase_order_no}</title>
</head>
<body style="font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 20px;">
    <div style="border: 2px solid #000; padding: 10px; width: 600px; margin: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 5px;">
            <div style="display: flex; align-items: center;">
                <img src="${ui}" alt="Merraki Expert Logo" style="width: 200px; height: auto; margin-top: -70px; margin-bottom: -70px;">
        
            </div>
            <div style="text-align: right;">
                <div style="margin-bottom: 2px;margin-right: 53px; text-align : justify ;"; ><strong>PO No:</strong> ${poData.purchase_order_no}</div>
                <div style="margin-bottom: 2px; margin-right: 9px;text-align : justify ;"><strong>Date:</strong> ${formatDate(poData.purchase_order_date)}</div>
                <div style="margin-right: 48px;text-align : justify ;"><strong>JO ID:</strong> ${poData.jo_id || 'N/A'}</div>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 2px solid #000;">
            <div style="font-size: 10px;"><strong>GSTIN:</strong> 27AKUPY6544R1ZM</div>
            <div style="font-size: 10px;"><strong>UDYAM-MH-20-0114278</strong></div>
        </div>

        <div style="border-bottom: 2px solid #000; padding: 5px 0;">
            <div style="display: flex;">
                <div style="width: 100px; font-weight: bold;">Billing Address:</div>
                <div>101, 2nd Floor, Shri Sai Appartment, Near Kachore Lawn, Nagpur - 440015</div>
            </div>
            <div style="display: flex;">
                <div style="width: 100px; font-weight: bold;">Shipping Address:</div>
                <div>${poData.shipping_address || 'Meraki Expert, 101, 2nd Floor, Shri Sai Appartment, Near Kachore Lawn, Nagpur - 440015'}</div>
            </div>
        </div>

        <div style="text-align: center; font-weight: bold; padding: 5px 0; border-bottom: 2px solid #000;">
            Purchase Order
        </div>

        <table style="width: 100%; border-collapse: collapse;">
            <tbody>
                <tr>
                    <td style="width: 25%; border: 1px solid #000; padding: 3px; background-color: #f2f2f2; font-weight: bold;">Vendor:</td>
                    <td style="width: 25%; border: 1px solid #000; padding: 3px;">${vendor.company_name || vendor.vendor_name}</td>
                    <td style="width: 25%; border: 1px solid #000; padding: 3px; background-color: #f2f2f2; font-weight: bold;">GSTIN</td>
                    <td style="width: 25%; border: 1px solid #000; padding: 3px;">${vendor.gst || 'N/A'}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; background-color: #f2f2f2; font-weight: bold;">Address:</td>
                    <td style="border: 1px solid #000; padding: 3px;">${vendor.billing_address}</td>
                    <td style="border: 1px solid #000; padding: 3px; background-color: #f2f2f2; font-weight: bold;">Kind Attn.</td>
                    <td style="border: 1px solid #000; padding: 3px;">${vendor.contact_name}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; background-color: #f2f2f2; font-weight: bold;">Mobile No.</td>
                    <td style="border: 1px solid #000; padding: 3px;">${vendor.mobile_no}</td>
                    <td style="border: 1px solid #000; padding: 3px; background-color: #f2f2f2; font-weight: bold;">Email</td>
                    <td style="border: 1px solid #000; padding: 3px; color: #00f;"><a href="mailto:${vendor.email}">${vendor.email}</a></td>
                </tr>
            </tbody>
        </table>

        <div style="border: 1px solid #000; padding: 3px; margin-top: 5px;">
            This is reference to our requirement,
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th style="border: 1px solid #000; padding: 3px; width: 5%;">Sr. No.</th>
                    <th style="border: 1px solid #000; padding: 3px; width: 35%;">Item Description</th>
                    <th style="border: 1px solid #000; padding: 3px; width: 10%;">HSN Code</th>
                    <th style="border: 1px solid #000; padding: 3px; width: 5%;">Qty.</th>
                    <th style="border: 1px solid #000; padding: 3px; width: 5%;">MOU</th>
                    <th style="border: 1px solid #000; padding: 3px; width: 15%;">Rate</th>
                    <th style="border: 1px solid #000; padding: 3px; width: 25%;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>

        <div style="display: flex; margin-top: 5px;">
            <div style="width: 50%; border: 1px solid #000; padding: 5px;">
                <div style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 5px;">Terms & Conditions</div>
                <div>Payment Terms: ${poData.payment_terms || '100% After Delivery'}</div>
                <div style="margin-top: 5px;">PO Validity: ${poData.po_validity || '4 Month'}</div>
                <div>Delivery: ${poData.delivery_time || '1 to 2 Weeks (Immediate)'}</div>
                <div>Document Required: ${poData.required_docs || 'Test Certificate'}</div>
            </div>
            <div style="width: 50%;">
                <table style="width: 100%; border-collapse: collapse; margin-left: -1px;">
                    <tbody>
                        <tr>
                            <td colspan="4" style="border: 1px solid #000; padding: 3px; font-weight: bold; text-align: right;">Sub Total</td>
                            <td colspan="2" style="border: 1px solid #000; padding: 3px; text-align: right;">${formatCurrency(poData.sub_total)}</td>
                        </tr>
                        <tr>
                            <td colspan="4" style="border: 1px solid #000; padding: 3px; font-weight: bold; text-align: right;">Freight</td>
                            <td colspan="2" style="border: 1px solid #000; padding: 3px; text-align: right;">${formatCurrency(poData.freight || 0)}</td>
                        </tr>
                        <tr>
                            <td colspan="4" style="border: 1px solid #000; padding: 3px; font-weight: bold; text-align: right;">CGST @${(poData.cgst / poData.sub_total * 100).toFixed(2)}%</td>
                            <td colspan="2" style="border: 1px solid #000; padding: 3px; text-align: right;">${formatCurrency(poData.cgst)}</td>
                        </tr>
                        <tr>
                            <td colspan="4" style="border: 1px solid #000; padding: 3px; font-weight: bold; text-align: right;">SGST @${(poData.sgst / poData.sub_total * 100).toFixed(2)}%</td>
                            <td colspan="2" style="border: 1px solid #000; padding: 3px; text-align: right;">${formatCurrency(poData.sgst)}</td>
                        </tr>
                        <tr>
                            <td colspan="4" style="border: 1px solid #000; padding: 3px; font-weight: bold; text-align: right;">Grand Total</td>
                            <td colspan="2" style="border: 1px solid #000; padding: 3px; text-align: right;">${formatCurrency(poData.total)}</td>
                        </tr>
                        <tr>
                            <td colspan="4" style="border: 1px solid #000; padding: 3px; font-weight: bold; text-align: right;">Total in Words</td>
                            <td colspan="2" style="border: 1px solid #000; padding: 3px; text-align: left;">${poData.total_in_words}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div style="border: 1px solid #000; padding: 3px; margin-top: 5px;">
            <strong>Amount (in words):</strong> ${poData.total_in_words}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 5px;">
            <div style="width: 70%;">
                <div style="border: 1px solid #000; padding: 3px;">
                    Email: merakkiexpert@gmail.com | Mobile: +91-8793484326 / +91-9130801011 | www.merakkiexpert.in
                </div>
            </div>
            <div style="width: 30%; text-align: center; margin-left: 10px;">
                <div style="font-weight: bold;">For MERAKI EXPERT</div>
                <div style="height: 50px; display: flex; align-items: center; justify-content: center;">
                    
                </div>
                <div>(Authorized Signatory)</div>
            </div>
        </div>
    </div>
</body>
</html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Failed to download PDF. Please check console for details.');
    }
  };

  const handlePrintOrder = async (order) => {
    // Placeholder for print functionality (can reuse handleDownloadPdf logic if needed)
  };

  const handleSendEmail = (order) => {
    try {
      const subject = encodeURIComponent(
        `Purchase Order ${order.purchase_order_no || "N/A"}`
      );
      const body = encodeURIComponent(
        `Hi,\n\nHere are your purchase order details:\nOrder #: ${
          order.purchase_order_no || "N/A"
        }\nVendor: ${order.vendor_name || "N/A"}\nAmount: ₹${
          order.total || "N/A"
        }\nDelivery Date: ${
          order.delivery_date ? order.delivery_date.slice(0, 10) : "N/A"
        }`
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } catch (error) {
      console.error("Email generation failed:", error);
      alert("Failed to generate email. Please try again.");
    }
  };

  const handleShareLink = (order) => {
    try {
      navigator.clipboard.writeText(
        `https://dummy-purchase-order-link/${
          order.purchase_order_no || "unknown"
        }`
      );
      alert("Purchase order link copied to clipboard!");
    } catch (error) {
      console.error("Share link failed:", error);
      alert("Failed to copy link. Please try again.");
    }
  };

  return (
    <Box display="flex">
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column" minHeight="100vh">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={2}
        >
          <Breadcrumbs>
            <Typography color="text.primary">Purchase Order</Typography>
          </Breadcrumbs>
          <Box display="flex" gap={2}>
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
              <Avatar src="https://i.pravatar.cc/40?img=1" />
              <Typography fontSize={14}>Admin name</Typography>
              <ArrowDropDownIcon />
            </Box>
          </Box>
        </Box>
        <Box p={3}>
          <Paper sx={{ p: 1, borderRadius: 2 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              px={4}
              py={2}
              borderBottom="1px solid #e0e0e0"
            >
              <Typography fontWeight="bold" fontSize={18}>
                Purchase Order
              </Typography>
              <Button
                variant="contained"
                onClick={() => (window.location.href = "/add-purchase-order")}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor: "#004085",
                  color: "#fff",
                  "&:hover": { bgcolor: "#003366" },
                }}
              >
                + New Purchase Order
              </Button>
            </Box>
            <Box
              px={4}
              pt={2}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Tabs
                value={tab}
                onChange={(e, newTab) => setTab(newTab)}
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    bgcolor: "#f1f1f1",
                    borderRadius: 2,
                    mr: 1,
                  },
                  "& .Mui-selected": {
                    bgcolor: "#004085",
                    color: "white !important",
                  },
                  "& .MuiTabs-indicator": { display: "none" },
                }}
              >
                <Tab label="All Purchase Order" />
                <Tab label="Sent Purchase Order" />
                <Tab label="Draft Purchase Order" />
              </Tabs>
              <TextField
                size="small"
                placeholder="Search by item name..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  sx: { bgcolor: "white", borderRadius: 2 },
                }}
              />
            </Box>
            <TableContainer component={Paper} sx={{ boxShadow: "none", mt: 2 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "#F9FAFB" }}>
                  <TableRow>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>Purchase Order #</TableCell>
                    <TableCell>Vendor Name</TableCell>
                    <TableCell>Created Date</TableCell>
                    <TableCell>Delivery Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Bill Amount</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell sx={{ color: "#0B5FFF", fontWeight: 500 }}>
                        {row.purchase_order_no || "N/A"}
                      </TableCell>
                      <TableCell>{row.vendor_name || "N/A"}</TableCell>
                      <TableCell>
                        {row.purchase_order_date
                          ? row.purchase_order_date.slice(0, 10)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {row.delivery_date
                          ? row.delivery_date.slice(0, 10)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{
                            backgroundColor: "#F2F4F7",
                            color: "#344054",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {row.status || "Draft"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {row.total ? `₹${row.total}` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={(e) => handleMenuOpen(e, i)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && menuIndex === i}
                          onClose={handleMenuClose}
                        >
                          <MenuItem onClick={() => {
                            handleEditPurchase(row.id);
                          }}>
                            Edit
                          </MenuItem>
                          <MenuItem onClick={() => handleDownloadPdf(row)}>
                            Download PDF
                          </MenuItem>
                          <MenuItem onClick={() => handleDownloadPdf(row)}>
                            Print
                          </MenuItem>
                          <MenuItem onClick={() => handleSendEmail(row)}>
                            Send Email
                          </MenuItem>
                          <MenuItem onClick={() => handleShareLink(row)}>
                            Share Link
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
            >
              <Typography variant="body2">
                Showing 1 to {filteredRows.length} of {rows.length} entries
              </Typography>
              <Box display="flex" gap={1}>
                {[1, 2, 3].map((page) => (
                  <Button
                    key={page}
                    size="small"
                    variant={page === 1 ? "outlined" : "text"}
                  >
                    {page}
                  </Button>
                ))}
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default PurchaseOrderActions;