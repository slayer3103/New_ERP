const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.js');


router.get('/summary',invoiceController.getDashboardSummary);
router.get('/recent',invoiceController.getRecentInvoices);
router.get('/over-time',invoiceController.getInvoicesOverTime);
router.get('/analytics/sales', invoiceController.getSalesAnalytics);
router.get('/next-number', invoiceController.getNextInvoiceNumber);

router.get('/', invoiceController.getAll);
router.get('/:id', invoiceController.getOne);
router.post('/', invoiceController.create);
router.delete('/:id', invoiceController.remove);
router.put('/:id', invoiceController.update);
router.patch('/:id/status', invoiceController.updateStatus);

module.exports = router;