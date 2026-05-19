const db = require('../config/db');

exports.getAll = (callback) => {
  db.query('SELECT * FROM categories', callback);
};

exports.create = (data, callback) => {
  db.query('INSERT INTO categories (category_name) VALUES (?)', [data.category_name], callback);
};

exports.update = (id, data, callback) => {
  db.query('UPDATE categories SET category_name = ? WHERE id = ?', [data.category_name, id], callback);
};

exports.remove = (id, callback) => {
  db.query('DELETE FROM categories WHERE id = ?', [id], callback);
};
