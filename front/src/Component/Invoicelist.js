import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Menu,
  MenuItem,
  Chip,
  Checkbox,
  Avatar,
  InputBase,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import ShareIcon from "@mui/icons-material/Share";
import EmailIcon from "@mui/icons-material/Email";
import Sidebar from "./Sidebar";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import ui from "../assets/mera.png"
import ne from "../assets/new.png"
import BASE_URL from '../config/api';
const statusColor = {
  Paid: "success",
  Draft: "default",
  Partial: "info",
};

export default function Invoicelist() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuIndex, setMenuIndex] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("All Invoices");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    setLoading(true);
    setError('');
    axios.get(`${BASE_URL}/invoice`)
      .then(res => setInvoices(res.data))
      .catch(() => setError('Failed to fetch invoices'))
      .finally(() => setLoading(false));
  }, []);

  const handleMenuOpen = (event, index) => {
    setAnchorEl(event.currentTarget);
    setMenuIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIndex(null);
  };

  const handleNewInvoice = () => navigate("/new-invoice");

  const handleEditInvoice = (id) => {
    navigate(`/edit-invoice/${id}`);
  };

  const handleDownloadPdf = async (invoice) => {
    try {
      // Fetch invoice details, items, and customer
      const response = await axios.get(`${BASE_URL}/invoice/${invoice.invoice_id}`);
      const { invoice: invoiceData, items, customer, sub_total, cgst, sgst, grand_total } = response.data;

      if (!customer) {
        throw new Error("Customer not found");
      }

      // Helper function to convert number to words (Indian Rupees)
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

      // Generate items table rows
      const itemsRows = items
        .map(
          (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.item_detail}</td>
            <td>${item.hsn_sac || "39259010"}</td>
            <td>${item.quantity}</td>
            <td>Sq.M</td>
            <td>${parseFloat(item.rate).toFixed(2)}</td>
            <td>${(item.quantity * item.rate).toFixed(2)}</td>
            <td>${item.discount || "-"}</td>
            <td>${item.amount.toFixed(2)}</td>
            <td>9%<br>${(item.amount * 0.09).toFixed(2)}</td>
            <td>9%<br>${(item.amount * 0.09).toFixed(2)}</td>
            <td>0%</td>
            <td>${(item.amount + item.amount * 0.18).toFixed(2)}</td>
          </tr>`
        )
        .join("");

      // Construct billing and shipping details with fallback
      const billingDetails = `
        ${customer.billing_recipient_name || customer.customer_name || "N/A"}<br>
        ${customer.billing_address1 || ""}${customer.billing_address2 ? `<br>${customer.billing_address2}` : ""}<br>
        ${customer.billing_city || ""}, ${customer.billing_state || ""} - ${customer.billing_pincode || ""}<br>
        Pin Code - ${customer.billing_pincode || ""}, ${customer.billing_country || "India"}<br>
        <b>State Code :</b> ${customer.billing_state ? "27" : "N/A"}<br>
        <b>GSTIN :</b> ${customer.gst || "N/A"}
      `;

      const shippingDetails = `
        ${customer.shipping_recipient_name || customer.customer_name || "N/A"}<br>
        ${customer.shipping_address1 || ""}${customer.shipping_address2 ? `<br>${customer.shipping_address2}` : ""}<br>
        ${customer.shipping_city || ""}, ${customer.shipping_state || ""} - ${customer.shipping_pincode || ""}<br>
        Pin Code - ${customer.shipping_pincode || ""}, ${customer.shipping_country || "India"}<br>
        <b>State Code :</b> ${customer.shipping_state ? "27" : "N/A"}<br>
        <b>GSTIN :</b> ${customer.gst || "N/A"}
      `;

      // Open print window with dynamic data
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
     <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=1222, user-scalable=no">

    <title>TAX INVOICE Exact Replica</title>
  

    <style>

        * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

        @page {
            size: 310mm 275mm;
            margin: 8mm;
        }

       body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* keep content top aligned */
  min-height: 100vh;
  padding: 20px; /* gives nice spacing around */
}

.invoice-containerone {
  background: white;
 
  width: 100%;
  
  max-width: 1000px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  display: flex;

  align-items: center;
  justify-content: center;

}
        .invoice-containerone {
            font-size: 0.85em;
            width: 100%;
            height: auto;
            background-color: #fff;
        
            box-sizing: border-box;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
 
  padding: 30px !important; /
        }

        .invoice-containertwo {
            border: 1px solid rgb(177, 177, 177);
            background-color: #fff;
            box-sizing: border-box;
            font-size: 0.85em;
             margin: 40px auto !important;
  
              width: 100%;
  box-sizing: border-box;
        }

 

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .font-7pt {
            font-size: 7pt;
        }

        .font-8pt {
            font-size: 8pt;
        }

        .font-9pt {
            font-size: 9pt;
        }

        .font-bold {
            font-weight: bold;
        }

        .border-1px {
            border: 1px solid #636363;
        }

        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }

        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 5px;
            padding-bottom: 5px;
        }

        .header-logo {
            width: 100px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content:space-between;
            font-size: 14pt;
            font-weight: bold;
            color: #041E42;
            
        }

        .header-logo span {
            font-size: 8pt;
            font-weight: normal;
            margin-left: 5px;
            color: #000000;
        }

        .header-title {
            text-align: center;
            flex-grow: 1;
            padding-top: 0px;
        }

        .header-title h4 {
            margin: 0;
            font-size: 9pt;
            font-weight: 800;
        }

        .header-title small {
            display: block;
            font-size: 7pt;
            font-weight: normal;
            margin-top: 2px;
            line-height: 1.3;
        }

        .top-details-box {
            display: flex;
            border: 1px solid gray;
            border-top: 4px solid rgb(0, 0, 0);
            line-height: 1;
            margin-bottom: 9;
            font-size: 7pt;
        }

        .top-details-col {
            width: 50%;
            padding: 0 2px;
            box-sizing: border-box;
            position: relative;

        }

        .detail-row {
            padding-top: 10px;
            display: flex;
            border-bottom: 1px solid transparent;
            padding: 2px 0;
        }

        .detail-label {
            width: 80px;
            font-weight: bold;
        }

        .detail-value {
            flex-grow: 1;
        }

        .detail-small-text {
            font-size: 7pt;
            padding-left: 70px;
            display: block;
        }


        .header-original {
            font-size: 8pt;
            font-weight: bold;
            text-align: right;
            margin-bottom: 3px;
            margin-top: 1px;
            margin-right: 80px;
        }

        .consignee-section {
            display: flex;
            border: 1px solid #696969;
            border-top: none;
            margin-bottom: -1px;
        }

        .consignee-col {
            width: 50%;
          
            min-height: 110px;
            padding: 5px;
            box-sizing: border-box;
        }



        .consignee-col:last-child {
            width: 40%;
            border-right: none;
        }


        .consignee-col p {
            margin: 0 0 2px 0;
            font-size: 7.8pt;
            line-height: 1.2;
        }

        .consignee-col .title {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 8pt;
        }

        .consignee-section {
            display: flex;
            position: relative;
        }

        .consignee-section::after {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            left: 51.8%;
            width: 1px;
            background: #8e8e8e;
        }

        .consignee-col {
            width: 52%;
            border-right: none;
        }

        .state-gstin-row {
            display: flex;
            border: 1px solid #757575;
            border-top: none;
            margin-bottom: -1px;
        }

        .state-gstin-col {
            width: 25%;
            border-right: 1px solid #797979;
            padding: 5px;
            box-sizing: border-box;
            font-size: 7.8pt;
        }

        .state-gstin-col:last-child {
            border-right: none;
        }

        .state-gstin-col p {
            margin: 0;
            line-height: 1.2;
        }

        .state-gstin-col .col-header {
            text-decoration: underline;
            margin-bottom: 2px;
            font-size: 8pt;
        }

        .place-of-supply {
            border: 1px solid #6e6e6e;
            border-top: none;
            padding: 2px 5px 5px;
            font-size: 7.8pt;
            margin-bottom: 0px;
        }
.items-table {
    text-align: center;
    width: 100%;
    margin: 0 auto; /* center table */
    border-collapse: collapse;
    font-size: 7rem;
    table-layout: fixed; /* required for wrapping to work properly */
    box-sizing: border-box;
}

/* 
        .items-table th,
        .items-table td {
            border: 1px solid #818181;
            padding: 2px 2px;
            text-align: center;
            vertical-align: center;
            height: 12px;
            line-height: 1.15;
        } */


        .items-table th,
.items-table td {
    border: 1px solid #818181;
    padding: 4px 8px;
    text-align: center;
    vertical-align: middle;
    white-space: nowrap; /* keep text on one line */
    overflow: visible; /* allow table to stretch */
}

        .items-table th {
            text-align: center;
            font-weight: bold;
            background-color: #ffffff;
            padding: 3px;
        }

        .items-table .col-sno {
            width: 3%;
            font-weight: bold;
        }

        .items-table .col-desc {
            width: 18%;
        }

        .items-table .col-hsn {
            width: 5%;
        }

        .items-table .col-qty {
            width: 4%;
        }

        .items-table .col-unit {
            width: 3%;
        }

        .items-table .col-rate {
            width: 4.3%;
        }

        .items-table .col-total-value {
            width: 6%;
        }

        .items-table .col-disc {
            width: 4%;
        }

        .items-table .col-taxable-value {
            width: 6%;
        }

        .items-table .col-tax-rate {
            width: 3.5%;
        }

        .items-table .col-tax-rs {
            width: 6%;

        }

        .items-table .col-igst-rs {
            width: 5.5%;
        }

        .items-table .col-total-rs {
            width: 6.5%;
        }

        .items-table .item-description {
            font-size: 7.5pt;
        }

        .total-row td {
            font-weight: bold;
            background-color: #fcfcfc;
            padding: 5px;
        }

        .total-row .col-label {
            text-align: right;
            border-right: none;
            font-weight: bold;
        }

        .empty-space-row {
            height: 0px;
        }

        .value-in-words-row,
        .reverse-charge-row {
            border: 1px solid #797979;
            border-top: none;
            padding: 2px;
            font-weight: bold;
            font-size: 7pt;
            margin-bottom: 0px;
        }

        .declaration-section {
            border: 1px solid #6d6d6d;
            padding: 3px;
            font-size: 8pt;
            min-height: 125px;
            margin-top: 0px;
            position: relative;
        }

        .declaration-section h5 {
            margin: 0 0 0px 0;
            font-weight: bold;
            font-size: 10pt;
            border-bottom: 2px solid #333333;
            padding-bottom: 2px;
            width: 85px;
        }

        .declaration-text {
            width:70%;
            float: left;
            line-height: 1.3;
           
        }

        .signature-box {
            width: 30%;
            float: right;
            text-align: center;
            padding-left: 10px;
            box-sizing: border-box;
            min-height: 95px;
            font-size: 8pt;
        }

        .signature-box .auth-sign {
            font-weight: bold;
            padding-top: 4px;
            display: block;
            margin-top: 50px;
        }

        .reg-address {
            position: absolute;
            bottom: 5px;
            left: 5px;
            right: 5px;
            font-size: 7.8pt;
            text-align: center;
            border-top: 1px solid #737373;
            padding-top: 8px;
            font-weight: bold;
        }

        .items-table,
.summary-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

/* Define consistent column widths across both tables */
.items-table th:nth-child(6),
.items-table td:nth-child(6),
.summary-table td:nth-child(6) {
  width: 100%; /* 👈 Disc column */
}

.items-table th:nth-child(7),
.items-table td:nth-child(7),
.summary-table td:nth-child(7) {
  width: 12%; /* 👈 Amount column */
}

/* Style consistency */
.items-table th, .items-table td,
.summary-table td {
  border: 1px solid #ccc;
  text-align: center;
  padding: 6px;
}

        @media screen and (max-width: 768px) {
            body {
                padding: 10px;
                background-color: #fff;
            }

            .invoice-containerone {
                width: 100%;
                height: auto;
                padding: 15px;
                box-shadow: none;
            }

            .invoice-containertwo {
                font-size: 0.75em;
            }

            .header-section {
                flex-direction: column;
                align-items: center;
                text-align: center;
            }

            .header-logo {
                margin-bottom: 10px;
            }

            .header-title h4 {
                font-size: 12pt;
            }

            .consignee-section {
                flex-direction: column;
            }

            .consignee-col {
                width: 100%;
                border-right: none;
                border-bottom: 1px solid #ccc;
            }

            .consignee-col:last-child {
                border-bottom: none;
            }

            .state-gstin-row {
                flex-wrap: wrap;
            }

            .state-gstin-col {
                width: 50%;
                font-size: 7pt;
            }

            .items-table {
                font-size: 6.5pt;
                display: block;
                white-space: nowrap;
            }

            .value-in-words-row,
            .reverse-charge-row {
                font-size: 7pt;
                text-align: left;
                display: block;
            
            }

            .declaration-section {
                font-size: 7pt;
            }

            .declaration-text,
            .signature-box {
                width: 80%;
                float: none;
                text-align: center;
                margin-bottom: 10px;
            }

            .reg-address {
                font-size: 8pt;
                position: static;
                border-top: none;
                padding-top: 5px;
            }
        }

        .total-row.bold-row td {
            font-weight: 800 !important;
            font-size: 6.5pt;
        }

.items-table {
    width: 100%;                 /* always fits container */
    border-collapse: collapse;
    table-layout: auto;          /* let columns adjust automatically */
    font-size: 7pt;
}

.items-table th,
.items-table td {
    border: 1px solid #818181;
    padding: 4px 6px;
    text-align: center;
    vertical-align: middle;
    word-wrap: break-word;       /* allow wrapping of long words */
    white-space: normal !important; /* override nowrap */
}

.items-table .col-desc {
    text-align: left;
    max-width: 250px;           /* limit description width */
    word-wrap: break-word;
}

.items-table .col-sno,
.items-table .col-hsn,
.items-table .col-qty,
.items-table .col-unit,
.items-table .col-rate,
.items-table .col-total-value,
.items-table .col-disc,
.items-table .col-taxable-value,
.items-table .col-tax-rate,
.items-table .col-tax-rs,
.items-table .col-igst-rs,
.items-table .col-total-rs {
    width: auto;                 /* flexible columns */
    white-space: nowrap;          /* keep numbers in one line */
}

.invoice-table{
      border-collapse: collapse;
  
}
      @media screen and (min-width: 1025px) {
            body {
                background-color: #f0f0f0;
            }

            .invoice-containerone {
                width: 1022px;
                height: 794px;
                font-size: 0.9em;
                padding: 50px;
            }

            .items-table {
                font-size: 7pt;
            }
        }

        @media screen and (max-width: 600px){
            .declaration-text p{
                font-size: 1rem;
            }
        }

     @media print {
 
        .consignee-section {
            display: flex;
            border: 1px solid #696969;
            border-top: none;
            margin-bottom: -1px;
        }

        .consignee-col {
            width: 50%;
            border-right: 1px solid #7d7d7d;
            min-height: 110px;
            padding: 5px;
            box-sizing: border-box;
        }


            .consignee-col:first-child {
            width: 51.8%;
            border-right: 1px solid #7d7d7d;
            min-height: 110px;
            padding: 5px;
            box-sizing: border-box;
        }

        .consignee-col:last-child {
            width: 40%;
            border-right: none;
        }


        .consignee-col p {
            margin: 0 0 2px 0;
            font-size: 7.8pt;
            line-height: 1.2;
        }

        .consignee-col .title {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 8pt;
        }

        .consignee-section {
            display: flex;
            position: relative;
        }

        .consignee-section::after {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            left: 52.1%;
            width: 1px;
            background: #8e8e8e;
        }

        .consignee-col {
            width: 52%;
            border-right: none;
        }



}

    </style>
</head>

<body>
    <div class="invoice-containerone">
        <div class="invoice-containertwo">
            <div class="header-section">
                <div class="header-logo">
                    <img  src=${ui} style="width: 230px; height: 160px; margin-top: -50px; margin-bottom: -70px;"
                        alt="Logo" />

                </div>
                <div class="header-title">
                    <h4>TAX INVOICE</h4>
                    <h4>for Supply of Goods/Services</h4>
                    <small class="font-bold small">[Section 31 of the CGST Act, 2017 read with Rule 1 of Revised Invoice
                        Rules, 2017]</small>
                </div>

            </div>
            <div class="top-details-box">

                <div class="top-details-col" style="position: relative;top: 9px;">
                    <div class="detail-row">
                        <span class="detail-label font-bold"></br />GSTIN</span><span class="detail-value"style="position: relative; right: 30px;"><b></br />:
                                27AKUPY6544R1ZM</b></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label font-bold">Name</span><span class="detail-value"style="position: relative; right: 30px;"><b>: Meraki
                                Expert</b></span>
                    </div>
                    <div class="detail-row" style="border-bottom: none; padding-bottom: 0;">
                        <span class="detail-label font-bold">PAN</span><span class="detail-value"style="position: relative; right: 30px;"><b>:
                                AKUPY6544R</b></span>
                    </div>
                    <span class="detail-small-text font-7pt"style="position: relative; right: 15px;">UDYAM-MH-20-0114278</span>
                </div>

                <div class="top-details-col" style="position: relative;left: 25px;">
                    <div class="header-original">Original for Recipient</div>
                    <div class="detail-row">
                        <span class="detail-label font-bold" style="font-weight: bold;">Invoice No.</span><span
                            class="detail-value"style="font-weight: 700;">: <b style="position: relative; left: 15px;"> ${invoiceData.invoice_number}</b></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label font-bold">Invoice Date</span><span class="detail-value"style="font-weight: 700;">:<b style="position: relative; left: 15px;">
                                ${invoiceData.invoice_date}</b></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label font-bold">Cust Order Date</span><span class="detail-value"style="font-weight: 700;">:
                           <span style="position: relative; left: 15px;"> ${invoiceData.expiry_date}</span></span>
                    </div>
                    <div class="detail-row" style="border-bottom: none;">
                        <span class="detail-label font-bold">PO Number</span><span class="detail-value" style="font-weight: 700;">:
                           <span style="position: relative; left: 15px;">${invoiceData.subject || "N/A"}</span> </span>
                    </div>
                </div>
            </div>


            <div class="consignee-section">
                <div class="consignee-col">
                    <p class="title font-bold">Details of Receiver (Billed to)</p>
                    <p><strong>Name:</strong> <b> ${customer.billing_recipient_name || customer.customer_name ||
                            "N/A"}</b></p>
                    <p><strong>Address :</strong> ${customer.billing_address1 || ""}${customer.billing_address2 }
                        <br>${customer.billing_address2} : ""}<br>
                        ${customer.billing_city || ""}, ${customer.billing_state || ""} - ${customer.billing_pincode ||
                        ""}<br>
                        Pin Code - ${customer.billing_pincode || ""}, ${customer.billing_country || "India"}<br>
                    </p><br>
                    <p><strong>State Code:</strong> <b> ${customer.billing_state ? "27" : "N/A"}</b></p>
                    <p><strong>GSTIN:</strong> <b> ${customer.gst || "N/A"}</b></p>
                    <p style="margin: 0; "><b>Place of Supply/Service</b>: Maharashtra</p>
                </div>
                <div class="consignee-col">
                    <p class="title font-bold">Details of Consignee (Shipped to)</p>
                    <p><strong>Name: </strong> <b> ${customer.shipping_recipient_name || customer.customer_name ||
                            "N/A"}</b></p>
                    <p><strong>Address:</strong> ${customer.shipping_address1 || ""}${customer.shipping_address2}
                        ${customer.shipping_address2} : ""}
                        ${customer.shipping_city || ""}, ${customer.shipping_state || ""} - ${customer.shipping_pincode
                        || ""}${customer.shipping_pincode || ""}, ${customer.shipping_country || "India"}</p><br>
                    <p><strong>State Code: </strong> <b> ${customer.shipping_state ? "27" : "N/A"}</b></p>
                    <p><strong>GSTIN : </strong><b> ${customer.gst || "N/A"}</b></p>
                </div>
            </div>


            <table class="items-table invoice-table">
                <thead>
                    <tr class="tax-header-row" style="font-weight: bold;">
                        <th class="col-sno" rowspan="2">S.No.</th>
                        <th class="col-desc" rowspan="2" style="text-align: left;">Description of Goods</th>
                        <th class="col-hsn" rowspan="2">HSN/SAC</th>
                        <th class="col-qty" rowspan="2">QTY</th>
                        <th class="col-unit" rowspan="2">Unit</th>
                        <th class="col-rate" rowspan="2">Rate</th>
                        <th class="col-total-value" rowspan="2">Total Value (Rs).</th>
                        <th class="col-disc" rowspan="2">Disc.</th>
                        <th class="col-taxable-value" rowspan="2">Taxable Value (Rs).</th>
                        <th colspan="2">CGST</th>
                        <th colspan="2">SGST</th>
                        <th colspan="2">IGST</th>
                        <th colspan="1">Total</th>
                    </tr>
                    <tr class="tax-sub-header-row">
                        <th class="col-tax-rate">Rate (%)</th>
                        <th class="col-tax-rs">Rs</th>
                        <th class="col-tax-rate">Rate (%)</th>
                        <th class="col-tax-rs">Rs</th>
                        <th class="col-tax-rate">Rate (%)</th>
                        <th class="col-tax-rs">Rs</th>
                        <th class="col-tax-rs">Rs</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map((item, index) => `
                    <tr>
                        <td class="col-sno text-center">${index + 1}</td>
                        <td class="col-desc item-description" style="text-align: left;">${item.item_detail}</td>
                        <td class="col-hsn text-center">${item.hsn_sac || '39259010'}</td>
                        <td class="col-qty text-right">${item.quantity}</td>
                        <td class="col-unit text-center">Sq.M</td>
                        <td class="col-rate text-right">${parseFloat(item.rate).toFixed(2)}</td>
                        <td class="col-total-value text-right">${(item.quantity * item.rate).toFixed(2)}</td>
                        <td class="col-disc text-center">${item.discount || '-'}</td>
                        <td class="col-taxable-value text-right">${item.amount.toFixed(2)}</td>
                        <td class="col-tax-rate text-right">9%</td>
                        <td class="col-tax-rs text-right">${(item.amount * 0.09).toFixed(2)}</td>
                        <td class="col-tax-rate text-right">9%</td>
                        <td class="col-tax-rs text-right">${(item.amount * 0.09).toFixed(2)}</td>
                        <td class="col-tax-rate text-right">0%</td>
                        <td class="col-igst-rs text-right">0.00</td>
                        <td class="col-total-rs text-right">${(item.amount + item.amount * 0.18).toFixed(2)}</td>
                    </tr>
                    `).join('')}
                    <!-- <tr class="empty-space-row">
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                    </tr> -->
                    <tr class="total-row bold-row">
                        <td colspan="8" class="col-label"></td>
                        <td class="col-taxable-value text-right">${sub_total.toFixed(2)}</td>
                        <td class="col-tax-rate"></td>
                        <td class="col-tax-rs text-right">${cgst.toFixed(2)}</td>
                        <td class="col-tax-rate"></td>
                        <td class="col-tax-rs text-right">${sgst.toFixed(2)}</td>
                        <td class="col-tax-rate"></td>
                        <td class="col-igst-rs text-right">0.00</td>
                        <td class="col-total-rs text-right">${grand_total.toFixed(2)}</td>
                    </tr>

                    <tr class="total-row bold-row">
                        <td colspan="8" class="col-label" style="border-right: 1px solid #6b6b6b;">Add: Freight</td>
                        <td class="col-taxable-value text-right">0.00</td>
                        <td class="col-tax-rate"></td>
                        <td class="col-tax-rs text-right">0.00</td>
                        <td class="col-tax-rate"></td>
                        <td class="col-tax-rs text-right">0.00</td>
                        <td class="col-tax-rate"></td>
                        <td class="col-igst-rs text-right">0.00</td>
                        <td class="col-total-rs text-right">0.00</td>
                    </tr>

                    <tr class="total-row bold-row">
                        <td colspan="8" class="col-label" style="border-right: 1px solid #777777;">Sub Total</td>
                        <td class="col-taxable-value text-right">${sub_total.toFixed(2)}</td>
                        <td class="col-tax-rate"></td>
                        <td class="col-tax-rs text-right">${cgst.toFixed(2)}</td>
                        <td class="col-tax-rate"></td>
                        <td class="col-tax-rs text-right">${sgst.toFixed(2)}</td>
                        <td class="col-tax-rate"></td>
                        <td class="col-igst-rs text-right">0.00</td>
                        <td class="col-total-rs text-right">${grand_total.toFixed(2)}</td>
                    </tr>

                  <tr class="total-row">
  <!-- Column 1: up to Discount -->
  <td colspan="8" class="col-label text-right">
    <b>Grand Total (Inclusive of GST)</b>
  </td>

  <!-- Column 2: IGST -->
  <td colspan="7" class="col-igst text-center">
    <b></b>
  </td>

  <!-- Column 3: Final Total -->
  <td class="col-total-rs text-center">
    <b>₹${grand_total.toFixed(2)}</b>
  </td>
</tr>

 <tr class="total-row">
  <!-- Column 1: up to Discount -->
  <td colspan="8" class="col-label text-right">
    <b>Invoice Value (In words):</b>
  </td>

  <!-- Column 2: IGST -->
  <td colspan="8" class="col-igst text-center">
    <b>${numberToWords(grand_total)}</b>
  </td>
</tr>
 <tr class="total-row">
  <!-- Column 1: up to Discount -->
  <td colspan="8" class="col-label text-right">
    <b>Whether Tax is payable on Reverse Charge:</b>
  </td>

  <!-- Column 2: IGST -->
  <td colspan="8" class="col-igst text-center">
    <b>No</b>
  </td>
</tr>

                </tbody>
            </table>

          
           

            <div class="declaration-section clearfix">
                <h5>Declaration :</h5>
                <div class="declaration-text">
                    <p style="margin: 0; font-size: 8.5pt; ">Certified that the particulars given above are true and correct and the amount indicated represents </p>
                    <p style="margin: 0; font-size: 8.5pt; ">represents the Price actually charged and that thereis no f low of additional consideration directly</p>
                    <p style="margin: 0; font-size: 8.5pt; ">or indirectly from the Receiver [Buyer].</p>
                </div>
                <div class=" signature-box">
                    <p class="font-8pt text-right" style="margin: 0; padding-right: 100px;margin-top: -15px;"> <b>For
                            MERAKI
                            EXPERT</b></p>

                    <img src="new.png" style="width: 90px; height: 70px;  margin-bottom: -60px;" alt="Logo" />


                    <span class="auth-sign">Authorized Signatory</span>
                </div>

                <div class="reg-address">
                    Registered Address: Prabhag No. 5, Ganesh Chowk, Deori, Dist.-Gondia. 441901 | www.merrakiexpert.in
                    | P: 7722001802; 9130801011
                </div>
            </div>

        </div>
    </div>
</body>

</html>


      `);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handlePrintInvoice = (invoice) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TAX INVOICE Exact Replica</title>
    <style>
        /* ========================================================================= */
        /* BASE LAYOUT - A4 LANDSCAPE SIMULATION (Approx. 1122px x 794px at 96 DPI) */
        /* ========================================================================= */
         @page {
  size: 310mm 230mm;   /* width x height */
  margin: 8mm;
}

        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 10px;
        }

        .invoice-container {
            /* A4 Landscape dimensions at typical screen resolution (96dpi) */
            width: 1122px; /* ~29.7 cm */
            height: 794px;  /* ~21.0 cm */
            background-color: #fff;
            padding: 15px;
            box-sizing: border-box;
            /* REMOVED: Outer border around the whole page */
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.2); 
            font-size: 10pt;
            position: relative;
        }

        /* Utility Classes */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-7pt { font-size: 7pt; }
        .font-8pt { font-size: 8pt; }
        .font-9pt { font-size: 9pt; }
        .font-bold { font-weight: bold; }
        .border-1px { border: 1px solid #000; }
        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }

        /* ========================================================================= */
        /* HEADER SECTION */
        /* ========================================================================= */
        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 5px;
        }
        .header-logo {
            width: 300px;
            height: 30px;
            display: flex;
            align-items: center;
            font-size: 14pt;
            font-weight: bold;
            color: #041E42;
        }
        .header-logo span {
             font-size: 8pt;
             font-weight: normal;
             margin-left: 5px;
             color: #9C1F37;
        }
        .header-title {
            text-align: center;
            flex-grow: 1;
            padding-top: 5px;
        }
        .header-title h4 {
            margin: 0;
            font-size: 11pt;
            letter-spacing: 0.5px;
            font-weight: 900;
        }
        .header-title small {
            display: block;
            font-size: 8pt;
            margin-top: 2px;
            line-height: 1.3;
        }
        .header-original {
            font-size: 9pt;
            font-weight: bold;
            width: 150px;
            text-align: right;
            padding-top: 10px;
        }
        
        /* ========================================================================= */
        /* TOP DETAIL BOXES (GSTIN, Invoice No.) */
        /* ========================================================================= */
        .top-details-box {
            display: flex;
            border: 1px solid #040000ff;
            line-height: 1.3;
            margin-bottom: -1px;
            font-size: 9pt;
        }
        .top-details-col {
            width: 50%;
            border-right: 1px solid #ffffffff;
            box-sizing: border-box;
            padding: 0 5px;
        }
        .top-details-col:last-child {
            border-right: none;
        }
        .detail-row {
            display: flex;
            border-bottom: 1px solid #ffffffff;
            padding: 1px 0;
        }
        /* REMOVED: border-bottom on the last row of the first column (where UDYAM text sits) */
        .detail-label {
            width: 80px; 
            font-weight: bold;
        }
        .detail-value {
            flex-grow: 1;
        }
        .detail-small-text {
            font-size: 7pt;
            padding-left: 80px; 
            display: block;
        }

        /* ========================================================================= */
        /* CONSIGNEE/BILLED TO SECTION */
        /* ========================================================================= */
        .consignee-section {
            display: flex;
            border: 1px solid #000;
            border-top: none;
            margin-bottom: -1px;
        }
        .consignee-col {
            width: 50%;
            border-right: 1px solid #000;
            min-height: 110px;
            padding: 5px;
            box-sizing: border-box;
        }
        .consignee-col:last-child {
            border-right: none;
        }
        .consignee-col p {
            margin: 0 0 2px 0;
            font-size: 9pt;
            line-height: 1.3;
        }
        .consignee-col .title {
            font-weight: bold;
            margin-bottom: 5px;
        }

        /* ========================================================================= */
        /* STATE/GSTIN ROW & PLACE OF SUPPLY */
        /* ========================================================================= */
        .state-gstin-row {
            display: flex;
            border: 1px solid #000;
            border-top: none;
            margin-bottom: -1px;
        }
        .state-gstin-col {
            width: 25%;
            border-right: 1px solid #000;
            padding: 5px;
            box-sizing: border-box;
            font-size: 9pt;
        }
        .state-gstin-col:last-child {
            border-right: none;
        }
        .state-gstin-col p {
            margin: 0;
            line-height: 1.3;
        }
        .state-gstin-col .col-header {
            text-decoration: underline;
            margin-bottom: 2px;
        }
        .place-of-supply {
            border: 1px solid #000;
            border-top: none;
            padding: 2px 5px 5px;
            font-size: 9pt;
            margin-bottom: 5px;
        }
        
        /* ========================================================================= */
        /* ITEMS TABLE */
        /* ========================================================================= */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
            table-layout: fixed;
        }
        .items-table th, .items-table td {
            border: 1px solid #000;
            padding: 3px 5px;
            text-align: left;
            vertical-align: top;
            height: 18px;
            line-height: 1.2;
        }
        .items-table th {
            text-align: center;
            font-weight: bold;
            background-color: #f7f7f7;
            padding: 4px;
        }
        /* Column Widths (Tuned) */
        .items-table .col-sno { width: 3%; }
        .items-table .col-desc { width: 18%; }
        .items-table .col-hsn { width: 5%; }
        .items-table .col-qty { width: 4%; }
        .items-table .col-unit { width: 3%; }
        .items-table .col-rate { width: 4.3%; }
        .items-table .col-total-value { width: 6%; }
        .items-table .col-disc { width: 4%; }
        .items-table .col-taxable-value { width: 6%; }
        .items-table .col-tax-rate { width: 3.5%; }
        .items-table .col-tax-rs { width: 6%; }
        .items-table .col-igst-rs { width: 5.5%; }
        .items-table .col-total-rs { width: 6.5%; }

        .items-table .item-description {
            font-size: 7.5pt;
        }
        /* Footer Rows */
        .total-row td {
            font-weight: bold;
            background-color: #fcfcfc;
            padding: 5px;
        }
        .total-row .col-label {
            text-align: right;
            border-right: none;
        }
        .empty-space-row {
            height: 30px;
        }

        /* ========================================================================= */
        /* BOTTOM SECTIONS */
        /* ========================================================================= */
        .value-in-words-row, .reverse-charge-row {
            border: 1px solid #000;
            border-top: none;
            padding: 5px;
            font-weight: bold;
            font-size: 9pt;
        }
        .declaration-section {
            position: absolute;
            bottom: 15px;
            left: 15px;
            right: 15px;
            border: 1px solid #000;
            padding: 5px;
            font-size: 9pt;
            height: 120px;
        }
        .declaration-section h5 {
            margin: 0 0 5px 0;
            font-weight: bold;
            font-size: 10pt;
            border-bottom: 1px solid #000;
            padding-bottom: 2px;
        }
        .declaration-text {
            width: 60%;
            float: left;
            line-height: 1.4;
        }
        .signature-box {
            width: 38%;
            float: right;
            text-align: center;
            border-left: 1px solid #000;
            padding-left: 10px;
            box-sizing: border-box;
            height: 90px;
        }
        /* Refined signature line: uses margin-top to create the space, and border-top on the text */
        .signature-box .auth-sign {
            font-weight: bold;
            border-top: 1px solid #000;
            padding-top: 2px;
            display: block;
            margin-top: 55px; /* Pushes text down to create signature space above the line */
        }
        .reg-address {
            position: absolute;
            bottom: 5px;
            left: 5px;
            right: 5px;
            font-size: 7pt;
            text-align: center;
            border-top: 1px solid #000;
            padding-top: 2px;
        }
    </style>
</head>
<body>

<div class="invoice-container">
    <div class="header-section">
        <div class="header-logo">
                                <img src= "${ui}" style="width: 250px; height: auto; margin-top: -70px; margin-bottom: -70px;" alt="Logo" />

        </div>
        <div class="header-title">
            <h4>TAX INVOICE</h4>
            <small>for Supply of Goods/Services</small>
            <small class="font-bold">[Section 31 of the CGST Act, 2017 read with Rule 1 of Revised Invoice Rules, 2017]</small>
        </div>
        <div class="header-original">
            Original for Recipient
        </div>
    </div>

    <div class="top-details-box">
        <div class="top-details-col">
            <div class="detail-row">
               <span class="detail-label font-bold">GSTIN</span><span class="detail-value">:<b> 27AKUPY6544R1ZM</b></span>
            </div>
            <div class="detail-row">
                <span class="detail-label font-bold">Name</span><span class="detail-value">:<b> Meraki Expert</b></span>
            </div>
            <div class="detail-row" style="border-bottom: none; padding-bottom: 0;">
               <span class="detail-label font-bold">PAN</span><span class="detail-value">:<b> AKUPY6544R </b></span>
            </div>
            <span class="detail-small-text font-7pt" style="margin-bottom: 2px; margin-right: 10px;">UDYAM-MH-20-0114278</span>
        </div>
        <div class="top-details-col">
            <div class="detail-row">
                <span class="detail-label font-bold">Invoice No.</span><span class="detail-value">:<b> ΜΕ/2025-26/023</b></span>
            </div>
            <div class="detail-row">
                <span class="detail-label font-bold">Invoice Date</span><span class="detail-value">:<b> 11.05.2025</b></span>
            </div>
            <div class="detail-row">
                <span class="detail-label font-bold">Cust Order Date</span><span class="detail-value">: 31.01.2025</span>
            </div>
            <div class="detail-row" style="border-bottom: none;">
                <span class="detail-label font-bold">PO Number</span><span class="detail-value">: JUPL/2025/09</span>
            </div>
        </div>
    </div>

    <div class="consignee-section">
        <div class="consignee-col">
            <p class="title font-bold">Details of Receiver (Billed to)</p>
            <p><strong>Name</strong> : <b>JUST UNIVERSAL PVT. LTD.</b></p>
            <p><strong>Address</strong> : Kh. No. 101/1, 101/2, 102, Kapsi Budruk, Tah. Kamptee, Nagpur - 441104. Pin Code-441104, Maharashtra</p>
            <p><strong>State Code</strong> : <b> 27</b></p>
            <p><strong>GSTIN</strong> : <b>  27AAFCJ1515K1ZL</b></p>
        </div>
        <div class="consignee-col">
            <p class="title font-bold">Details of Consignee (Shipped to)</p>
            <p><strong>Name</strong> : <b>JUST UNIVERSAL PVT. LTD.</b></p>
            <p><strong>Address</strong> : Kh. No. 101/1, 101/2, 102, Kapsi Budruk, Tah. Kamptee, Nagpur-441104. Pin Code-441104, Maharashtra</p>
            <p><strong>State Code</strong> : <b> 27</b></p>
            <p><strong>GSTIN</strong> : <b>  27AAFCJ1515K1ZL</b></p>
        </div>
    </div>

    <div class="state-gstin-row">
        
    </div>
    <div class="place-of-supply border-1px" style="border-top: none; margin-top: -1px;">
        <p style="margin: 0;"><strong>Place of Supply/Service</strong>: Maharashtra</p>
    </div>

    <table class="items-table">
        <thead>
            <tr class="tax-header-row">
                <th class="col-sno" rowspan="2">S.No.</th>
                <th class="col-desc" rowspan="2">Description of Goods</th>
                <th class="col-hsn" rowspan="2">HSN/SAC</th>
                <th class="col-qty" rowspan="2">QTY</th>
                <th class="col-unit" rowspan="2">Unit</th>
                <th class="col-rate" rowspan="2">Rate</th>
                <th class="col-total-value" rowspan="2">Total Value (Rs).</th>
                <th class="col-disc" rowspan="2">Disc.</th>
                <th class="col-taxable-value" rowspan="2">Taxable Value (Rs).</th>
                <th colspan="2">CGST</th>
                <th colspan="2">SGST</th>
                <th colspan="2">IGST</th>
                <th class="col-total-rs" rowspan="2">Total Rs</th>
            </tr>
            <tr class="tax-sub-header-row">
                <th class="col-tax-rate">Rate (%)</th>
                <th class="col-tax-rs">Rs</th>
                <th class="col-tax-rate">Rate (%)</th>
                <th class="col-tax-rs">Rs</th>
                <th class="col-tax-rate">Rate (%)</th>
                <th class="col-tax-rs">Rs</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="col-sno text-center">1</td>
                <td class="col-desc item-description">
                    Supply of Kingspan Jindal Contineous Line, 50 mm THK PUR Wall Panel Both Side 0.5 mm PPGL-300Mpa SMP-AZ 150 GSM (RAL9002) Plain Lamination - Density: 40 (+-2) Kg/cum. Panel Cover Width:1000MM
                </td>
                <td class="col-hsn text-center">39259010</td>
                <td class="col-qty text-right">680.250</td>
                <td class="col-unit text-center">Sq.M</td>
                <td class="col-rate text-right">1430.00</td>
                <td class="col-total-value text-right">9,72,757.50</td>
                <td class="col-disc text-center">-</td>
                <td class="col-taxable-value text-right">9,72,757.500.</td>
                <td class="col-tax-rate text-right">9%</td>
                <td class="col-tax-rs text-right">87,548.18</td>
                <td class="col-tax-rate text-right">9%</td>
                <td class="col-tax-rs text-right">87,548.18</td>
                <td class="col-tax-rate text-right">0%</td>
                <td class="col-igst-rs text-right">0</td>
                <td class="col-total-rs text-right">11,47,853.85</td>
            </tr>
            <tr class="empty-space-row">
                <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
            </tr>
            <tr class="total-row">
                <td colspan="8" class="col-label"></td>
                <td class="col-taxable-value text-right">9,72,757.50</td>
                <td class="col-tax-rate"></td>
                <td class="col-tax-rs text-right">87,548.18</td>
                <td class="col-tax-rate"></td>
                <td class="col-tax-rs text-right">87,548.18</td>
                <td class="col-tax-rate"></td>
                <td class="col-igst-rs text-right">0.00</td>
                <td class="col-total-rs text-right">11,47,853.85</td>
            </tr>
            <tr class="total-row">
                <td colspan="8" class="col-label" style="border-right: 1px solid #000;">Add: Freight</td>
                <td class="col-taxable-value text-right">${(invoice.freight || 0).toFixed(2)}</td>
                <td class="col-tax-rate"></td>
                <td class="col-tax-rs text-right">0.00</td>
                <td class="col-tax-rate"></td>
                <td class="col-tax-rs text-right">0.00</td>
                <td class="col-tax-rate"></td>
                <td class="col-igst-rs text-right">0.00</td>
                <td class="col-total-rs text-right">${(invoice.freight || 0).toFixed(2)}</td>
            </tr>
            <tr class="total-row">
                <td colspan="8" class="col-label" style="border-right: 1px solid #000;">Sub Total</td>
                <td class="col-taxable-value text-right"><b>9,72,757.50</b></td>
                <td class="col-tax-rate"></td>
                <td class="col-tax-rs text-right">87,548.18</td>
                <td class="col-tax-rate"></td>
                <td class="col-tax-rs text-right">87,548.18</td>
                <td class="col-tax-rate"></td>
                <td class="col-igst-rs text-right"><b>0.00</b></td>
                <td class="col-total-rs text-right">11,47,853.85</td>
            </tr>
            <tr class="total-row">
                <td colspan="15" class="col-label" style="text-align: right; border-right: 1px solid #000;"><b>Grand Total (Inclusive of GST)</b></td>
                <td class="col-total-rs text-right">11,47,854</td>
            </tr>
        </tbody>
    </table>

    <div class="value-in-words-row" style="margin-top: 5px;">
        <p style="margin: 0;"><strong>Invoice Value (In words):</strong> Eleven Lac Fourty Seven Thausand Eight Hundred and Fifty Four Rupees only</p>
    </div>

    <div class="reverse-charge-row">
        <p style="margin: 0; display: inline-block;"><strong>Whether Tax is payable on Reverse Charge</strong> :</p>
        <p style="margin: 0; display: inline-block; float: right; padding-right: 5px;">No</p>
    </div>

    <div class="declaration-section clearfix">
        <h5>Declaration :</h5>
        <div class="declaration-text">
            <p style="margin: 0; font-size: 8.5pt; line-height: 1.4;">Certified that the particulars given above are true and correct and the amount indicated represents represents the Price actually charged and that there is no flow of additional consideration directly or indirectly from the Receiver [Buyer].</p>
        </div>
        <div class="signature-box">
            <p class="font-8pt text-right" style="margin: 0; padding-right: 10px;">For MERAKI EXPERT</p>
            <span class="auth-sign">Authorized Signatory</span>
        </div>
        
        <div class="reg-address">
            Registered Address: Prabhag No. 5, Ganesh Chowk, Deori, Dist.-Gondia. 441901 | www.merrakiexpert.in | P: 7722001802; 9130801011
        </div>
    </div>

</div>

</body>
</html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSendEmail = (invoice) => {
    const subject = encodeURIComponent(`Invoice ${invoice.id}`);
    const body = encodeURIComponent(
      `Hi,\n\nHere are your invoice details:\nInvoice #: ${invoice.id}\nCustomer: ${invoice.customer}\nAmount: ${invoice.amount}\nDue Date: ${invoice.dueDate}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareLink = (invoice) => {
    navigator.clipboard.writeText(`https://dummy-invoice-link/${invoice.id}`);
    alert("Invoice link copied to clipboard!");
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (selectedFilter === "All Invoices") return true;
    if (selectedFilter === "Sent Invoices") return invoice.status === "Paid";
    if (selectedFilter === "Draft Invoices") return invoice.status === "Draft";
    if (selectedFilter === "Pro Forma Invoices") return invoice.status === "Partial";
    return true;
  }).filter(invoice =>
    !searchTerm ||
    invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flex: 1, bgcolor: "#f9fafc", minHeight: "100vh" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, mt: 1, px: 3 }}>
          <Typography color="text.secondary" fontSize="20px">Invoice</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Paper elevation={0} sx={{
              display: "flex", alignItems: "center", px: 1.5, py: 0.5, borderRadius: "999px",
              border: "1px solid #e0e0e0", bgcolor: "#f9fafb", width: 240,
            }}>
              <SearchIcon sx={{ fontSize: 20, color: "#999" }} />
              <InputBase
                placeholder="Search anything here..."
                sx={{ ml: 1, fontSize: 14, flex: 1 }}
                inputProps={{ "aria-label": "search" }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </Paper>
            <IconButton sx={{
              borderRadius: "12px", border: "1px solid #e0e0e0", bgcolor: "#f9fafb", p: 1,
            }}>
              <NotificationsNoneIcon sx={{ fontSize: 20, color: "#666" }} />
            </IconButton>
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar src="https://i.pravatar.cc/150?img=1" />
              <Typography fontSize={14}>Admin name</Typography>
              <ArrowDropDownIcon />
            </Box>
          </Box>
        </Box>

        <Box sx={{ px: 2, py: 2 }}>
          <Paper sx={{ p: 1, borderRadius: 2 }}>
            <Box sx={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              px: 4, py: 2, borderBottom: "1px solid #e0e0e0",
            }}>
              <Typography variant="h6" fontWeight={600}>Invoice</Typography>
              <Button variant="contained" sx={{
                backgroundColor: "#004085", color: "#fff", fontWeight: 600,
                textTransform: "none", borderRadius: "10px", px: 2.5,
                "&:hover": { backgroundColor: "#003366" },
              }} onClick={handleNewInvoice}>+ New Invoice</Button>
            </Box>

            <Box sx={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              px: 3, py: 1.5, borderBottom: "1px solid #e0e0e0", borderRadius: 1, mb: 2,
            }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                {["All Invoices", "Sent Invoices", "Draft Invoices", "Pro Forma Invoices"].map((label, i) => (
                  <Button
                    key={i}
                    onClick={() => setSelectedFilter(label)}
                    variant={selectedFilter === label ? "contained" : "outlined"}
                    sx={{
                      backgroundColor: selectedFilter === label ? "#004085" : "transparent",
                      borderColor: "#cfd8dc", color: selectedFilter === label ? "#fff" : "#333",
                      fontWeight: 500, textTransform: "none", borderRadius: "20px", px: 2, height: 36,
                      "&:hover": { backgroundColor: selectedFilter === label ? "#003366" : "#f5f5f5" },
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Box>

              <TextField
                size="small"
                placeholder="Search by invoice no, customer name..."
                InputProps={{
                  endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment>,
                  sx: { bgcolor: "#f9f9f9", borderRadius: "20px", px: 1 },
                }}
                sx={{ width: 300 }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </Box>

            <Paper sx={{ overflow: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox"><Checkbox /></TableCell>
                    <TableCell>Invoice#</TableCell>
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Created Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Bill Amount</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInvoices.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell padding="checkbox"><Checkbox /></TableCell>
                      <TableCell sx={{ color: "#0061F2", fontWeight: 500 }}>{row.invoice_number}</TableCell>
                      <TableCell>{row.customer_name}</TableCell>
                      <TableCell>{row.invoice_date}</TableCell>
                      <TableCell>{row.expiry_date}</TableCell>
                      <TableCell><Chip label={row.status} color={statusColor[row.status]} size="small" /></TableCell>
                      <TableCell>{row.grand_total ? `₹${row.grand_total}` : ''}</TableCell>
                      <TableCell align="center">
                        <IconButton onClick={(e) => handleMenuOpen(e, index)}><MoreVertIcon /></IconButton>
                        {menuIndex === index && (
                          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ sx: { width: 200 } }}>
                            <MenuItem onClick={() => handleEditInvoice(row.invoice_id)}><EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit</MenuItem>
                            <MenuItem onClick={() => handleDownloadPdf(row)}><PictureAsPdfIcon fontSize="small" sx={{ mr: 1 }} /> Download the PDF</MenuItem>
                            <MenuItem onClick={() => handleDownloadPdf(row)}><PrintIcon fontSize="small" sx={{ mr: 1 }} /> Print Invoice</MenuItem>
                            <MenuItem onClick={() => handleSendEmail(row)}><EmailIcon fontSize="small" sx={{ mr: 1 }} /> Send Email</MenuItem>
                            <MenuItem onClick={() => handleShareLink(row)}><ShareIcon fontSize="small" sx={{ mr: 1 }} /> Share Link</MenuItem>
                            <MenuItem onClick={async () => {
                              try {
                                await axios.patch(`${BASE_URL}/invoice/${row.invoice_id}/status`, { status: 'Paid' });
                                setInvoices(prev => prev.map(inv => inv.invoice_id === row.invoice_id ? { ...inv, status: 'Paid' } : inv));
                                handleMenuClose();
                              } catch (error) {
                                console.error('Error updating status:', error);
                                alert('Failed to update invoice status');
                              }
                            }}>Mark as Paid</MenuItem>
                            <MenuItem onClick={async () => {
                              try {
                                await axios.patch(`${BASE_URL}/invoice/${row.invoice_id}/status`, { status: 'Partial' });
                                setInvoices(prev => prev.map(inv => inv.invoice_id === row.invoice_id ? { ...inv, status: 'Partial' } : inv));
                                handleMenuClose();
                              } catch (error) {
                                console.error('Error updating status:', error);
                                alert('Failed to update invoice status');
                              }
                            }}>Mark as Partial</MenuItem>
                            <MenuItem onClick={async () => {
                              try {
                                await axios.patch(`${BASE_URL}/invoice/${row.invoice_id}/status`, { status: 'Draft' });
                                setInvoices(prev => prev.map(inv => inv.invoice_id === row.invoice_id ? { ...inv, status: 'Draft' } : inv));
                                handleMenuClose();
                              } catch (error) {
                                console.error('Error updating status:', error);
                                alert('Failed to update invoice status');
                              }
                            }}>Mark as Draft</MenuItem>
                          </Menu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
