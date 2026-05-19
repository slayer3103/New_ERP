const db = require('../config/db');

exports.getAll = (callback) => {
  db.query('SELECT * FROM product_units', callback);
};


exports.create = (data, callback) => {
  db.query('INSERT INTO product_units (unit_name) VALUES (?)', [data.unit_name], callback);
};


exports.update = (id, data, callback) => {
  db.query('UPDATE product_units SET unit_name = ? WHERE id = ?', [data.unit_name, id], callback);
};


exports.remove = (id, callback) => {
  db.query('DELETE FROM product_units WHERE id = ?', [id], callback);
};
