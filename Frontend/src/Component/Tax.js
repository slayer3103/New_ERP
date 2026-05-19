import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppLayout from '../layouts/AppLayout';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import Taxlist from './Taxlist';
import BASE_URL from '../config/api';

export default function Tax() {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${BASE_URL}/taxes`)
      .then((res) => {
        setTaxes(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching taxes:', err);
        setTaxes([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && taxes.length > 0) {
      navigate('/Tax-list', { replace: true });
    }
  }, [loading, taxes.length, navigate]);

  if (loading) {
    return (
      <AppLayout title="Tax">
        <LoadingState message="Loading tax settings..." />
      </AppLayout>
    );
  }

  if (taxes.length > 0) {
    return <Taxlist />;
  }

  return (
    <AppLayout title="Tax">
      <EmptyState
        image="https://shubham.in.net/img/wp.png"
        title="Add Tax Configuration"
        description="Configure tax rates and GST settings for your invoices."
        actionLabel="+ Add Tax"
        onAction={() => navigate('/add-Tax')}
      />
    </AppLayout>
  );
}
