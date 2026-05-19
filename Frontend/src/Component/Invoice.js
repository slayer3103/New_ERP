import { Box, Button, Typography } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import EmptyState from '../components/common/EmptyState';

const InvoicePage = () => {
  const navigate = useNavigate();
  return (
    <AppLayout title="Invoice">
      <EmptyState
        image="https://d3a93fg1wt2nf3.cloudfront.net/static/website/images/is_images/invoicing-software.svg"
        title="Create New Invoice"
        description="Quickly add customer and product details to generate your invoice."
        actionLabel="+ New Invoice"
        onAction={() => navigate('/new-invoice')}
      />
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ReceiptIcon />}
          sx={{ textTransform: 'none' }}
          onClick={() => navigate('/pro-forma-invoice-list')}
        >
          Pro Forma Invoices
        </Button>
        <Button
          variant="outlined"
          sx={{ textTransform: 'none' }}
          onClick={() => navigate('/invoice-list')}
        >
          View All Invoices
        </Button>
      </Box>
    </AppLayout>
  );
};

export default InvoicePage;
