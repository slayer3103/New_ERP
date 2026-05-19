const Customer = require('../models/customers');

exports.getAll = (req, res) => {
  Customer.getAll((err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

exports.getById = (req, res) => {
  Customer.getById(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!result) return res.status(404).json({ message: 'Customer not found' });
    res.json(result);
  });
};

exports.create = (req, res) => {
  const data = req.body;

  // Required fields
  if (!data.customer_name || !data.customer_name.trim())
    return res.status(400).json({ message: 'Customer name is required' });
  if (!data.display_name || !data.display_name.trim())
    return res.status(400).json({ message: 'Display name is required' });

  // Email format
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return res.status(400).json({ message: 'Invalid email format' });

  // Mobile — 10 digits
  if (data.mobile && !/^\d{10}$/.test(data.mobile))
    return res.status(400).json({ message: 'Mobile must be 10 digits' });

  // PAN format
  if (data.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.pan.toUpperCase()))
    return res.status(400).json({ message: 'Invalid PAN format (e.g. ABCDE1234F)' });

  // GST format
  if (data.gst && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(data.gst.toUpperCase()))
    return res.status(400).json({ message: 'Invalid GST format (e.g. 27ABCDE1234F1Z5)' });

  // Pincode — 6 digits
  if (data.billing_pincode && !/^\d{6}$/.test(data.billing_pincode))
    return res.status(400).json({ message: 'Billing pincode must be 6 digits' });
  if (data.shipping_pincode && !/^\d{6}$/.test(data.shipping_pincode))
    return res.status(400).json({ message: 'Shipping pincode must be 6 digits' });

  // Sanitize — trim all string fields
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') data[key] = data[key].trim();
  });
  if (data.pan) data.pan = data.pan.toUpperCase();
  if (data.gst) data.gst = data.gst.toUpperCase();

  Customer.create(data, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Customer added', id: result.insertId });
  });
};

exports.update = (req, res) => {
  const data = req.body;

  if (!data.customer_name || !data.customer_name.trim())
    return res.status(400).json({ message: 'Customer name is required' });
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return res.status(400).json({ message: 'Invalid email format' });
  if (data.mobile && !/^\d{10}$/.test(data.mobile))
    return res.status(400).json({ message: 'Mobile must be 10 digits' });
  if (data.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.pan.toUpperCase()))
    return res.status(400).json({ message: 'Invalid PAN format' });
  if (data.gst && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(data.gst.toUpperCase()))
    return res.status(400).json({ message: 'Invalid GST format' });
  if (data.billing_pincode && !/^\d{6}$/.test(data.billing_pincode))
    return res.status(400).json({ message: 'Billing pincode must be 6 digits' });

  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') data[key] = data[key].trim();
  });
  if (data.pan) data.pan = data.pan.toUpperCase();
  if (data.gst) data.gst = data.gst.toUpperCase();

  Customer.update(req.params.id, data, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Customer updated' });
  });
};

exports.remove = (req, res) => {
  Customer.remove(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Customer deleted' });
  });
};

exports.updateStatus = (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  Customer.updateStatus(req.params.id, status, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Customer status updated' });
  });
};