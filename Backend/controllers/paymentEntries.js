// controllers/paymentEntries.js
const PaymentEntry = require('../models/paymentEntries');

exports.getAll = (req, res) => {
  PaymentEntry.getAll((err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};


exports.getOne = (req, res) => {
  const id = req.params.id;
  PaymentEntry.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!result) return res.status(404).json({ message: 'Payment entry not found' });
    res.json(result);
  });
};

exports.getByInvoice = (req, res) => {
  const invoiceId = req.params.invoiceId;
  PaymentEntry.getByInvoiceId(invoiceId, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

exports.create = (req, res) => {
  const paymentData = req.body;

  // Required fields
  if (!paymentData.invoice_id)
    return res.status(400).json({ error: 'Invoice is required' });
  if (!paymentData.invoice_number)
    return res.status(400).json({ error: 'Invoice number is required' });
  if (!paymentData.payment_date)
    return res.status(400).json({ error: 'Payment date is required' });
  if (!paymentData.amount)
    return res.status(400).json({ error: 'Amount is required' });

  // Amount must be positive
  const amount = parseFloat(paymentData.amount);
  if (isNaN(amount) || amount <= 0)
    return res.status(400).json({ error: 'Amount must be greater than 0' });

  // Payment date cannot be in future
  const today = new Date().toISOString().split('T')[0];
  if (paymentData.payment_date > today)
    return res.status(400).json({ error: 'Payment date cannot be in the future' });

  // Valid payment modes
  const validModes = ['Cash', 'Online', 'Cheque'];
  if (paymentData.payment_mode && !validModes.includes(paymentData.payment_mode))
    return res.status(400).json({ error: 'Invalid payment mode. Must be Cash, Online, or Cheque' });

  // Set defaults
  paymentData.payment_mode = paymentData.payment_mode || 'Cash';
  paymentData.currency = paymentData.currency || 'INR';

  PaymentEntry.create(paymentData, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ 
      message: 'Payment entry created successfully', 
      paymentId: result.insertId,
      remainingBalance: result.remainingBalance,
      invoiceTotal: result.invoiceTotal
    });
  });
};

exports.update = (req, res) => {
  const id = req.params.id;
  const paymentData = req.body;
  
  PaymentEntry.update(id, paymentData, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Payment entry not found' });
    }
    res.json({ message: 'Payment entry updated successfully' });
  });
};

exports.remove = (req, res) => {
  const id = req.params.id;
  PaymentEntry.remove(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Payment entry not found' });
    }
    res.json({ message: 'Payment entry deleted successfully' });
  });
};

module.exports = exports;