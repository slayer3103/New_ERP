import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PaymentsIcon from '@mui/icons-material/Payments';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AppLayout from '../layouts/AppLayout';
import SearchField from '../components/common/SearchField';
import { tokens } from '../theme/paletteTokens';

const REPORT_ROUTES = {
  'Sales By Customers': '/sales-by-customers',
  'Sales By Products': '/sales-by-products',
  'Sales By Time Period': '/sales-analytics',
  'GST Summery': '/gst-summary',
  'Tax Liability Reports': '/tax-liability',
  'Outstanding Invoices': '/outstanding-invoices',
  'Payment Receipts': '/payment-receipts',
  'PO Summaries': '/po-summaries',
  'Vendor Spend Analysis': '/vendor-spend-analysis',
};

const getReportIcon = (reportName) => {
  switch (reportName) {
    case 'Sales By Customers':
      return <ShowChartIcon />;
    case 'Sales By Products':
      return <LocalOfferIcon />;
    case 'Sales By Time Period':
      return <AnalyticsIcon />;
    case 'GST Summery':
      return <AccountBalanceIcon />;
    case 'Tax Liability Reports':
      return <AssessmentIcon />;
    case 'Outstanding Invoices':
      return <ReceiptLongIcon />;
    case 'Payment Receipts':
      return <PaymentsIcon />;
    case 'PO Summaries':
      return <ShoppingCartIcon />;
    case 'Vendor Spend Analysis':
      return <DescriptionIcon />;
    default:
      return <AnalyticsIcon />;
  }
};

const ReportsAndAnalytics = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    {
      title: 'Sales Report',
      desc: 'Analyze your sales performance over time',
      color: tokens.primary,
      reports: ['Sales By Customers', 'Sales By Products', 'Sales By Time Period'],
    },
    {
      title: 'Tax Report',
      desc: 'Keep track of your tax liabilities and GST',
      color: tokens.success,
      reports: ['GST Summery', 'Tax Liability Reports'],
    },
    {
      title: 'Payment Report',
      desc: 'Monitor incoming payments and outstanding invoices',
      color: '#8b5cf6',
      reports: ['Outstanding Invoices', 'Payment Receipts'],
    },
    {
      title: 'Purchase Report',
      desc: 'Track vendor spending and purchase orders',
      color: tokens.warning,
      reports: ['PO Summaries', 'Vendor Spend Analysis'],
    },
  ];

  const handleReportClick = (reportName) => {
    const target = REPORT_ROUTES[reportName];
    if (target) {
      navigate(target);
    }
  };

  const filteredSections = sections
    .map((section) => ({
      ...section,
      reports: section.reports.filter((r) =>
        r.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((section) => section.reports.length > 0);

  return (
    <AppLayout title="Reports & Analytics">
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          bgcolor: tokens.sidebarBg,
          color: '#fff',
        }}
      >
        <Typography variant="h5" fontWeight={700} mb={1}>
          Analytics & Reports
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85, maxWidth: 560 }}>
          Access business data in one place. Track performance and make data-driven decisions.
        </Typography>
      </Paper>

      <Box sx={{ mb: 3, maxWidth: 480 }}>
        <SearchField
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Find a specific report..."
          debounceMs={150}
          width="100%"
        />
      </Box>

      {filteredSections.map((section) => (
        <Box key={section.title} sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
            {section.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {section.desc}
          </Typography>
          <Grid container spacing={2}>
            {section.reports.map((report) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={report}>
                <Card
                  onClick={() => handleReportClick(report)}
                  elevation={0}
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    border: `1px solid ${tokens.border}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: section.color,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: `${section.color}14`,
                          color: section.color,
                          display: 'flex',
                        }}
                      >
                        {getReportIcon(report)}
                      </Box>
                      <ArrowForwardIosIcon sx={{ fontSize: 14, color: tokens.textSecondary }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 2 }}>
                      {report}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View detailed analytics for {report.toLowerCase()}.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {filteredSections.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            border: `1px dashed ${tokens.border}`,
          }}
        >
          <Typography color="text.secondary">
            No reports found matching &quot;{searchTerm}&quot;
          </Typography>
        </Paper>
      )}
    </AppLayout>
  );
};

export default ReportsAndAnalytics;
