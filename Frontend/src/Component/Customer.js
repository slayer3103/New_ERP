import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import BASE_URL from '../config/api';

const illustration =
  'https://i0.wp.com/cupofglory.com/wp-content/uploads/2024/11/Subscription-Form.webp?resize=1024,912&ssl=1';

export default function CustomerPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/customers`)
      .then((res) => {
        setCustomers(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching customers:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && customers.length > 0) {
      navigate('/customer-list', { replace: true });
    }
  }, [loading, customers.length, navigate]);

  if (loading) {
    return (
      <AppLayout title="Customers">
        <LoadingState message="Loading customers..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Customers">
      <EmptyState
        image={illustration}
        title="Add New Customer"
        description="Add and manage your customers, all in one place."
        actionLabel="+ New Customer"
        onAction={() => navigate('/add-customer')}
      />
    </AppLayout>
  );
}
