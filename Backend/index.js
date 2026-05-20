require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
require('./config/db'); 
const productUnitRoutes = require('./routes/product_units');
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');


const allowedOrigins = [
  "https://erp-system-as6ukav32-saurabhshendurkar3103-8214s-projects.vercel.app",
  "https://erp-system-git-main-saurabhshendurkar3103-8214s-projects.vercel.app",
  "https://new-erp-git-main-saurabhshendurkar3103-8214s-projects.vercel.app",
  "https://new-8mw8fl6df-saurabhshendurkar3103-8214s-projects.vercel.app",
  "https://new-erp-one.vercel.app"
];


app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


app.use(bodyParser.json());

//product units routes
app.use('/api/units', productUnitRoutes);
app.use('/api/product_units', productUnitRoutes);

// Authentication routes: for /api/auth/register and /api/auth/login
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Tax routes: for /api/taxes
const taxRoutes = require('./routes/taxes');
app.use('/api/taxes', taxRoutes);

// Product routes: for /api/categories
const categoryRoutes = require('./routes/categories');
app.use('/api/categories', categoryRoutes);

// Product routes: for /api/vendors
const vendorRoutes = require('./routes/vendors');
app.use('/api/vendors', vendorRoutes);

const quotationRoutes = require('./routes/quotation');
app.use ('/api/quotation',quotationRoutes)

const PurchaseRoutes = require('./routes/purchase');
app.use ('/api/purchase',PurchaseRoutes)

// Product routes: for /api/customers
const customerRoutes = require('./routes/customers');
app.use('/api/customers', customerRoutes);

// Product routes: for /api/products
const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);

// Financial Year routes: for /api/financial-year
const financialYearRoutes = require('./routes/financialYear');
app.use('/api/financialYear', financialYearRoutes);

const invoiceRoutes = require('./routes/invoice');
app.use('/api/invoice', invoiceRoutes);

// const workOrderRoutes = require('./routes/workorders');
// app.use('/api', workOrderRoutes);

// Test routes for work orders (must be before main routes)
app.get('/api/work-orders/test', (req, res) => {
  console.log('Work Orders Test Route Hit');
  res.json({ message: 'Work Orders API is accessible', timestamp: new Date() });
});

// Test route to check table structure
app.get('/api/work-orders/table-info', (req, res) => {
  const db = require('./config/db');
  db.query('DESCRIBE work_orders', (err, result) => {
    if (err) {
      console.error('Table info error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ tableStructure: result });
  });
});

const workOrderRoutes = require('./routes/workOrders');
app.use('/api/work-orders', workOrderRoutes);

// Payment entries routes: for /api/payment-entries
const paymentEntriesRoutes = require('./routes/paymentEntries');
app.use('/api/payment-entries', paymentEntriesRoutes);

// Analytics routes: for /api/analytics
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);





app.get('/', (req, res) => {
  res.send('✅ Server is running and MySQL should be connected');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
