import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import BASE_URL from '../config/api';

const FinancialYearGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [hasActiveYear, setHasActiveYear] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkActiveYear = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/financialYear/active`);
        if (res.data.active && res.data.active.length > 0) {
          console.log('Active financial year found:', res.data.active);
          setHasActiveYear(true);
        }
      } catch (err) {
        console.error('Error checking financial year:', err.message);
      } finally {
        setLoading(false);
      }
    };
    checkActiveYear();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>🔄 Checking financial year...</div>;
  }

  // 🚫 Don’t show alert if already on the add page
  if (!hasActiveYear && location.pathname !== '/add/financial_year' && location.pathname !== '/add-Financial-year-settings') {
    return (
      <div style={{
        height: '100vh',
        backgroundColor: '#fff3cd',
        color: '#856404',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontSize: '1.2rem',
        textAlign: 'center',
        padding: '20px',
         position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}>
        <p>⚠️ Please add or select atleast one financial year first to continue using the application.</p>
        <button
          onClick={() => navigate('/add-Financial-year-settings')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#ffc107',
            color: '#212529',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ➕ Add /Select Financial Year
        </button>
      </div>
    );
  }

  return children;
};

export default FinancialYearGuard;






