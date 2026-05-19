import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import EmptyState from '../components/common/EmptyState';

const FirstTimePurchaseOrder = () => {
  const navigate = useNavigate();
  return (
    <AppLayout title="Purchase Order">
      <EmptyState
        image="https://shubham.in.net/img/wp.png"
        title="Add New Purchase Order"
        description="Add and manage purchase orders, all in one place."
        actionLabel="+ New Purchase Order"
        onAction={() => navigate('/add-purchase-order')}
      />
    </AppLayout>
  );
};

export default FirstTimePurchaseOrder;
