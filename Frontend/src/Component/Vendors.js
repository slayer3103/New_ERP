import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import EmptyState from '../components/common/EmptyState';

const Vendors = () => {
  const navigate = useNavigate();

  return (
    <AppLayout title="Vendors">
      <EmptyState
        image="https://shubham.in.net/img/wp.png"
        title="Add New Vendor"
        description="Add and manage your vendors, all in one place."
        actionLabel="+ New Vendor"
        onAction={() => navigate('/add-vendor')}
      />
    </AppLayout>
  );
};

export default Vendors;
