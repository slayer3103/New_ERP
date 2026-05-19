import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import EmptyState from '../components/common/EmptyState';

const Quotation = () => {
  const navigate = useNavigate();
  return (
    <AppLayout title="Quotation">
      <EmptyState
        image="https://shubham.in.net/img/wp.png"
        title="Add New Quotation"
        description="Create and manage quotations for your customers."
        actionLabel="+ New Quotation"
        onAction={() => navigate('/add-Quotation')}
      />
    </AppLayout>
  );
};

export default Quotation;
