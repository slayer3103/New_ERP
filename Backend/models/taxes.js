const db = require('../config/db');

exports.getAll = (callback) => {
  db.query('SELECT * FROM taxes', callback);
};

exports.create = (data, callback) => {
  const { tax_name, tax_rate, tax_code, details, status, effective_date } = data;
  const sql = `
    INSERT INTO taxes (tax_name, tax_rate, tax_code, details, status, effective_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [tax_name, tax_rate, tax_code, details, status, effective_date], callback);
};

exports.update = (id, data, callback) => {
  const { tax_name, tax_rate, tax_code, details, status, effective_date } = data;
  const sql = `
    UPDATE taxes
    SET tax_name = ?, tax_rate = ?, tax_code = ?, details = ?, status = ?, effective_date = ?
    WHERE id = ?
  `;
  db.query(sql, [tax_name, tax_rate, tax_code, details, status, effective_date, id], callback);
};

exports.remove = (id, callback) => {
  db.query('DELETE FROM taxes WHERE id = ?', [id], callback);
};

exports.updateStatus = (id, status, callback) => {
  const sql = `UPDATE taxes SET status = ? WHERE id = ?`;
  db.query(sql, [status, id], callback);
};

exports.getById = (id, callback) => {
  db.query('SELECT * FROM taxes WHERE id = ?', [id], callback);
};
