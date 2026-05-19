import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import BASE_URL from '../config/api';

const FinancialYearMain = () => {
  const [financialYears, setFinancialYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchYears = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/financialYear/all`);
      setFinancialYears(res.data.financialYears || []);
    } catch (err) {
      console.error('Error fetching financial years:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleActivate = async (id) => {
    try {
      await axios.post(`${BASE_URL}/financialYear/activate/${id}`);
      setLoading(true);
      window.location.reload();
    } catch (err) {
      console.error('Activation failed:', err.message);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await axios.post(`${BASE_URL}/financialYear/deactivate/${id}`);
      setLoading(true);
      window.location.reload();
    } catch (err) {
      console.error('Deactivation failed:', err.message);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-financial-year/${id}`);
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f5fa', minHeight: '100vh' }}>
      <Sidebar />

      <Box sx={{ flex: 1, p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">📆 Financial Years</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/add/financial_year')}>
            ➕ Add New Financial Year
          </Button>
        </Box>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : financialYears.length === 0 ? (
          <Typography>No financial years found.</Typography>
        ) : (
          financialYears.map((year) => {
            const start = new Date(year.start_date);
            const end = new Date(year.end_date);
            const fyName = `FY ${start.getFullYear()}-${String(end.getFullYear()).slice(-2)}`;

            return (
              <Paper key={year.id} sx={{ p: 3, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>{fyName}</Typography>
                  <Typography><strong>Start:</strong> {start.toLocaleDateString()}</Typography>
                  <Typography><strong>End:</strong> {end.toLocaleDateString()}</Typography>
                  <Typography>
                    <strong>Status:</strong>{' '}
                    {year.is_active ? (
                      <span style={{ color: 'green', fontWeight: 'bold' }}>🟢 Active</span>
                    ) : (
                      <span style={{ color: 'gray' }}>⚪ Inactive</span>
                    )}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  {!year.is_active && (
                    <Button variant="contained" color="success" onClick={() => handleActivate(year.id)}>
                      Activate
                    </Button>
                  )}
                  {year.is_active && (
                    <Button variant="outlined" color="warning" onClick={() => handleDeactivate(year.id)}>
                      Deactivate
                    </Button>
                  )}
                </Box>
              </Paper>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default FinancialYearMain;

