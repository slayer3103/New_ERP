import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  InputBase,
  Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';

// Map every report label to a route. "Sales By Time Period" keeps its own
// dedicated page; everything else uses the generic /report/:reportKey view.
const REPORT_ROUTES = {
  'Sales By Customers':   '/report/sales-by-customers',
  'Sales By Products':    '/report/sales-by-products',
  'Sales By Time Period': '/sales-analytics',
  'GST Summery':          '/report/gst-summary',
  'Tax Liability Reports':'/report/tax-liability',
  'Outstanding Invoices': '/report/outstanding-invoices',
  'Payment Receipts':     '/report/payment-receipts',
  'PO Summaries':         '/report/po-summaries',
  'Vendor Spend Analysis':'/report/vendor-spend',
};

const ReportsAndAnalytics = () => {
  const navigate = useNavigate();

  const sections = [
    { title: 'Sales Report',    reports: ['Sales By Customers', 'Sales By Products', 'Sales By Time Period'] },
    { title: 'Tax Report',      reports: ['GST Summery', 'Tax Liability Reports'] },
    { title: 'Payment Report',  reports: ['Outstanding Invoices', 'Payment Receipts'] },
    { title: 'Purchase Report', reports: ['PO Summaries', 'Vendor Spend Analysis'] },
  ];

  const handleReportClick = (reportName) => {
    const target = REPORT_ROUTES[reportName];
    if (target) {
      navigate(target);
    } else {
      console.warn(`No route configured for report: ${reportName}`);
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f5fa', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            backgroundColor: '#fff',
            p: 2,
            px: 3,
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" fontWeight="bold">Reports & Analytics</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f0f0f0', px: 2, py: 0.5, borderRadius: '8px' }}>
              <SearchIcon fontSize="small" sx={{ mr: 1 }} />
              <InputBase placeholder="Search anything here..." />
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <NotificationsNoneIcon />
              <UserMenu />
            </Box>
            <Avatar src="/avatar.png" sx={{ width: 32, height: 32 }} />
            <Typography fontSize={14}>Admin name</Typography>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '12px' }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>Reports & Analytics</Typography>

            <Box mb={3}>
              <InputBase
                placeholder="Search reports here..."
                fullWidth
                sx={{ bgcolor: '#f8f8f8', borderRadius: '10px', px: 2, py: 1, border: '1px solid #e0e0e0' }}
              />
            </Box>

            <Grid container spacing={3}>
              {sections.map((section) => (
                <Grid item xs={12} key={section.title}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={2}>{section.title}</Typography>
                  <Grid container spacing={2}>
                    {section.reports.map((report) => (
                      <Grid item key={report}>
                        <Button
                          variant="contained"
                          endIcon={<ArrowOutwardIcon />}
                          onClick={() => handleReportClick(report)}
                          sx={{
                            background: '#f3f4f6',
                            color: '#000',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#e2e3e5' },
                          }}
                        >
                          {report}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ReportsAndAnalytics;
