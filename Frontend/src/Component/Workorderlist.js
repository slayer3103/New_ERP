import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, InputBase, IconButton, Avatar, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, Menu, MenuItem,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ui from '../assets/mera.png';
import BASE_URL from '../config/api';

const statusColorMap = {
  Draft: { bg: '#E6F4EA', color: '#333' },
  'In Progress': { bg: '#E5F0FB', color: '#1565C0' },
  Completed: { bg: '#E6F4EA', color: '#2E7D32' },
  Cancelled: { bg: '#FEEAEA', color: '#C62828' },
};

const WorkOrderlist = () => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tab, setTab] = useState('All');
  const [workOrders, setWorkOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${BASE_URL}/work-orders`);
      const data = res.data;
      console.log("📦 Work Orders from backend:", data);
      setWorkOrders(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Failed to fetch work orders:', err);
      setError(`Failed to load work orders: ${err.message}. Please check the backend endpoint.`);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, order) => {
    setMenuAnchor(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleClose = () => {
    setMenuAnchor(null);
    setSelectedOrder(null);
  };

  const handleEdit = () => {
    if (selectedOrder) {
      navigate(`/edit-work-order/${selectedOrder.work_order_id}`);
      handleClose();
    }
  };

  const handleShareLink = (order) => {
    navigator.clipboard.writeText(`https://dummy-workorder-link/${order.work_order_id}`);
    alert('Work order link copied to clipboard!');
    handleClose();
  };

  const numberToWords = (num) => {
    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const thousands = ["", "Thousand", "Lakh", "Crore"];

    const convertLessThanThousand = (num) => {
      if (num === 0) return "";
      if (num < 10) return units[num];
      if (num < 20) return teens[num - 10];
      if (num < 100) return `${tens[Math.floor(num / 10)]} ${units[num % 10]}`.trim();
      return `${units[Math.floor(num / 100)]} Hundred ${convertLessThanThousand(num % 100)}`.trim();
    };

    const convert = (num) => {
      if (num === 0) return "Zero";
      let result = "";
      let thousandIndex = 0;
      while (num > 0) {
        const chunk = num % 1000;
        if (chunk > 0) {
          result = `${convertLessThanThousand(chunk)} ${thousands[thousandIndex]} ${result}`.trim();
        }
        num = Math.floor(num / 1000);
        thousandIndex++;
      }
      return result;
    };

    return `${convert(Math.floor(num))} Rupees Only`;
  };

  const handleDownloadPdf = async (workOrder) => {
    try {
      // Fetch work order details from API
      const response = await axios.get(`${BASE_URL}/work-orders/${workOrder.work_order_id}`);
      const responseData = response.data;
      
      if (!responseData || !responseData.workOrderItems) {
        alert('Work order data is incomplete');
        return;
      }

      // Extract data from response
      const { workOrder: workOrderData, workOrderItems, customer } = responseData;

      // Use totals from backend response
      const sub_total = parseFloat(responseData.total_amount || workOrderData.sub_total || 0);
      const cgst = parseFloat(responseData.cgst || workOrderData.cgst || 0);
      const sgst = parseFloat(responseData.sgst || workOrderData.sgst || 0);
      const grand_total = parseFloat(responseData.grand_total || workOrderData.grand_total || 0);
      
      // Format date
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN');
      };
      
      // Format currency
      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR'
        }).format(amount);
      };

      // Dynamic vendor/customer details - fallback if vendor join fails
      const vendorName = customer?.billing_recipient_name || workOrderData.customer_name || 'N/A';
      const companyName = customer?.customer_name || workOrderData.customer_name || 'N/A';
      const addressParts = [
        customer?.billing_address1 || '',
        customer?.billing_address2 || '',
        customer?.billing_city || 'Nagpur',
        `${customer?.billing_state || ''} - ${customer?.billing_pincode || ''}`
      ].filter(Boolean).join(', ');
      const fullAddress = addressParts || 'Address not available';
      const city = customer?.billing_city || 'Nagpur';
      const mobile = customer?.mobile || customer?.phone || 'Not available';
      const email = customer?.email || customer?.mail_id || 'Not available';
      const woNumber = workOrderData.work_order_number || 'ME/00/2024-25';
      const woDate = formatDate(workOrderData.work_order_date) || '15-07-2024';
      const jobNo = workOrderData.purchase_order_number || '';
      // Dynamic terms and conditions - strip leading bullets if any
      const terms = workOrderData.terms_and_conditions || '';
      const termsLines = terms.split('\n').filter(line => line.trim()).map(line => line.replace(/^[*]{1,2}\s*[-•]\s*/i, '').trim());
      const termsListHTML = termsLines.map(line => `<li>${line}</li>`).join('') || '<li>No terms provided</li>';
      // Generate dynamic items HTML
      const itemsHTML = workOrderItems.map((item, index) => `
        <tr>
          <td style="border: 1px solid #000; padding: 3px; text-align: center;">${index + 1}</td>
          <td style="border: 1px solid #000; padding: 3px;">${item.item_detail || 'N/A'}</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: center;">32149090</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: center;">${item.quantity || 0}</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: center;">${item.uom_description || 'Box'}</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: right;">${item.rate || 0}</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: right;">${item.amount || (item.quantity * item.rate).toFixed(2)}</td>
        </tr>
      `).join('');
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
     <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Work Order (Image 1)</title>
    <style>
        /* --- Global & Container Styles --- */
        body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        @page {
  size: A4;
  margin: 10mm; /* you can adjust this to 5mm or 15mm */
}
        .work-order-container {
            width: 90%; /* A4-like width for print */
            margin: 0 auto;
        }
        /* --- Utility & Border Classes --- */
        .full-border { border: 8px solid #000; }
        .thick-top-border { border-top: 3px solid #333; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .bold { font-weight: bold; }
        .padding-5 { padding: 5px; }
        /* --- Header Section --- */
   
    
        /* Left Header (Logo/Company Info) */
        .logo-section {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
        }
     
        .logo-text-area {
            line-height: 1.1;
        }
        .logo-main-text {
            font-size: 14pt;
            font-weight: bold;
            color: #21407d; /* Blue color */
        }
        .logo-tagline {
            font-size: 7pt;
            color: #666;
            font-style: italic;
        }
        .company-header-text {
            margin-top: 3px;
        }
        .company-header-text div {
            font-size: 10pt;
            line-height: 1.2;
        }
        .company-header-text .name-large {
            font-size: 12pt;
            font-weight: bold;
        }
        /* Right Header (WO Details) */
        .wo-details-table {
            width: 100%;
            border-collapse: collapse;
        }
        .wo-details-table td {
            font-size: 10pt;
            padding: 0 0 2px 0;
        }
        .wo-details-table .label {
            width: 80px;
            padding-right: 5px;
            font-weight: bold;
             color: #21407d;
        }
        .wo-details-table .value {
             color: #21407d; /* Blue color */
        }
        /* --- Vendor & WO Details Block --- */
        .vendor-wo-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 80%;
            margin: 0 auto;
            margin-top: 20px;
      
        }
        .vendor-col, .wo-col {
            width:60%;
        }
        .vendor-details div {
            line-height: 1.6;
        }
        .details-heading {
            font-weight: bold;
            font-size: 11pt;
            padding-bottom: 2px;
            margin-bottom: 5px;
            bo
        }
        /* --- Main Work Order Table --- */
        .main-wo-table {
            width: 80%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 9pt; /* Smaller font for the dense table */
            margin: 0 auto;
            border: 1px solid #000;
                    
        }
        .main-wo-table th, .main-wo-table td {
            border: 1px solid #000;
            padding: 3px 5px;
            vertical-align: top;
            height: 15px; /* Give empty cells a defined height */
        }
        .main-wo-table th {
           /* Light grey header */
            font-weight: bold;
        }
        /* Column widths to replicate spacing */
        .col-sno { width: 5%; }
        .col-qty, .col-mou, .col-rate, .col-amount { width: 10%; }
        .col-desc { width: 55%; }
        /* Merging for the total row */
        .total-row .label-cell {
            text-align: right;
            border-right: none;
            font-weight: bold;
        }
        .total-row .total-cell {
            text-align: right;
            font-weight: bold;
        }
        /* --- Terms & Condition Section --- */
        .terms-conditions {
            margin-top: 20px;
            border: 1px solid #000;
            width: 80%;
            margin: 0 auto;
            margin-top: 20px;
        }
        
        .terms-heading-bar {
            font-weight: bold;
      font-size: 1rem;
            padding: 5px;
            border: 3px solid #000;
                     color: #21407d;
        }
        
        .terms-list-container {
            padding: 5px;
        }
        .terms-list {
            list-style-type: none; /* Removes default bullet */
            padding-left: 0;
            margin: 0;
            line-height: 1.3;
            /* Use a simple list for the * bullet look from the original image */
        }
        
        .terms-list li {
            position: relative;
            padding-left: 15px;
            margin-bottom: 2px;
        }
        .terms-list li::before {
            content: '*';
            position: absolute;
            left: 0;
            font-weight: bold;
        }
        
        /* --- Signature Section --- */
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            padding-bottom: 5px;
            width: 80%;
            margin: 0 auto;
            margin-top: 50px;
        }
        .signature-box {
            border-top: 1px solid #000;
            padding-top: 5px;
            text-align: center;
            width: 30%;
            font-weight: bold;
        }
        .signature-box-left { text-align: left; }
        .signature-box-right { text-align: right; }
        /* --- Footer Section --- */
        .footer {
            margin-top: 50px;
            border-top: 1px solid #ccc;
            padding-top: 10px;
            font-size: 8pt;
            margin: 0 auto;
            margin-top: 20px;
            width: 90%;
        }
        .footer-address-bar {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .footer-address {
            width: 48%;
            padding-left: 15px;
            position: relative;
        }
        .footer-address::before {
            content: '•';
            color: #70AD47; /* Green dot */
            font-size: 12pt;
            position: absolute;
            left: 0;
            top: 0;
        }
        .contact-bar {
            background-color: #70AD47; /* Green bar */
            color: white;
            text-align: center;
            padding: 5px 0;
            display: flex;
            justify-content: space-around;
            font-size: 8pt;
            font-weight: bold;
            margin-top: 10px;
        }
        .contact-bar a {
            color: inherit;
            text-decoration: none;
        }
        .contact-bar span {
            margin: 0 5px;
        }
        .border{
            width: 90%;
            height: 3px;
            background-color: rgb(207, 207, 207);
            margin: 0 auto;
          margin-top: -45px;
          
        }
        .vendor-wo-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 20px;
  gap: 20px;
  width: 80%; /* use full available space */
  box: box-sizing: border-box;
  margin-bottom: 20px;
  font-size: 1rem;
  font-weight: bold;
}
.vendor-col {
  width: 100%;
}
.wo-col {
  width: 35%;
  text-align: right;
}
.main-wo-table {
  width: 80%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 9pt;
  border: px solid #000;
}
.main-wo-table th,
.main-wo-table td {
  border: 1px solid #000;
  padding: 5px 6px;
  vertical-align: top;
  font-family: Arial, sans-serif;
  color: #000;
}
.main-wo-table th {
  font-weight: bold;
  text-align: center;
}
.total-row .label-cell {
  text-align: right;
  font-weight: bold;
  border-right: 1px solid #000;
}
.total-row .total-cell {
  text-align: right;
  font-weight: bold;
  border-left: 1px solid #000;
}

        @media print {
  body {
    width: 210mm; /* exact width of A4 */
    height: 297mm; /* exact height of A4 */
    margin: 0;
    padding: 0;
    background: white;
    -webkit-print-color-adjust: exact; /* ensures colors are printed */
  }
  .vendor-col {
  width: 60%;
}
        }
    </style>
</head>
<body>

<div class="work-order-container">
   
  <div style="display: flex; align-items: center; justify-content: space-between;">
                <div class="logo-section">
                 
       
                         <img src=${ui} alt="Merraki Expert Logo" style="width: auto; height: 280px ; margin-top: -120px; margin-bottom: -60px" />
           
                </div>
        
       
                <div class="company-header-text" style=" color: #21407d; font-size: 2rem; font-weight: bold;" >
                    <div class="bold text-right">MERAKI EXPERT PVT. LTD.</div>
                    <div class="name-large text-right">MERAKI EXPERT</div>
                </div>
                </div>
    </div>
                <div class="border"> </div>

    <div class="vendor-wo-container">
   
  
        <div class="vendor-col">
            <div class="details-heading" style="color: #21407d; font-weight: bold; font-size: 1.2rem;">Vendor Details</div>
            <div class="vendor-details">
                <div>Name: ${vendorName}</div>
                <div>Company Name: ${companyName}</div>
                <div>Address: ${fullAddress}</div>
                <div>${city}:</div>
                <div>Mob. No. ${mobile}</div>
                <div>Mail Id. ${email}</div>
            </div>
        </div>
        <div class="wo-col text-right">
            <div class="details-heading"></div> <table class="wo-details-table" style="float: right;">
                <tr>
                    <td class="label text-left">W/O No:</td>
                    <td class="value text-left">${woNumber}</td>
                </tr>
                <tr>
                    <td class="label text-left">W/O Date:</td>
                    <td class="value text-left">${woDate}</td>
                </tr>
            </table>
        </div>
                
       
    </div>
<table class="main-wo-table">
  <thead>
    <tr>
      <th colspan="6" style="border: 3px solid black; font-weight: bold;
      font-size: 1rem; color: #21407d; ">Work Order against (M/s. ${companyName}) (Job No. ${jobNo})</th>
    </tr>
    <tr style="border: 3px solid black;">
      <th class="col-sno">S.NO.</th>
      <th class="col-desc">Description</th>
      <th class="col-qty">Quantity</th>
      <th class="col-mou">Mou</th>
      <th class="col-rate">Rate</th>
      <th class="col-amount">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${itemsHTML}
    <tr> <td class="text-center"></td>
      <td class="text-center"></td>
      <td class="text-right"></td>
            <td class="text-right"></td>
      <td class="text-right">Extra</td><td class="text-right"></td></tr>
          <tr style="border : 3px solid black"> <td class="text-center"></td>
      <td class="text-right" colspan="4" style="border: 3px solid black;">Total Amount</td>
      <td class="text-right">${grand_total.toFixed(2)}</td>
          
 </tr>
         <tr> <td class="text-center" style="border: none; display: none;"></td>
      <td class="text-right" colspan="6"></td>
          
 </tr>
  </tbody>
</table>
    <div class="terms-conditions">
        <div class="terms-heading-bar" >Terms & Condition</div>
        <div class="terms-list-container">
            <ul class="terms-list">
                ${termsListHTML}
            </ul>
        </div>
    </div>
    <div class="signature-section">
        <div class="signature-box signature-box-left">
            Contractor Signature
        </div>
        <div style="width: 30%;"></div>
        <div class="signature-box signature-box-right">
            Maraki Expert
        </div>
    </div>
    <div class="footer">
        <div class="footer-address-bar">
            <div class="footer-address">
                *Office Address:*
                <br>
                101, 2nd Floor, Shri Sai Apartment, Near Kachore Lawn,
                Manish Nagar, Nagpur - 440015 (MH).
            </div>
            <div class="footer-address">
                *Registered Address:*
                <br>
                3863, Prabag No. 5, Ganesh Square,
                Teacher Colony Road, Deori, Gondia - 441901.
            </div>
        </div>
       
        <div class="contact-bar">
            <span>📞 +91 77220 01802</span>
            <span>📧 info@merakkiexpert.in</span>
            <span>🌐 www.merakkiexpert.in</span>
        </div>
    </div>
</div>
</body>
</html>
      `);
      printWindow.document.close();
      printWindow.print();
      handleClose();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handlePrintWorkOrder = async (order) => {
    try {
      const response = await axios.get(`${BASE_URL}/work-orders/${order.work_order_id}`);
      const { workOrder, workOrderItems, customer } = response.data;

      const formatDate = (dateString) => {
        const d = new Date(dateString);
        return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
      };

      const vendorName = customer?.billing_recipient_name || workOrder.customer_name || 'N/A';
      const companyName = customer?.customer_name || workOrder.customer_name || 'N/A';
      const addressLine = [customer?.billing_address1, customer?.billing_address2, customer?.billing_city].filter(Boolean).join(', ') || 'Address not available';
      const mobile = customer?.mobile || customer?.phone || 'Not available';
      const email = customer?.email || customer?.mail_id || 'Not available';

      const terms = workOrder.terms_and_conditions || '';
      const termsLines = terms.split('\n').filter(line => line.trim()).map(line => line.replace(/^[*]{1,2}\s*[-•]\s*/i, '').trim());
      const termsList = termsLines.map(line => `<li>${line}</li>`).join('') || '<li>No terms provided</li>';

      const itemsHTML = workOrderItems.map((item, index) => `
        <tr>
          <td style="text-align:center;">${index + 1}.</td>
          <td>${item.item_detail || ''}</td>
          <td style="text-align:center;">${item.quantity || ''}</td>
          <td style="text-align:center;">${item.uom_description || ''}</td>
          <td style="text-align:right;">${item.rate || ''}</td>
          <td style="text-align:right;">${item.amount || ''}</td>
        </tr>
      `).join('');

      const total = workOrderItems.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
        <head>
          <title>Work Order</title>
          <style>
            @page { size: A4; margin: 14mm; }
            body { font-family: Arial, sans-serif; color: #000; }
            .sheet { }
            .top { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
            .top .left img { height:60px; }
            .top .right { text-align:right; font-weight:bold; font-size:16px; line-height:1.2; }
            .section { margin-top:6px; }
            .vendor { display:flex; justify-content:space-between; font-size:12px; }
            .vendor .left { width:58%; }
            .vendor .right { width:40%; text-align:right; }
            .table { width:100%; border-collapse:collapse; font-size:12px; margin-top:8px; }
            .table, .table th, .table td { border: 1.5px solid #000; }
            .table th, .table td { padding:6px; }
            .title-row th { text-align:center; background:#e6e6e6; font-weight:bold; }
            .table .col-no { width:8%; text-align:center; }
            .table .col-desc { width:54%; }
            .table .col-qty { width:10%; text-align:center; }
            .table .col-uom { width:10%; text-align:center; }
            .table .col-rate { width:9%; text-align:right; }
            .table .col-amt { width:9%; text-align:right; }
            .terms { border:1.5px solid #000; margin-top:12px; }
            .terms .header { background:#e6e6e6; font-weight:bold; padding:6px 8px; border-bottom:1.5px solid #000; }
            .terms .body { padding:8px 14px; }
            .signatures { display:flex; justify-content:space-between; margin-top:18px; }
            .signature { width:45%; text-align:center; border-top:1px solid #000; padding-top:10px; font-weight:bold; }
            .footer { display:flex; justify-content:space-between; font-size:12px; margin-top:8px; }
            .contact-bar { background:#2ECC71; color:#fff; text-align:center; padding:6px; font-size:12px; margin-top:6px; }
            .website-bar { background:#2E86C1; color:#fff; text-align:center; padding:6px; font-size:12px; }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="top">
              <div class="left"><img src="${ui}" alt="Meraki Expert"/></div>
              <div class="right">MERRAKI EXPERT PVT. LTD.<br/>MERAKI EXPERT</div>
            </div>

            <div class="section vendor">
              <div class="left">
                <div style="font-weight:bold;">Vendor Details</div>
                Name: ${vendorName}<br/>
                Company Name: ${companyName}<br/>
                Address: ${addressLine}<br/>
                Nagpur.<br/>
                Mob No. ${mobile}<br/>
                Mail Id. ${email}
              </div>
              <div class="right">
                W/O No ${workOrder.work_order_number || ''}<br/>
                W/O Date: ${formatDate(workOrder.work_order_date) || ''}
              </div>
            </div>

            <table class="table">
              <thead>
                <tr class="title-row"><th colspan="6">Work Order against (M/s. ${companyName || vendorName}.) (Job No.)</th></tr>
                <tr>
                  <th class="col-no">S.NO.</th>
                  <th class="col-desc">Description</th>
                  <th class="col-qty">Quantity</th>
                  <th class="col-uom">Mou</th>
                  <th class="col-rate">Rate</th>
                  <th class="col-amt">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
                <tr>
                  <td colspan="5" style="text-align:right;font-weight:bold;">Extra</td>
                  <td class="col-amt"></td>
                </tr>
                <tr>
                  <td colspan="5" style="text-align:right;font-weight:bold;">Total Amount</td>
                  <td class="col-amt">${total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div class="terms">
              <div class="header">Terms & Condition</div>
              <div class="body">
                <ul style="margin:0; padding-left:18px;">
                  ${termsList}
                </ul>
              </div>
            </div>

            <div class="signatures">
              <div class="signature">Contractor Signature</div>
              <div class="signature">Meraki Expert</div>
            </div>

            <div class="footer">
              <div>Office Address:<br/>101, 2nd Floor, Shri Sai Apartment, Near Kachore Lawn,<br/>Manish Nagar, Nagpur-440025 (MH).</div>
              <div>Registered Address:<br/>3863, Prabhu No. 6 Ganesh Square,<br/>Teacher Colony Road, Deori, Gondia-441901.</div>
            </div>

            <div class="contact-bar">+91 77220 01802 | info@merakiexpert.in</div>
            <div class="website-bar">www.merakiexpert.in</div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      handleClose();
    } catch (error) {
      console.error("Error printing work order:", error);
      alert("Failed to print work order. Please try again.");
    }
  };

  const getFilteredOrders = () => {
    return workOrders.filter(order => {
      const customerName = order.customer_name || '';
      const matchesTab = tab === 'All' || order.status === tab;
      const matchesSearch = customerName.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Loading work orders...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={fetchWorkOrders} variant="contained" sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#F9FAFB' }}>
      <Sidebar />

      <Box sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            height: 60,
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            px: 3,
            justifyContent: 'space-between',
            bgcolor: '#fff'
          }}
        >
          <Typography fontWeight="bold">Work Order</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#F0F0F0',
                px: 2,
                py: 0.5,
                borderRadius: 5,
                minWidth: 250
              }}
            >
              <SearchIcon fontSize="small" sx={{ color: '#555' }} />
              <InputBase
                placeholder="Search customer name..."
                sx={{ ml: 1, flex: 1, fontSize: 14 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Box>
            <IconButton><NotificationsNoneIcon /></IconButton>
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar src="https://i.pravatar.cc/40?img=1" />
              <Typography fontSize={14}>Admin name</Typography>
              <ArrowDropDownIcon />
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Paper sx={{ backgroundColor: '#fff', p: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="bold">Work Order</Typography>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#004085', textTransform: 'none', '&:hover': { backgroundColor: '#003060' } }}
                onClick={() => navigate('/add-Work-Order')}
              >
                + Add New Work Order
              </Button>
            </Box>

            <Box display="flex" gap={1} mb={2}>
              {['All', 'Draft', 'In Progress', 'Completed', 'Cancelled'].map(label => (
                <Button
                  key={label}
                  variant={tab === label ? 'contained' : 'outlined'}
                  sx={{ textTransform: 'none' }}
                  onClick={() => setTab(label)}
                >
                  {label}
                </Button>
              ))}
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Work Order #</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Bill Amount</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredOrders().map((row) => (
                  <TableRow key={row.work_order_id}>
                    <TableCell>{row.work_order_number || 'N/A'}</TableCell>
                    <TableCell>{row.customer_name || 'N/A'}</TableCell>
                    <TableCell>{row.work_order_date ? new Date(row.work_order_date).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status || 'Unknown'}
                        size="small"
                        sx={{
                          bgcolor: statusColorMap[row.status]?.bg || '#E0E0E0',
                          color: statusColorMap[row.status]?.color || '#000'
                        }}
                      />
                    </TableCell>
                    <TableCell>{row.grand_total || '-'}</TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => handleMenuClick(e, row)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={() => handleDownloadPdf(selectedOrder)}><PictureAsPdfIcon fontSize="small" sx={{ mr: 1 }} /> Download PDF</MenuItem>
        <MenuItem onClick={() => handlePrintWorkOrder(selectedOrder)}><PrintIcon fontSize="small" sx={{ mr: 1 }} /> Print Work Order</MenuItem>
        <MenuItem onClick={() => handleShareLink(selectedOrder)}>Share Link</MenuItem>
      </Menu>
    </Box>
  );
};

export default WorkOrderlist;