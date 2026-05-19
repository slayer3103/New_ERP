import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import EmptyState from '../components/common/EmptyState';

const ProFormaInvoice = () => {
  const navigate = useNavigate();
  return (
    <AppLayout title="Pro Forma Invoice">
      <EmptyState
        image="https://d3a93fg1wt2nf3.cloudfront.net/static/website/images/is_images/invoicing-software.svg"
        title="Create Pro Forma Invoice"
        description="Generate pro forma invoices before final billing."
        actionLabel="+ New Pro Forma Invoice"
        onAction={() => navigate('/add-pro-forma-invoice')}
      />
    </AppLayout>
  );
};

export default ProFormaInvoice;
