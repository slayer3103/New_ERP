const Vendor = require('../models/vendors');

exports.getAll = (req, res) => {
  Vendor.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.getById = (req, res) => {
  const id = req.params.id;
  Vendor.getById(id, (err, vendor) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  });
};

exports.getByName = (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Vendor name is required' });
  Vendor.getByName(name, (err, vendor) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  });
};

exports.create = (req, res) => {
  const data = req.body;

  // Required
  if (!data.vendor_name || !data.vendor_name.trim())
    return res.status(400).json({ message: 'Vendor name is required' });

  // Email format
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return res.status(400).json({ message: 'Invalid email format' });

  // Phone — 10 digits
  if (data.phone && !/^\d{10}$/.test(data.phone))
    return res.status(400).json({ message: 'Phone must be 10 digits' });

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

  // IFSC format
  if (data.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifsc.toUpperCase()))
    return res.status(400).json({ message: 'Invalid IFSC code (e.g. SBIN0001234)' });

  // Account number — numeric only
  if (data.account_number && !/^\d{9,18}$/.test(data.account_number))
    return res.status(400).json({ message: 'Account number must be 9-18 digits' });

  // Sanitize
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') data[key] = data[key].trim();
  });
  if (data.pan)  data.pan  = data.pan.toUpperCase();
  if (data.gst)  data.gst  = data.gst.toUpperCase();
  if (data.ifsc) data.ifsc = data.ifsc.toUpperCase();

  Vendor.create(data, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ id: result.insertId });
  });
};

exports.update = (req, res) => {
  Vendor.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
};

exports.remove = (req, res) => {
  Vendor.remove(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
};

exports.updateStatus = (req, res) => {
  Vendor.updateStatus(req.params.id, req.body.status, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
};