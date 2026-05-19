import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import BASE_URL from '../config/api';

const AddFinancialYear = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  // Auto-calculate endDate as +1 year when startDate changes
  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setFullYear(start.getFullYear() + 1);
      end.setDate(end.getDate() - 1); // 1 year minus 1 day for financial year range

      // Format to yyyy-mm-dd
      const formatted = end.toISOString().split('T')[0];
      setEndDate(formatted);
    }
  }, [startDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError('Both start and end dates are required.');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date.');
      return;
    }

    // Start date should not be more than 10 years in the past
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    if (new Date(startDate) < tenYearsAgo) {
      setError('Start date cannot be more than 10 years in the past.');
      return;
    }

    // Start date should not be more than 5 years in the future
    const fiveYearsAhead = new Date();
    fiveYearsAhead.setFullYear(fiveYearsAhead.getFullYear() + 5);
    if (new Date(startDate) > fiveYearsAhead) {
      setError('Start date cannot be more than 5 years in the future.');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/financialYear/add`, {
        start_date: startDate,
        end_date: endDate
      });

      setSuccessMsg('✅ Financial year added successfully!');
      setError('');

      // Redirect and reload
      setTimeout(() => {
        navigate('/add-Financial-year-settings');
        setTimeout(() => window.location.reload(), 100);
      }, 1000);

    } catch (err) {
      setError('❌ '+err.response?.data?.error );
      console.error(err);
    }
  };

  return (
    <>
      <Sidebar />
      <div style={{ padding: '30px', maxWidth: '500px', margin: '0 auto' }}>
        <h2>➕ Add New Financial Year</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Start Date:</label><br />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>End Date (auto-filled):</label><br />
            <input
              type="date"
              value={endDate}
              readOnly
              style={{ width: '100%', padding: '8px', backgroundColor: '#e9ecef' }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ➕ Add Year
          </button>
        </form>
      </div>
    </>
  );
};

export default AddFinancialYear;
