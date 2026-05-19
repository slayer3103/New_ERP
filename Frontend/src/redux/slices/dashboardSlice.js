import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import BASE_URL from '../../config/api';

const initialState = {
  totalInvoices: 0,
  paid: 0,
  partial: 0,
  draft: 0,
  recentInvoices: [],
  invoicesOverTime: [],
  loading: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
        
      const summaryResponse = await axios.get(`${BASE_URL}/invoice/summary`);
      const recentInvoicesResponse = await axios.get(`${BASE_URL}/invoice/recent`);
      const invoicesOverTimeResponse = await axios.get(`${BASE_URL}/invoice/over-time`);

      return {
        summary: summaryResponse.data,
        recentInvoices: recentInvoicesResponse.data,
        invoicesOverTime: invoicesOverTimeResponse.data,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.totalInvoices = action.payload.summary.total || 0;
        state.paid = action.payload.summary.paid || 0;
        state.partial = action.payload.summary.partial || 0;
        state.draft = action.payload.summary.draft || 0;
        state.recentInvoices = Array.isArray(action.payload.recentInvoices) ? action.payload.recentInvoices : [];
        state.invoicesOverTime = Array.isArray(action.payload.invoicesOverTime) ? action.payload.invoicesOverTime : [];
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.totalInvoices = 0;
        state.paid = 0;
        state.partial = 0;
        state.draft = 0;
        state.recentInvoices = [];
        state.invoicesOverTime = [];
      });
  },
});

export default dashboardSlice.reducer;
