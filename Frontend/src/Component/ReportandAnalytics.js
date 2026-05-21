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
import ReportPageHeader from '../components/common/ReportPageHeader';
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

const REPORT_DESCRIPTIONS = {
  'Sales By Customers': 'Revenue breakdown and payment status per customer.',
  'Sales By Products': 'Product performance, quantity trends, and revenue contribution.',
  'Sales By Time Period': 'Periodic sales dashboard with trend analysis.',
  'GST Summery': 'Monthly CGST, SGST, and IGST tax breakdown.',
  'Tax Liability Reports': 'Track collected vs pending tax liability.',
  'Outstanding Invoices': 'Unpaid invoices with aging analysis.',
  'Payment Receipts': 'Complete payment log with mode-wise breakdown.',
  'PO Summaries': 'Purchase order overview with vendor spending.',
  'Vendor Spend Analysis': 'Procurement spending analysis across vendors.',
};

const ReportsAndAnalytics = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    {
      title: 'Sales Report',
      desc: 'Analyze your sales performance over time',
      color: tokens.chartBlue,
      reports: ['Sales By Customers', 'Sales By Products', 'Sales By Time Period'],
    },
    {
      title: 'Tax Report',
      desc: 'Keep track of your tax liabilities and GST',
      color: tokens.chartGreen,
      reports: ['GST Summery', 'Tax Liability Reports'],
    },
    {
      title: 'Payment Report',
      desc: 'Monitor incoming payments and outstanding invoices',
      color: tokens.chartViolet,
      reports: ['Outstanding Invoices', 'Payment Receipts'],
    },
    {
      title: 'Purchase Report',
      desc: 'Track vendor spending and purchase orders',
      color: tokens.chartAmber,
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
      <ReportPageHeader
        title="📊 Analytics & Reports"
        subtitle="Access business data in one place. Track performance and make data-driven decisions."
      />

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box
              sx={{
                width: 4,
                height: 24,
                borderRadius: 2,
                bgcolor: section.color,
                flexShrink: 0,
              }}
            />
            <Typography variant="h6" fontWeight={700}>
              {section.title}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: '20px' }}>
            {section.desc}
          </Typography>
          <Grid container spacing={2.5}>
            {section.reports.map((report) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={report}>
                <Card
                  onClick={() => handleReportClick(report)}
                  elevation={0}
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    border: `1px solid ${tokens.border}`,
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: section.color,
                      boxShadow: `0 8px 24px -4px ${section.color}20`,
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.25,
                          borderRadius: '12px',
                          bgcolor: `${section.color}10`,
                          color: section.color,
                          display: 'flex',
                        }}
                      >
                        {getReportIcon(report)}
                      </Box>
                      <ArrowForwardIosIcon
                        sx={{
                          fontSize: 14,
                          color: tokens.textSecondary,
                          transition: 'transform 0.2s ease',
                          '.MuiCard-root:hover &': { transform: 'translateX(3px)' },
                        }}
                      />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 2 }}>
                      {report}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      {REPORT_DESCRIPTIONS[report] || `View detailed analytics for ${report.toLowerCase()}.`}
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
            borderRadius: '16px',
          }}
        >
          <AnalyticsIcon sx={{ fontSize: 48, color: tokens.textSecondary, mb: 1, opacity: 0.5 }} />
          <Typography color="text.secondary" fontWeight="medium">
            No reports found matching &quot;{searchTerm}&quot;
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Try a different search term.
          </Typography>
        </Paper>
      )}
    </AppLayout>
  );
};

export default ReportsAndAnalytics;
