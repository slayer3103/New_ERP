const ProductUnit = require('../models/product_units');

exports.getAll = (req, res) => {
  ProductUnit.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

exports.create = (req, res) => {
  ProductUnit.create(req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: 'Unit Created', id: result.insertId });
  });
};

exports.update = (req, res) => {
  ProductUnit.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Unit Updated' });
  });
};

exports.remove = (req, res) => {
  ProductUnit.remove(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Unit Deleted' });
  });
};
