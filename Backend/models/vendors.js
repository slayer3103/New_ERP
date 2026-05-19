const db = require('../config/db');

exports.getAll = (cb) => {
  db.query('SELECT * FROM vendors', cb);
};

exports.getById = (id, cb) => {
  db.query('SELECT * FROM vendors WHERE id = ?', [id], (err, rows) => {
    if (err) return cb(err);
    cb(null, rows[0]);
  });
};

exports.getByName = (name, cb) => {
  db.query('SELECT * FROM vendors WHERE LOWER(vendor_name) = LOWER(?)', [name], (err, rows) => {
    if (err) return cb(err);
    cb(null, rows[0]);
  });
};

exports.create = (data, cb) => {
  const {
    vendor_name, company_name, display_name, email, phone, pan, gst,
    billing_recipient_name, billing_country, billing_address1, billing_address2,
    billing_city, billing_state, billing_pincode, billing_fax, billing_phone,
    shipping_recipient_name, shipping_country, shipping_address1, shipping_address2,
    shipping_city, shipping_state, shipping_pincode, shipping_fax, shipping_phone,
    account_holder_name, bank_name, account_number, ifsc, remark, status
  } = data;

  db.query(`
    INSERT INTO vendors (
      vendor_name, company_name, display_name, email, phone, pan, gst,
      billing_recipient_name, billing_country, billing_address1, billing_address2,
      billing_city, billing_state, billing_pincode, billing_fax, billing_phone,
      shipping_recipient_name, shipping_country, shipping_address1, shipping_address2,
      shipping_city, shipping_state, shipping_pincode, shipping_fax, shipping_phone,
      account_holder_name, bank_name, account_number, ifsc, remark, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    vendor_name, company_name, display_name, email, phone, pan, gst,
    billing_recipient_name, billing_country, billing_address1, billing_address2,
    billing_city, billing_state, billing_pincode, billing_fax, billing_phone,
    shipping_recipient_name, shipping_country, shipping_address1, shipping_address2,
    shipping_city, shipping_state, shipping_pincode, shipping_fax, shipping_phone,
    account_holder_name, bank_name, account_number, ifsc, remark, status || 'Active'
  ], cb);
};

exports.update = (id, data, cb) => {
  const {
    vendor_name, company_name, display_name, email, phone, pan, gst,
    billing_recipient_name, billing_country, billing_address1, billing_address2,
    billing_city, billing_state, billing_pincode, billing_fax, billing_phone,
    shipping_recipient_name, shipping_country, shipping_address1, shipping_address2,
    shipping_city, shipping_state, shipping_pincode, shipping_fax, shipping_phone,
    account_holder_name, bank_name, account_number, ifsc, remark, status
  } = data;

  db.query(`
    UPDATE vendors SET
      vendor_name=?, company_name=?, display_name=?, email=?, phone=?, pan=?, gst=?,
      billing_recipient_name=?, billing_country=?, billing_address1=?, billing_address2=?,
      billing_city=?, billing_state=?, billing_pincode=?, billing_fax=?, billing_phone=?,
      shipping_recipient_name=?, shipping_country=?, shipping_address1=?, shipping_address2=?,
      shipping_city=?, shipping_state=?, shipping_pincode=?, shipping_fax=?, shipping_phone=?,
      account_holder_name=?, bank_name=?, account_number=?, ifsc=?, remark=?, status=?
    WHERE id=?`,
    [
      vendor_name, company_name, display_name, email, phone, pan, gst,
      billing_recipient_name, billing_country, billing_address1, billing_address2,
      billing_city, billing_state, billing_pincode, billing_fax, billing_phone,
      shipping_recipient_name, shipping_country, shipping_address1, shipping_address2,
      shipping_city, shipping_state, shipping_pincode, shipping_fax, shipping_phone,
      account_holder_name, bank_name, account_number, ifsc, remark, status || 'Active', id
    ], cb);
};

exports.remove = (id, cb) => {
  db.query('DELETE FROM vendors WHERE id=?', [id], cb);
};

exports.updateStatus = (id, status, cb) => {
  db.query('UPDATE vendors SET status=? WHERE id=?', [status, id], cb);
};