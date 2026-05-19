import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, CircularProgress, Alert, Avatar, InputBase,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import axios from 'axios';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';
import BASE_URL from '../config/api';

const API = `${BASE_URL}`;

// Each report key maps to: a title, the endpoint(s) to fetch, and how to
// transform the raw rows into table { columns, rows }.
const REPORTS = {
  'sales-by-customers': {
    title: 'Sales By Customers',
    fetch: () => axios.get(`${API}/invoice`).then(r => r.data),
    build: (invoices) => {
      const map = new Map();
      (invoices || []).forEach(inv => {
        const key = inv.customer_name || inv.customer || `#${inv.customer_id ?? '—'}`;
        const cur = map.get(key) || { customer: key, invoices: 0, total: 0, paid: 0, pending: 0 };
        cur.invoices += 1;
        cur.total += Number(inv.total_amount || inv.grand_total || inv.amount || 0);
        if ((inv.status || '').toLowerCase() === 'paid' || (inv.status || '').toLowerCase() === 'completed') {
          cur.paid += Number(inv.total_amount || inv.grand_total || inv.amount || 0);
        } else {
          cur.pending += Number(inv.total_amount || inv.grand_total || inv.amount || 0);
        }
        map.set(key, cur);
      });
      return {
        columns: ['Customer', 'Invoices', 'Total', 'Paid', 'Pending'],
        rows: [...map.values()].sort((a, b) => b.total - a.total)
          .map(r => [r.customer, r.invoices, fmt(r.total), fmt(r.paid), fmt(r.pending)]),
      };
    },
  },

  'sales-by-products': {
    title: 'Sales By Products',
    fetch: () => axios.get(`${API}/invoice`).then(r => r.data),
    build: (invoices) => {
      const map = new Map();
      (invoices || []).forEach(inv => {
        const items = inv.items || inv.invoice_items || [];
        items.forEach(it => {
          const key = it.product_name || it.name || `#${it.product_id ?? '—'}`;
          const qty = Number(it.quantity || it.qty || 0);
          const amt = Number(it.amount || it.total || (qty * Number(it.price || it.rate || 0)));
          const cur = map.get(key) || { product: key, qty: 0, revenue: 0, orders: 0 };
          cur.qty += qty;
          cur.revenue += amt;
          cur.orders += 1;
          map.set(key, cur);
        });
      });
      return {
        columns: ['Product', 'Orders', 'Quantity', 'Revenue'],
        rows: [...map.values()].sort((a, b) => b.revenue - a.revenue)
          .map(r => [r.product, r.orders, r.qty, fmt(r.revenue)]),
      };
    },
  },

  'gst-summary': {
    title: 'GST Summary',
    fetch: () => axios.get(`${API}/invoice`).then(r => r.data),
    build: (invoices) => {
      let taxable = 0, tax = 0, total = 0, count = 0;
      (invoices || []).forEach(inv => {
        taxable += Number(inv.subtotal || inv.taxable_amount || 0);
        tax += Number(inv.tax_amount || inv.total_tax || 0);
        total += Number(inv.total_amount || inv.grand_total || 0);
        count += 1;
      });
      return {
        columns: ['Metric', 'Value'],
        rows: [
          ['Total Invoices', count],
          ['Taxable Amount', fmt(taxable)],
          ['Total GST', fmt(tax)],
          ['Grand Total', fmt(total)],
        ],
      };
    },
  },

  'tax-liability': {
    title: 'Tax Liability Report',
    fetch: () => Promise.all([
      axios.get(`${API}/taxes`).then(r => r.data),
      axios.get(`${API}/invoice`).then(r => r.data),
    ]),
    build: ([taxes, invoices]) => {
      const totalCollected = (invoices || []).reduce(
        (s, i) => s + Number(i.tax_amount || i.total_tax || 0), 0,
      );
      const cols = ['Tax Name', 'Rate (%)', 'Status'];
      const rows = (taxes || []).map(t => [
        t.name || t.tax_name || '—',
        t.rate ?? t.percentage ?? '—',
        t.status || 'active',
      ]);
      rows.unshift(['— Total Tax Collected —', fmt(totalCollected), '']);
      return { columns: cols, rows };
    },
  },

  'outstanding-invoices': {
    title: 'Outstanding Invoices',
    fetch: () => axios.get(`${API}/invoice`).then(r => r.data),
    build: (invoices) => {
      const open = (invoices || []).filter(i => {
        const s = (i.status || '').toLowerCase();
        return s !== 'paid' && s !== 'completed';
      });
      return {
        columns: ['Invoice #', 'Customer', 'Date', 'Amount', 'Status'],
        rows: open.map(i => [
          i.invoice_number || i.id,
          i.customer_name || `#${i.customer_id ?? '—'}`,
          (i.invoice_date || i.created_at || '').toString().slice(0, 10),
          fmt(i.total_amount || i.grand_total || 0),
          i.status || 'pending',
        ]),
      };
    },
  },

  'payment-receipts': {
    title: 'Payment Receipts',
    fetch: () => axios.get(`${API}/payment-entries`).then(r => r.data),
    build: (payments) => ({
      columns: ['Receipt #', 'Invoice', 'Date', 'Amount', 'Mode'],
      rows: (payments || []).map(p => [
        p.receipt_number || p.id,
        p.invoice_number || p.invoice_id || '—',
        (p.payment_date || p.created_at || '').toString().slice(0, 10),
        fmt(p.amount || p.paid_amount || 0),
        p.payment_mode || p.mode || '—',
      ]),
    }),
  },

  'po-summaries': {
    title: 'Purchase Order Summaries',
    fetch: () => axios.get(`${API}/purchase`).then(r => r.data),
    build: (orders) => ({
      columns: ['PO #', 'Vendor', 'Date', 'Amount', 'Status'],
      rows: (orders || []).map(o => [
        o.po_number || o.purchase_order_number || o.id,
        o.vendor_name || `#${o.vendor_id ?? '—'}`,
        (o.po_date || o.created_at || '').toString().slice(0, 10),
        fmt(o.total_amount || o.grand_total || 0),
        o.status || '—',
      ]),
    }),
  },

  'vendor-spend': {
    title: 'Vendor Spend Analysis',
    fetch: () => axios.get(`${API}/purchase`).then(r => r.data),
    build: (orders) => {
      const map = new Map();
      (orders || []).forEach(o => {
        const key = o.vendor_name || `#${o.vendor_id ?? '—'}`;
        const cur = map.get(key) || { vendor: key, orders: 0, spend: 0 };
        cur.orders += 1;
        cur.spend += Number(o.total_amount || o.grand_total || 0);
        map.set(key, cur);
      });
      return {
        columns: ['Vendor', 'Orders', 'Total Spend'],
        rows: [...map.values()].sort((a, b) => b.spend - a.spend)
          .map(r => [r.vendor, r.orders, fmt(r.spend)]),
      };
    },
  },
};

const fmt = (n) => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(n) || 0)}`;

const ReportView = () => {
  const { reportKey } = useParams();
  const cfg = REPORTS[reportKey];
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    if (!cfg) {
      setState({ loading: false, error: `Unknown report: ${reportKey}`, data: null });
      return;
    }
    setState({ loading: true, error: null, data: null });
    cfg.fetch()
      .then(raw => setState({ loading: false, error: null, data: cfg.build(raw) }))
      .catch(err => {
        console.error(err);
        setState({
          loading: false,
          error: err?.response?.data?.message || err.message || 'Failed to load report',
          data: null,
        });
      });
  }, [reportKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const view = useMemo(() => state.data, [state.data]);

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ backgroundColor: '#fff', p: 2, px: 3, borderBottom: '1px solid #e2e8f0',
                   display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">{cfg ? cfg.title : 'Report'}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9',
                       px: 2, py: 0.5, borderRadius: '8px' }}>
              <SearchIcon fontSize="small" sx={{ mr: 1 }} />
              <InputBase placeholder="Search..." />
            </Box>
            <NotificationsNoneIcon />
            <UserMenu />
            <Avatar src="/avatar.png" sx={{ width: 32, height: 32 }} />
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '12px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">{cfg ? cfg.title : 'Unknown Report'}</Typography>
              {view && <Chip label={`${view.rows.length} rows`} size="small" />}
            </Box>

            {state.loading && (
              <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Box>
            )}
            {state.error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>{state.error}</Alert>
            )}
            {!state.loading && !state.error && view && view.rows.length === 0 && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>No data available for this report.</Alert>
            )}
            {!state.loading && !state.error && view && view.rows.length > 0 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {view.columns.map(c => (
                        <TableCell key={c} sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}>{c}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {view.rows.map((r, i) => (
                      <TableRow key={i} hover>
                        {r.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ReportView;
