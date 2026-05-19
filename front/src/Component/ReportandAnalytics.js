import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  InputBase,
  Avatar,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
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
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';

// Map every report label to its dedicated route (must match App.js routes).
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
  switch(reportName) {
    case 'Sales By Customers': return <ShowChartIcon />;
    case 'Sales By Products': return <LocalOfferIcon />;
    case 'Sales By Time Period': return <AnalyticsIcon />;
    case 'GST Summery': return <AccountBalanceIcon />;
    case 'Tax Liability Reports': return <AssessmentIcon />;
    case 'Outstanding Invoices': return <ReceiptLongIcon />;
    case 'Payment Receipts': return <PaymentsIcon />;
    case 'PO Summaries': return <ShoppingCartIcon />;
    case 'Vendor Spend Analysis': return <DescriptionIcon />;
    default: return <AnalyticsIcon />;
  }
};

const ReportsAndAnalytics = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    { 
      title: 'Sales Report', 
      desc: 'Analyze your sales performance over time',
      color: '#3b82f6',
      reports: ['Sales By Customers', 'Sales By Products', 'Sales By Time Period'] 
    },
    { 
      title: 'Tax Report', 
      desc: 'Keep track of your tax liabilities and GST',
      color: '#10b981',
      reports: ['GST Summery', 'Tax Liability Reports'] 
    },
    { 
      title: 'Payment Report', 
      desc: 'Monitor incoming payments and outstanding invoices',
      color: '#8b5cf6',
      reports: ['Outstanding Invoices', 'Payment Receipts'] 
    },
    { 
      title: 'Purchase Report', 
      desc: 'Track vendor spending and purchase orders',
      color: '#f59e0b',
      reports: ['PO Summaries', 'Vendor Spend Analysis'] 
    },
  ];

  const handleReportClick = (reportName) => {
    const target = REPORT_ROUTES[reportName];
    if (target) {
      navigate(target);
    } else {
      console.warn(`No route configured for report: ${reportName}`);
    }
  };

  const filteredSections = sections.map(section => ({
    ...section,
    reports: section.reports.filter(r => r.toLowerCase().includes(searchTerm.toLowerCase()))
  })).filter(section => section.reports.length > 0);

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ backgroundColor: '#fff', p: 2, px: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AnalyticsIcon sx={{ color: '#6366f1' }} />
            <Typography variant="h5" fontWeight="bold" color="#1e293b">Reports Hub</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9', px: 2, py: 0.5, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <SearchIcon fontSize="small" sx={{ mr: 1, color: '#64748b' }} />
              <InputBase placeholder="Search globally..." sx={{ fontSize: '14px' }} />
            </Box>
            <IconButton sx={{ color: '#64748b' }}><NotificationsNoneIcon /></IconButton>
            <UserMenu />
            <Avatar src="/avatar.png" sx={{ width: 32, height: 32 }} />
            <Typography fontSize={14} color="#64748b">Admin</Typography>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, flexGrow: 1 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', mb: 4, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h4" fontWeight="bold" mb={1}>Analytics & Reports</Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                Access all your business data in one place. Discover insights, track performance, and make data-driven decisions to grow your business.
              </Typography>
            </Box>
            <Box sx={{ position: 'absolute', right: -20, top: -40, opacity: 0.1, transform: 'scale(1.5)' }}>
              <AnalyticsIcon sx={{ fontSize: 200 }} />
            </Box>
          </Paper>

          <Box mb={4}>
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', maxWidth: 500 }}>
              <SearchIcon sx={{ color: '#94a3b8', mx: 1 }} />
              <InputBase
                placeholder="Find a specific report..."
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ fontSize: '16px' }}
              />
            </Paper>
          </Box>

          <Grid container spacing={4}>
            {filteredSections.map((section) => (
              <Grid item xs={12} key={section.title}>
                <Box mb={2}>
                  <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: section.color, display: 'inline-block' }} />
                    {section.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2.5 }}>
                    {section.desc}
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  {section.reports.map((report) => (
                    <Grid item xs={12} sm={6} md={4} key={report}>
                      <Card
                        onClick={() => handleReportClick(report)}
                        sx={{
                          height: '100%',
                          cursor: 'pointer',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          boxShadow: 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)',
                            borderColor: section.color,
                            '& .report-icon': {
                              color: section.color,
                              bgcolor: `${section.color}15`,
                              transform: 'scale(1.1)',
                            },
                            '& .arrow-icon': {
                              color: section.color,
                              transform: 'translateX(4px)',
                            }
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <Box
                              className="report-icon"
                              sx={{
                                p: 1.5,
                                borderRadius: '12px',
                                bgcolor: '#f1f5f9',
                                color: '#64748b',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                              }}
                            >
                              {getReportIcon(report)}
                            </Box>
                            <ArrowForwardIosIcon 
                              className="arrow-icon"
                              sx={{ fontSize: 14, color: '#cbd5e1', transition: 'all 0.3s ease', mt: 1 }} 
                            />
                          </Box>
                          <Typography variant="subtitle1" fontWeight="bold" color="#1e293b" sx={{ mt: 2, mb: 0.5 }}>
                            {report}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            View detailed analytics and metrics for {report.toLowerCase()}.
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            ))}
            {filteredSections.length === 0 && (
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                  <Typography variant="h6" color="text.secondary">No reports found matching "{searchTerm}"</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default ReportsAndAnalytics;
