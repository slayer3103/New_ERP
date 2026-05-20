import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import ShareIcon from "@mui/icons-material/Share";
import EmailIcon from "@mui/icons-material/Email";
import { useNavigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import PageHeader from "../components/common/PageHeader";
import SearchField from "../components/common/SearchField";
import DataTable from "../components/common/DataTable";
import StatusChip from "../components/common/StatusChip";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { tokens } from "../theme/paletteTokens";
import axios from 'axios';
import ui from "../assets/mera.png";
import BASE_URL from '../config/api';
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

  const handleMenuOpen = (event, invoiceId) => {
    setAnchorEl(event.currentTarget);
    setMenuIndex(invoiceId);
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

  const invoiceColumns = [
    {
      id: 'invoice_number',
      label: 'Invoice#',
      render: (row) => (
        <Typography variant="body2" sx={{ color: tokens.primary, fontWeight: 600 }}>
          {row.invoice_number}
        </Typography>
      ),
    },
    { id: 'customer_name', label: 'Customer Name', accessor: 'customer_name' },
    { id: 'invoice_date', label: 'Created Date', accessor: 'invoice_date' },
    { id: 'expiry_date', label: 'Due Date', accessor: 'expiry_date' },
    {
      id: 'status',
      label: 'Status',
      render: (row) => <StatusChip status={row.status} />,
    },
    {
      id: 'grand_total',
      label: 'Bill Amount',
      render: (row) => (row.grand_total ? `₹${row.grand_total}` : '—'),
    },
    {
      id: 'actions',
      label: 'Action',
      align: 'center',
      render: (row) => (
        <>
          <IconButton size="small" onClick={(e) => handleMenuOpen(e, row.invoice_id)}>
            <MoreVertIcon />
          </IconButton>
          {menuIndex === row.invoice_id && (
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{ sx: { width: 200 } }}
            >
              <MenuItem onClick={() => handleEditInvoice(row.invoice_id)}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
              </MenuItem>
              <MenuItem onClick={() => handleDownloadPdf(row)}>
                <PictureAsPdfIcon fontSize="small" sx={{ mr: 1 }} /> Download the PDF
              </MenuItem>
              <MenuItem onClick={() => handleDownloadPdf(row)}>
                <PrintIcon fontSize="small" sx={{ mr: 1 }} /> Print Invoice
              </MenuItem>
              <MenuItem onClick={() => handleSendEmail(row)}>
                <EmailIcon fontSize="small" sx={{ mr: 1 }} /> Send Email
              </MenuItem>
              <MenuItem onClick={() => handleShareLink(row)}>
                <ShareIcon fontSize="small" sx={{ mr: 1 }} /> Share Link
              </MenuItem>
              <MenuItem
                onClick={async () => {
                  try {
                    await axios.patch(`${BASE_URL}/invoice/${row.invoice_id}/status`, { status: 'Paid' });
                    setInvoices((prev) =>
                      prev.map((inv) =>
                        inv.invoice_id === row.invoice_id ? { ...inv, status: 'Paid' } : inv
                      )
                    );
                    handleMenuClose();
                  } catch (err) {
                    console.error('Error updating status:', err);
                    alert('Failed to update invoice status');
                  }
                }}
              >
                Mark as Paid
              </MenuItem>
              <MenuItem
                onClick={async () => {
                  try {
                    await axios.patch(`${BASE_URL}/invoice/${row.invoice_id}/status`, { status: 'Partial' });
                    setInvoices((prev) =>
                      prev.map((inv) =>
                        inv.invoice_id === row.invoice_id ? { ...inv, status: 'Partial' } : inv
                      )
                    );
                    handleMenuClose();
                  } catch (err) {
                    console.error('Error updating status:', err);
                    alert('Failed to update invoice status');
                  }
                }}
              >
                Mark as Partial
              </MenuItem>
              <MenuItem
                onClick={async () => {
                  try {
                    await axios.patch(`${BASE_URL}/invoice/${row.invoice_id}/status`, { status: 'Draft' });
                    setInvoices((prev) =>
                      prev.map((inv) =>
                        inv.invoice_id === row.invoice_id ? { ...inv, status: 'Draft' } : inv
                      )
                    );
                    handleMenuClose();
                  } catch (err) {
                    console.error('Error updating status:', err);
                    alert('Failed to update invoice status');
                  }
                }}
              >
                Mark as Draft
              </MenuItem>
            </Menu>
          )}
        </>
      ),
    },
  ];

  if (loading) {
    return (
      <AppLayout title="Invoices">
        <LoadingState message="Loading invoices..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Invoices">
        <ErrorState message={error} />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Invoices">
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader title="All Invoices" count={filteredInvoices.length}>
          <Button variant="contained" sx={{ textTransform: 'none' }} onClick={handleNewInvoice}>
            + New Invoice
          </Button>
        </PageHeader>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {['All Invoices', 'Sent Invoices', 'Draft Invoices', 'Pro Forma Invoices'].map((label) => (
              <Button
                key={label}
                onClick={() => setSelectedFilter(label)}
                variant={selectedFilter === label ? 'contained' : 'outlined'}
                sx={{ textTransform: 'none', borderRadius: 5, px: 2, height: 36 }}
              >
                {label}
              </Button>
            ))}
          </Box>
          <SearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by invoice no, customer..."
            debounceMs={200}
            width={{ xs: '100%', sm: 300 }}
          />
        </Box>

        <DataTable
          columns={invoiceColumns}
          rows={filteredInvoices}
          rowKey="invoice_id"
          getRowId={(row) => row.invoice_id}
          emptyMessage="No invoices found"
        />
      </Paper>
    </AppLayout>
  );
}
