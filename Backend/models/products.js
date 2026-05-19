const db = require('../config/db'); // adjust this path if needed

const Product = {
  getAll: (callback) => {
    db.query('SELECT * FROM products_services', callback);
  },

  create: (data, callback) => {
    const sql = `
      INSERT INTO products_services (
        type, product_name, sku, tax_applicable, status, category, unit,
        sale_price, sale_discount, sale_discount_type, sale_description,
        purchase_price, purchase_discount, purchase_discount_type, purchase_description,
        preferred_vendor
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.type,
      data.product_name,
      data.sku,
      data.tax_applicable,
      data.status,
      data.category,
      data.unit,

      data.sale_price,
      data.sale_discount,
      data.sale_discount_type,
      data.sale_description,

      data.purchase_price,
      data.purchase_discount,
      data.purchase_discount_type,
      data.purchase_description,

      data.preferred_vendor
    ];

    db.query(sql, values, callback);
  },

  update: (id, data, callback) => {
    const sql = `
      UPDATE products_services SET
        type = ?, product_name = ?, sku = ?, tax_applicable = ?, status = ?, category = ?, unit = ?,
        sale_price = ?, sale_discount = ?, sale_discount_type = ?, sale_description = ?,
        purchase_price = ?, purchase_discount = ?, purchase_discount_type = ?, purchase_description = ?,
        preferred_vendor = ?
      WHERE id = ?
    `;

    const values = [
      data.type,
      data.product_name,
      data.sku,
      data.tax_applicable,
      data.status,
      data.category,
      data.unit,

      data.sale_price,
      data.sale_discount,
      data.sale_discount_type,
      data.sale_description,

      data.purchase_price,
      data.purchase_discount,
      data.purchase_discount_type,
      data.purchase_description,

      data.preferred_vendor,
      id
    ];

    db.query(sql, values, callback);
  },

  remove: (id, callback) => {
    db.query('DELETE FROM products_services WHERE id = ?', [id], callback);
  },

  findBySKU: (sku, callback) => {
  db.query('SELECT * FROM products_services WHERE sku = ?', [sku], callback);
},

  
  getById: (id, callback) => {
  db.query('SELECT * FROM products_services WHERE id = ?', [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]); // return single item
  });
}

};

module.exports = Product;
