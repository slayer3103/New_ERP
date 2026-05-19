// routes/analytics.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics');

// Sales Reports
router.get('/sales/by-customers', analyticsController.getSalesByCustomers);
router.get('/sales/by-products', analyticsController.getSalesByProducts);
router.get('/sales/detailed', analyticsController.getSalesDetailed);

// Tax Reports
router.get('/tax/gst-summary', analyticsController.getGstSummary);
router.get('/tax/liability', analyticsController.getTaxLiability);

// Payment Reports
router.get('/payments/outstanding', analyticsController.getOutstandingInvoices);
router.get('/payments/receipts', analyticsController.getPaymentReceipts);

// Purchase Reports
router.get('/purchase/po-summary', analyticsController.getPOSummaries);
router.get('/purchase/vendor-spend', analyticsController.getVendorSpendAnalysis);

module.exports = router;
