const Product = require('../models/products');

exports.getAll = (req, res) => {
  Product.getAll((err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};


exports.create = (req, res) => {
  const data = req.body;

  // Required
  if (!data.product_name || !data.product_name.trim())
    return res.status(400).json({ error: 'Product name is required' });

  // Price must be positive numbers
  if (data.sale_price && (isNaN(data.sale_price) || parseFloat(data.sale_price) < 0))
    return res.status(400).json({ error: 'Sale price must be a positive number' });
  if (data.purchase_price && (isNaN(data.purchase_price) || parseFloat(data.purchase_price) < 0))
    return res.status(400).json({ error: 'Purchase price must be a positive number' });

  // Discount 0-100
  if (data.sale_discount && (isNaN(data.sale_discount) || parseFloat(data.sale_discount) < 0 || parseFloat(data.sale_discount) > 100))
    return res.status(400).json({ error: 'Sale discount must be between 0 and 100' });
  if (data.purchase_discount && (isNaN(data.purchase_discount) || parseFloat(data.purchase_discount) < 0 || parseFloat(data.purchase_discount) > 100))
    return res.status(400).json({ error: 'Purchase discount must be between 0 and 100' });

  // Sanitize
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') data[key] = data[key].trim();
  });

  const { sku } = data;
  Product.findBySKU(sku, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length > 0)
      return res.status(400).json({ error: 'Product with same SKU already exists' });

    Product.create(data, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Product created', id: result.insertId });
    });
  });
};


exports.getOne = (req, res) => {
  Product.getById(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!result) return res.status(404).json({ message: 'Product not found' });
    res.json(result);
  });
};




exports.update = (req, res) => {
  Product.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product updated' });
  });
};

exports.remove = (req, res) => {
  Product.remove(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product deleted' });
  });
};
