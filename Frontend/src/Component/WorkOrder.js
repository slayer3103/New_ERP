import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import EmptyState from '../components/common/EmptyState';

const WorkOrder = () => {
  const navigate = useNavigate();
  return (
    <AppLayout title="Work Order">
      <EmptyState
        image="https://shubham.in.net/img/wp.png"
        title="Add New Work Order"
        description="Create and track work orders for your operations team."
        actionLabel="+ New Work Order"
        onAction={() => navigate('/add-Work-Order')}
      />
    </AppLayout>
  );
};

export default WorkOrder;
