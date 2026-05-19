import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Pagination,
  Checkbox,
  TextField,
  Avatar,
  Paper,
  InputBase,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Sidebar from "./Sidebar";
import AddIcon from "@mui/icons-material/Add";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import UserMenu from "./UserMenu";
import ui from '../assets/mera.png';
import BASE_URL from '../config/api';

export default function QuotationListPage() {
  const navigator = useNavigate();
  const [tab, setTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Company details for PDF
  const [gstin, setGstin] = useState("27AAJCM9223E1ZX");
  const [udyam, setUdyam] = useState("UDYAM-MH-33-0039389");
  const [iso, setIso] = useState("ISO 9001:2015");
  const [merakiExpert, setMerakiExpert] = useState("Meraki Expert Team");
  const [customerEmail, setCustomerEmail] = useState("customer@example.com");
  const [merakiEmail, setMerakiEmail] = useState("info@merakiexpert.com");

  React.useEffect(() => {
    const fetchQuotations = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${BASE_URL}/quotation`);
        setQuotations(res.data);
      } catch (err) {
        setError("Failed to fetch quotations");
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, []);

  // Download PDF
  

   const handlePrintQuotation = async () => {
  if (!selectedQuote) return;
  try {
    const res = await axios.get(`${BASE_URL}/quotation/${selectedQuote.quotation_id}`);
    const { quotation, items, sub_total, cgst, sgst, grand_total } = res.data;

    // Fetch customers and find the one used in this quotation by name
    let customerData = null;
    try {
      const customersRes = await axios.get(`${BASE_URL}/customers`);
      customerData = (customersRes.data || []).find((c) => c.customer_name === quotation.customer_name) || null;
    } catch (e) {
      // ignore, fallback to quotation fields
    }

    const formatAddress = (c) => {
      if (!c) return '';
      const parts = [
        c.billing_address1,
        c.billing_address2,
        c.billing_city,
        c.billing_state,
        c.billing_pincode
      ].filter(Boolean);
      return parts.join(', ');
    };

    const company = quotation.customer_name || '';
    const date = quotation.quotation_date || '';
    const contactPerson = quotation.contact_person || customerData?.billing_recipient_name || '';
    const location = customerData ? formatAddress(customerData) : (quotation.location || '');
    const contactNumber = customerData?.mobile || customerData?.office_no || quotation.contact_number || '';
    const merakiExpert = quotation.meraki_expert || 'Meraki Expert';
    const merakiPhone = quotation.meraki_phone || '7722005969';
    const customerEmail = customerData?.email || quotation.email || '';
    const merakiEmail = quotation.meraki_email || 'piral.k@merakkiexpert.in';
    const quotationSubject = 'Quotation - Supply & Installation of PUR Panel.';
    const gstin = quotation.gstin || '27AKUPY6544R1ZM';
    const udyam = quotation.udyam || 'UDYAM-MH-20-0114278';
    const iso = quotation.iso || 'ISO 9001-2015';
    const refNo = quotation.quote_number || `ME/${quotation.quotation_id || ''}`;
    const freight = quotation.freight || 'Extra At Actual';
    const termsAndConditions = quotation.terms_and_conditions || '';

    // Parse terms and conditions into structured format
    const parseTermsAndConditions = (terms) => {
      if (!terms) {
        return {
          deliveryPeriod: '3 to 4 weeks from the date of technically and commercially clear order',
          installationPeriod: '2 to 3 weeks',
          paymentTerms: 'Supply/Installation Terms',
          paymentDetails: [
            'a. 30% Advance along with Purchase order',
            'b. 65% Against proforma invoice prior to dispatch',
            'c. 5% after successfull Installation and commissioning'
          ],
          warranty: 'Offer a standard warranty of 15 months from date of dispatch or 12 months from date of satisfactory installation whichever is earlier',
          validity: 'Our Offer shall remain valid for 15 days',
          exclusions: 'Civil work, MS work, Loading / Unloading at site, Power supply, Adequate lighting arrangement for installation activities, Scrap folding, Scissor lift'
        };
      }

      const lines = terms.split('\n').filter(line => line.trim());
      const parsed = {
        deliveryPeriod: '3 to 4 weeks from the date of technically and commercially clear order',
        installationPeriod: '2 to 3 weeks',
        paymentTerms: 'Supply/Installation Terms',
        paymentDetails: [
          'a. 30% Advance along with Purchase order',
          'b. 65% Against proforma invoice prior to dispatch',
          'c. 5% after successfull Installation and commissioning'
        ],
        warranty: 'Offer a standard warranty of 15 months from date of dispatch or 12 months from date of satisfactory installation whichever is earlier',
        validity: 'Our Offer shall remain valid for 15 days',
        exclusions: 'Civil work, MS work, Loading / Unloading at site, Power supply, Adequate lighting arrangement for installation activities, Scrap folding, Scissor lift'
      };

      lines.forEach(line => {
        const cleanLine = line.trim();
        if (cleanLine.toLowerCase().includes('delivery period')) {
          parsed.deliveryPeriod = cleanLine.split(':')[1]?.trim() || parsed.deliveryPeriod;
        } else if (cleanLine.toLowerCase().includes('installation period')) {
          parsed.installationPeriod = cleanLine.split(':')[1]?.trim() || parsed.installationPeriod;
        } else if (cleanLine.toLowerCase().includes('payment terms')) {
          parsed.paymentTerms = cleanLine.split(':')[1]?.trim() || parsed.paymentTerms;
        } else if (cleanLine.toLowerCase().includes('warranty')) {
          parsed.warranty = cleanLine.split(':')[1]?.trim() || parsed.warranty;
        } else if (cleanLine.toLowerCase().includes('validity')) {
          parsed.validity = cleanLine.split(':')[1]?.trim() || parsed.validity;
        } else if (cleanLine.toLowerCase().includes('exclusions')) {
          parsed.exclusions = cleanLine.split(':')[1]?.trim() || parsed.exclusions;
        }
      });

      return parsed;
    };

    const parsedTerms = parseTermsAndConditions(termsAndConditions);

    const itemsRows = (items || []).map((item, idx) => `
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${idx + 1}</td>
                    <td style="border: 1px solid #000; padding: 3px;">${item.item_detail || ''}</td>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${item.quantity ?? ''}</td>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">${item.uom_description || ''}</td>
                    <td style="border: 1px solid #000; padding: 3px; text-align: right;">${item.rate ?? ''}</td>
                    <td style="border: 1px solid #000; padding: 3px; text-align: right;">${item.amount ?? ''}</td>
                </tr>
    `).join('');



    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quotation</title>
</head>
<style>

     @page {
  size: A4;
  margin: 10mm; /* you can adjust this to 5mm or 15mm */
}

    body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            margin: 0;
            padding: 20px;
            background-color: #f0f0f0;
            color: #333;
        }
      /* Specific Table Column Widths */
        .quotation-table td:nth-child(1), .quotation-table th:nth-child(1) { width: 5%; text-align: center; } /* Sr. No. */
        .quotation-table td:nth-child(2), .quotation-table th:nth-child(2) { width: 45%; } /* Description */
        .quotation-table td:nth-child(3), .quotation-table th:nth-child(3) { width: 10%; text-align: center; } /* Qty. */
        .quotation-table td:nth-child(4), .quotation-table th:nth-child(4) { width: 10%; text-align: center; } /* UOM */
        .quotation-table td:nth-child(5), .quotation-table th:nth-child(5) { width: 15%; text-align: right; } /* Rate */
        .quotation-table td:nth-child(6), .quotation-table th:nth-child(6) { width: 15%; text-align: right; } /* Total */

        /* Rate/Total text alignment */
        .rate, .total {
            text-align: right;
        }

 /* Totals Table Styling */
        .totals-table {
            float: right;
            width: 40%;
            margin-top: -1px; /* Overlap with the main table border */
        }

        .totals-table td {
          
            padding: 5px;
        }

        .totals-table td:first-child {
            width: 70%;
            font-weight: bold;
            text-align: right;
            border-right: none;
        }

        .totals-table td:last-child {
            width: 30%;
            text-align: right;
            font-weight: bold;
        }
        .grand-total-row td {
            font-size: 11pt;
            font-weight: bolder !important;
        }

        /* Header and Footer */
        .header-title {
            text-align: center;
            font-weight: bold;
            padding: 10px 0;
            margin-bottom: 5px;
           
        }

        
           table {
            width: 100%;
            border-collapse: collapse;
     
        }

        th, td {
            border: 2px solid #000;
            padding: 5px;
            text-align: left;
            color: #000;
            }


        th {
           
            font-weight: bold;
            text-align: center;
        }
        
           /* Responsive table scroll for small screens */
    .table-wrapper {
      overflow-x: auto;
    }

    /* Adjust font and padding on smaller devices */
    @media (max-width: 768px) {
      body {
        font-size: 9px;
      }

      .table,th, td {
        padding: 4px;
        font-size: 9px;
      }
      .conditions .label{
        width:100%;
        font-weight: bold;
      }
      .conditions .value{
        width: 100%;
        padding-left: 10px;
      }
      .footer{
        text-align: left;
      }

      .header{
        width: 140px;
      }
      
.container{
    width:100%;
    padding: 10px;
}
      .header img {
        width: 140px;
      }
    }

    @media (max-width: 480px) {
        .body{
            font-size: 8.5px;
            padding:5px;
        }
      .container {
        padding: 8px;
      }

       .header img {
        width: 120px;
      }
      .table,th,td{
        font-size: 8px;
        padding: 3px;
      }
    
 .section-title {
        font-size: 9px;
      }

      .conditions h3 {
        font-size: 9px;
      }

      th, td {
        font-size: 9px;
      }
    }

 


  .container {
    width: 190mm; /* keep some margin inside the page */
    margin: auto;
    padding: 10mm;
    box-sizing: border-box;
  }

  /* remove scrollbars or page breaks */
  .table-wrapper {
    overflow: visible !important;
  }

  /* ensure no element goes outside */
  table {
    page-break-inside: avoid;
  }



</style>
<body style="font-family: Arial, sans-serif; font-size: 10px; margin: 0px; padding: 20px; background-color: #f0f0f0;color: #333;">
    <div style="border: none; padding: 20px; width: 800px; margin: 0 auto; background-color: #fff;">
        <div style="text-align: center;  padding-bottom: 5px;">
            <img src=${ui} alt="Merraki Expert Logo" style="width: auto; height: 280px ; margin-top: -120px; margin-bottom: -60px" />
            <div style="font-size: 14px; font-weight: bold;"></div>
            <div style="font-size: 10px;"></div>
        </div>

        <div style="text-align: center; padding: 5px 0;">
            <div style="margin-top: -60px; font-size:  10px; font-weight: bold; border-bottom: 2px solid #000;"><strong>GSTIN:</strong> ${gstin} | <strong>${udyam}</strong> | <strong>${iso}</strong></div>
            <div style="font-size: 10px; font-weight: bold;">101, 2nd Floor, Shree Sai Apartment, Near Kachore Lawn, Manish Nagar, Nagpur - 440015 (MH)</div>
           
        </div>

        <table style="width: 100%; height: 100%; border-collapse: collapse; border: 3px solid black  ; box-shadow: #333;">
            <tbody>
                <tr>
                    <th class="first-row" colspan="6" style="padding-left: 360px; color: rgb(2, 37, 100);"> Quotation Ref. No. ${refNo}</th>
                </tr>
                <tr  >
                    <th style="width: 15%; border: 2px solid #000; padding: 3px; background-color: #f2f2f2; font-weight: bold;">Company</th>
                    <td colspan="5"  style="width: 35%; border: 1px solid #000; padding: 3px; ">${company}</td> 
                </tr>
                <tr>
                    <td style="border: 2px solid #000; padding: 3px; background-color: #f2f2f2; font-weight: bold;">Contact Person</td>
                    <td colspan="3"  style="border: 2px solid #000; padding: 3px;">${contactPerson}</td>
                    <td  style="border-bottom: 2px solid #f7f6f6; padding: 3px;"></td>
                    
                    
                </tr>
                 <tr>
                    <td style="border: 2px solid #000; padding: 3px; background-color: #f2f2f2; font-weight: bold; width: 100px; height: 50px; padding-left: 20px;">Location</td>
                    <td colspan="3"  style="border: 2px solid #000; padding: 3px;">${location}</td>
                    
                    
                    <td   style="border: 2px solid #000; padding: 3px;  font-weight: bold; padding-left: 25px;padding-bottom: 20px;">Date</td>
                    <td   style="border: 2px solid #000; padding: 3px; padding-left: 25px;">${date}</td>
                </tr>
                <tr>
                    <th   style="border: 2px solid #000; padding: 3px; background-color: #f2f2f2; font-weight: bold;">ContactNumber</th>
                    <td colspan="2"  style="border: 2px solid #000; padding: 3px;">${contactNumber}</td>
                    <td style="border-bottom: 1px solid white; padding: 3px;  font-weight: bold;padding-top: 20px;">Meraki Expert</td>
                    <td colspan="2" style="border: 2px solid #000; padding: 3px;">${merakiExpert}</td>
                </tr>
                <tr>
                    <td style="border: 2px solid #000; padding: 5px; background-color: #f2f2f2; font-weight: bold;">E-mail</td>
                    <td  colspan="2" style="border: 2px solid #000; padding: 3px;"><a href="mailto:${customerEmail}" style="color: #00f;">${customerEmail}</a></td>
                    <td  style="border: 2px solid #000; padding: 3px;  font-weight: bold;"></td>
                    <td  colspan="2" style="border: 2px solid #000; padding: 3px;"><a href="mailto:${merakiEmail}" style="color: #00f;">${merakiEmail}</a></td>
                </tr>
                <tr>
                    <th colspan="6"  style="text-align: center; font-weight: bold; padding: 5px 0;  margin-top: 5px; color: #073d82; font-size: large;">${quotationSubject}</th>
                </tr>
                 <tr>
                    <th style="width:2%; border: 2px solid #000; padding: 3px;  font-weight: bold;">Sr.No</th>
                    <td  style="width: 35%; border: 2px solid #000; padding: 3px;font-weight: bold; ">Description</td> 
                    <td style="width: 10%; border: 2px solid #000; padding: 3px;font-weight: bold; ">Quantity</td>
                    <td style="width: 15%; border: 2px solid #000; padding: 3px;font-weight: bold; ">UOM</td>
                    <td style="width: 18%; border: 2px solid #000; padding: 3px;font-weight: bold; ">Rate</td>
                    <td style="width: 35%; border: 2px solid #000; padding: 3px;font-weight: bold; ">Total</td>
                </tr>
                ${itemsRows}
                <tr>
                    <td style="border: 1px solid white; padding: 3px;  font-weight: bold;"></td>
                    <td    style="border: 1px solid white; padding: 3px;"></td>
                    <td style="border: 1px solid white; padding: 3px;  "></td>
                 
                    <td style="border-bottom: 1px solid white; padding: 3px;"></td>
                    <td style="border: 1px solid #000; padding: 3px;">Total Basic</td>
                    <td style="border: 1px solid #000; padding: 3px;">₹ ${sub_total || '0.00'}</td>
          
                   
                </tr>
                  <tr>
                    <td style="border: 1px solid white; padding: 3px;  font-weight: bold;"></td>
                    <td    style="border: 1px solid white; padding: 3px;"></td>
                    <td style="border: 1px solid white; padding: 3px;  "></td>
                 
                    <td style="border-bottom: 1px solid white; padding: 3px;"></td>
                    <td style="border: 1px solid #000; padding: 3px;">CGST@${cgst ? (cgst * 100 / sub_total).toFixed(1) : '9'}%</td>
                    <td style="border: 1px solid #000; padding: 3px;">₹ ${cgst || '0.00'}</td>
          
                   
                </tr>
                <tr>
                    <td style="border: 1px solid white; padding: 3px;  font-weight: bold;"></td>
                    <td    style="border: 1px solid white; padding: 3px;"></td>
                    <td style="border: 1px solid white; padding: 3px;  "></td>
                 
                    <td style="border-bottom: 1px solid white; padding: 3px;"></td>
                    <td style="border: 1px solid #000; padding: 3px;">SGST@${sgst ? (sgst * 100 / sub_total).toFixed(1) : '9'}%</td>
                    <td style="border: 1px solid #000; padding: 3px;">₹ ${sgst || '0.00'}</td>
          
                   
                </tr>
                <tr>
                    <td style="border: 1px solid white; padding: 3px;  font-weight: bold;"></td>
                    <td  style="border: 1px solid white; padding: 3px;"></td>
                    <td style="border: 1px solid white; padding: 3px;  "></td>
                 
                    <td style="border-bottom: 1px solid white; padding: 3px;"></td>
                    <td style="border: 1px solid #000; padding: 3px;">freight</td>
                    <td style="border: 1px solid #000; padding: 3px;">${freight}</td>
                     </tr>
                     <tr>
                    <td style="border: 1px solid white; padding: 3px;  font-weight: bold;"></td>
                    <td    style="border: 1px solid white; padding: 3px;"></td>
                    <td style="border: 1px solid white; padding: 3px;  "></td>
                 
                    <td style="border-bottom: 1px solid white; padding: 3px;"></td>
                    <td style="border: 1px solid #000; padding: 3px;">Grand Total</td>
                    <td style="border: 1px solid #000; padding: 3px;">₹ ${grand_total || '0.00'}</td>
           </tr>

                
                <tr >
                    <th   colspan="6" style="text-align: center; font-weight: bold; border-top: 2px solid black; border-bottom: 1px solid #000; text-decoration: underline; padding-bottom: 5px; margin-bottom: 5px; color: #073d82 ;">COMMERCIAL TERMS & CONDITIONS</th>
                </tr>
                <tr >
                    <td  style="border: 1px solid white;"  colspan="1" >Delivery Period</td>
                    <td  style="border: 1px solid white;"   colspan="5">: ${parsedTerms.deliveryPeriod}</td>
                </tr>
                 <tr>
                    <td    style="border: 1px solid white;" colspan="1">Installation Period</td>
                    <td style="border: 1px solid white;"  colspan="5">: ${parsedTerms.installationPeriod}</td>
                </tr>
                 <tr>
                    <td style="border: 1px solid white;"  colspan="1">Transportation</td>
                    <td  style="border: 1px solid white;" colspan="5"> : ${freight} </td>
                </tr>
                 <tr>
                    <td style="border: 1px solid white;"  colspan="1">Payment Terms</td>
                    <td style="border: 1px solid white;"  colspan="5"> : ${parsedTerms.paymentTerms}</td>
                </tr>
                 <tr>
                    <td  style="border: 1px solid white;" colspan="1"></td>
                    <td  style="border: 1px solid white;" colspan="5"> ${parsedTerms.paymentDetails[0]}</td>
                </tr>
                 <tr>
                    <td  style="border: 1px solid white;" colspan="1"></td>
                    <td   style="border: 1px solid white;" colspan="5"> ${parsedTerms.paymentDetails[1]}</td>
                </tr>
                 <tr>
                    <td  style="border: 1px solid white;" colspan="1"></td>
                    <td  style="border: 1px solid white;" colspan="5"> ${parsedTerms.paymentDetails[2]}</td>
                </tr>
                 <tr>
                    <td  style="border: 1px solid white;" colspan="1">Warranty</td>
                    <td  style="border: 1px solid white;" colspan="5"> : ${parsedTerms.warranty}</td>
                                                      
                </tr>
                <tr>
                    <td  style="border: 1px solid white;" colspan="1">Validity</td>
                    <td  style="border: 1px solid white;" colspan="5"> : ${parsedTerms.validity}</td>
                </tr>
                 <tr>
                    <td  style="border: 1px solid white;" colspan="1">Exclusions</td>
                    <td  style="border: 1px solid white;" colspan="5"> : ${parsedTerms.exclusions}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid white;" colspan="6"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid white;" colspan="6"></td>
                </tr>
 <tr>
                    <td style="border: 1px solid white; padding-left: 450px;font: bolder; " colspan="6" >Best Regards,</td>
                    
                </tr>
                 <tr>
                     <td style="border: 1px solid white; padding-left: 450px;font: bolder; " colspan="6" >Niraj Khicher</td>
                </tr>
                 <tr>
                     <td style="border: 1px solid white; padding-left:450px; font: bolder; " colspan="6">       Mob. No. 7722005969</td>
                </tr>
               
                <tr>
                    <td style="border: 1px solid rgb(8, 8, 8);" colspan="6"></td>
                </tr>
                <tr>
                     <td style=" font: bold; padding-left: 80px; border: 1px solid black; " colspan="6">Email: merakiexpert@gmail.com | Mobile: 8793484326 ; 9130801011 | www.merrakiexpert.in</td>
                </tr>
            </tbody>
        </table>
</body>
</html>

    `);
    printWindow.document.close();
    printWindow.print();
  } catch (err) {
    alert('Failed to print quotation');
  }
};

  const handleTabChange = (_, newVal) => setTab(newVal);

  const handleMenuClick = (event, quote) => {
    setAnchorEl(event.currentTarget);
    setSelectedQuote(quote);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedQuote(null);
  };

  const handleAddQuotation = () => {
    navigator("/add-Quotation");
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(
      `Quotation ${selectedQuote?.quoteNumber}`
    );
    const body = encodeURIComponent(
      `Hello,\n\nPlease find the quotation details below:\n\n` +
        `Quotation #: ${selectedQuote?.quoteNumber}\n` +
        `Customer: ${selectedQuote?.customer}\n` +
        `Created Date: ${selectedQuote?.createdDate}\n` +
        `Expiry Date: ${selectedQuote?.expiryDate}\n` +
        `Status: ${selectedQuote?.status}\n` +
        `Amount: ${selectedQuote?.amount}\n\n` +
        `Thank you.`
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleDeleteQuotation = async () => {
    if (!selectedQuote) return;
    if (!window.confirm("Are you sure you want to delete this quotation?"))
      return;
    try {
      await axios.delete(
        `${BASE_URL}/quotation/${selectedQuote.quotation_id}`
      );
      setQuotations((prev) =>
        prev.filter((q) => q.quotation_id !== selectedQuote.quotation_id)
      );
      setAnchorEl(null);
      setSelectedQuote(null);
    } catch (err) {
      alert("Failed to delete quotation");
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
          <Typography color="text.secondary" fontSize="20px">
            Quatation
          </Typography>

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
        <Box sx={{ px: 2, py: 2 }}>
          <Paper sx={{ p: 1, borderRadius: 2 }}>
            <Box
              sx={{
                display: "flex",
                px: 4,
                py: 2,
                justifyContent: "space-between",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Quotation
              </Typography>
              <Button
                sx={{ backgroundColor: "#003366" }}
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddQuotation}
              >
                New Quotation
              </Button>
            </Box>
            <Box py={3} px={4} flex={1}>
              <Grid
                container
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Tabs
                  value={tab}
                  onChange={handleTabChange}
                  sx={{
                    "& .MuiTab-root": {
                      textTransform: "none",
                      bgcolor: "#f1f1f1",
                      borderRadius: 2,
                      mr: 1,
                      textDecoration: "none",
                    },
                    "& .Mui-selected": {
                      bgcolor: "#004085",
                      color: "white !important",
                      textDecoration: "none",
                    },
                    "& .MuiTabs-indicator": {
                      display: "none",
                    },
                  }}
                >
                  <Tab label="All Quotation" />
                  <Tab label="Sent Quotation" />
                  <Tab label="Draft Quotation" />
                </Tabs>
                <Box mb={2} maxWidth={350}>
                  <TextField
                    fullWidth
                    placeholder="Search by quotation no, customer name..."
                    size="small"
                  />
                </Box>
              </Grid>

              <Table sx={{ bgcolor: "#fff", borderRadius: 2 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f6fa" }}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>Quotation#</TableCell>
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Created Date</TableCell>
                    <TableCell>Expiry Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Bill Amount</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8}>Loading...</TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={8}>{error}</TableCell>
                    </TableRow>
                  ) : (
                    quotations
                      .filter((q) => {
                        if (tab === 1) return q.status === "Sent";
                        if (tab === 2) return q.status === "Draft";
                        return true;
                      })
                      .map((q) => (
                        <TableRow key={q.quotation_id} hover>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell sx={{ color: "#007bff", fontWeight: 500 }}>
                            {q.quote_number}
                          </TableCell>
                          <TableCell>{q.customer_name}</TableCell>
                          <TableCell>{q.quotation_date}</TableCell>
                          <TableCell>{q.expiry_date}</TableCell>
                          <TableCell>
                            <Chip
                              label={q.status || "Draft"}
                              size="small"
                              color={
                                q.status === "Sent" ? "success" : "default"
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {q.grand_total ? `₹${q.grand_total}` : ""}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton onClick={(e) => handleMenuClick(e, q)}>
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>

              <Box mt={3} display="flex" justifyContent="space-between">
                <Typography variant="body2">
                  Showing 1 to 15 of 100 entries
                </Typography>
                <Box display="flex" justifyContent="space-between">
                  <Pagination
                    count={5}
                    page={1}
                    sx={{
                      "& .MuiPaginationItem-root": {
                        color: "grey",
                        borderColor: "#004085",
                      },
                      "& .Mui-selected": {
                        backgroundColor: "#004085",
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: "#003366",
                        },
                      },
                    }}
                  />
                </Box>
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
              >
                <MenuItem
                  onClick={() => {
                    navigator(`/editQuotation/${selectedQuote?.quotation_id}`);
                    handleCloseMenu();
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  onClick={() => {
                      if (!selectedQuote) {
                      alert("Please select a quotation to print");
                      return;
                    }
                    handlePrintQuotation(selectedQuote.quotation_id);
                    handleCloseMenu();
                  }}
                >
                  Download the PDF
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    if (!selectedQuote) {
                      alert("Please select a quotation to print");
                      return;
                    }
                    handlePrintQuotation(selectedQuote.quotation_id);
                    handleCloseMenu();
                  }}
                >
                  Print Quotation
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleSendEmail();
                    handleCloseMenu();
                  }}
                >
                  Send Email
                </MenuItem>
                <MenuItem
                  onClick={async () => {
                    if (!selectedQuote) return;
                    const newStatus = selectedQuote.status === "Sent" ? "Draft" : "Sent";
                    try {
                      await axios.put(
                        `${BASE_URL}/quotation/${selectedQuote.quotation_id}`,
                        { status: newStatus }
                      );
                      setQuotations((prev) =>
                        prev.map((q) =>
                          q.quotation_id === selectedQuote.quotation_id
                            ? { ...q, status: newStatus }
                            : q
                        )
                      );
                      alert(`Status updated to ${newStatus}`);
                    } catch (err) {
                      console.error("Error updating status:", err);
                      alert("Failed to update status");
                    }
                    handleCloseMenu();
                  }}
                  style={{
                    color: selectedQuote?.status === "Sent" ? "#1976d2" : "#388e3c",
                  }}
                >
                  {selectedQuote?.status === "Sent" ? "Mark as Draft" : "Mark as Sent"}
                </MenuItem>
                <MenuItem
                  onClick={handleDeleteQuotation}
                  style={{ color: "red" }}
                >
                  Delete
                </MenuItem>
              </Menu>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
