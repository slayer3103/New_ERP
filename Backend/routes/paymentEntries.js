// routes/paymentEntries.js
const express = require('express');
const router = express.Router();
const paymentEntriesController = require('../controllers/paymentEntries');

// Get all payment entries
router.get('/', paymentEntriesController.getAll);


// Get payment entry by ID
router.get('/:id', paymentEntriesController.getOne);

// Get payment entries by invoice ID
router.get('/invoice/:invoiceId', paymentEntriesController.getByInvoice);

// Create new payment entry
router.post('/', paymentEntriesController.create);

// Update payment entry
router.put('/:id', paymentEntriesController.update);

// Delete payment entry
router.delete('/:id', paymentEntriesController.remove);

module.exports = router;