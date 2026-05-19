const Category = require('../models/categories');

exports.getAll = (req, res) => {
  Category.getAll((err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
};

exports.create = (req, res) => {
  Category.create(req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: 'Category created', id: result.insertId });
  });
};

exports.update = (req, res) => {
  Category.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Category updated' });
  });
};

exports.remove = (req, res) => {
  Category.remove(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Category deleted' });
  });
};
