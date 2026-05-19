const db = require('../config/db');

exports.findByUsername = (username, callback) => {
  db.query('SELECT * FROM users WHERE username = ?', [username], callback);
};

exports.createUser = (data, callback) => {
  db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [data.username, data.password, data.role], callback);
};
