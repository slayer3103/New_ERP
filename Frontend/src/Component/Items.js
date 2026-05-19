import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppLayout from '../layouts/AppLayout';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import BASE_URL from '../config/api';

export default function ItemsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/products`)
      .then((res) => {
        setItems(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching items:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && items.length > 0) {
      navigate('/item-list', { replace: true });
    }
  }, [loading, items.length, navigate]);

  if (loading) {
    return (
      <AppLayout title="Products & Services">
        <LoadingState message="Loading products..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Products & Services">
      <EmptyState
        image="https://shubham.in.net/img/wp.png"
        title="Add Product & Service"
        description="Add and manage your products and services, all in one place."
        actionLabel="+ New Product"
        onAction={() => navigate('/add-items')}
      />
    </AppLayout>
  );
}
