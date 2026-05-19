// models/purchase.js
const db = require('../config/db');
const { promisify } = require('util');
const query = promisify(db.query).bind(db);

// Get all purchase orders with items
exports.getAll = async (callback) => {
  try {
    // Get active financial year with date range
    const activeFinancialYear = await query(
      'SELECT start_date, end_date, id as financial_year_id FROM financial_years WHERE is_active = TRUE'
    );
    
    if (activeFinancialYear.length === 0) {
      return callback(new Error('No active financial year found'));
    }
    
    const { start_date, end_date, financial_year_id } = activeFinancialYear[0];
    
    // Query purchase orders where purchase_order_date falls within the active financial year
    const sql = `
      SELECT 
        po.id, po.purchase_order_no, po.vendor_name, po.purchase_order_date, po.delivery_date,
        po.sub_total, po.cgst, po.sgst, po.total, po.due_date,
        po.customer_notes, po.terms_and_conditions,
        po.freight, po.attachment, po.vendor_id,
        poi.id as item_id, poi.item_name, poi.qty, poi.rate, poi.discount, poi.amount,
        v.vendor_name as v_vendor_name, v.company_name, v.display_name, v.email, v.phone, v.pan, v.gst,
        v.billing_address1, v.billing_address2, v.billing_city, v.billing_state, v.billing_pincode,
        v.billing_recipient_name, v.billing_fax, v.billing_phone,
        v.shipping_address1, v.shipping_address2, v.shipping_city, v.shipping_state, v.shipping_pincode,
        v.shipping_recipient_name, v.shipping_fax, v.shipping_phone,
        fy.start_date as fy_start_date,
        fy.end_date as fy_end_date,
        CONCAT('FY ', YEAR(fy.start_date), '-', RIGHT(YEAR(fy.end_date), 2)) as financial_year_name
      FROM purchase_orders po
      LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
      LEFT JOIN vendors v ON po.vendor_name = v.vendor_name
      LEFT JOIN financial_years fy ON fy.id = ?
      WHERE DATE(po.purchase_order_date) >= DATE(?) AND DATE(po.purchase_order_date) <= DATE(?)
      ORDER BY po.purchase_order_date DESC
    `;
    
    db.query(sql, [financial_year_id, start_date, end_date], callback);
  } catch (err) {
    callback(err);
  }
};

exports.getById = (id, callback) => {
  const query = `
    SELECT po.*, poi.*, 
           v.vendor_name, v.company_name, v.display_name, v.email, v.phone, v.pan, v.gst,
           v.billing_address1, v.billing_address2, v.billing_city, v.billing_state, v.billing_pincode,
           v.billing_recipient_name, v.billing_fax, v.billing_phone,
           v.shipping_address1, v.shipping_address2, v.shipping_city, v.shipping_state, v.shipping_pincode,
           v.shipping_recipient_name, v.shipping_fax, v.shipping_phone
    FROM purchase_orders po
    LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
    LEFT JOIN vendors v ON LOWER(po.vendor_name) = LOWER(v.vendor_name)
    WHERE po.id = ? OR po.purchase_order_no = ?
    ORDER BY poi.id
  `;
  db.query(query, [id, id], callback);
};

// Create purchase order with items
exports.create = (data, callback) => {
  const poData = {
    purchase_order_no: data.purchase_order_no,
    delivery_to: data.delivery_to,
    delivery_address: data.delivery_address,
    vendor_name: data.vendor_name,
    vendor_id: data.vendor_id, // Add vendor_id
    purchase_order_date: data.purchase_order_date,
    delivery_date: data.delivery_date,
    payment_terms: data.payment_terms,
    due_date: data.due_date && data.due_date.trim() !== '' ? data.due_date : null,
    customer_notes: data.customer_notes,
    terms_and_conditions: data.terms_and_conditions,
    sub_total: data.sub_total,
    freight: data.freight,
    cgst: data.cgst,
    sgst: data.sgst,
    total: data.total,
    attachment: data.attachment
  };

  db.query('INSERT INTO purchase_orders SET ?', poData, (err, result) => {
    if (err) return callback(err);
    
    const purchaseOrderId = result.insertId;

    const items = data.items.map(item => [
      purchaseOrderId,
      item.item_name,
      item.qty,
      item.rate,
      item.discount,
      item.amount,
      item.uom_description || '',
      item.uom_amount || 0
    ]);

    db.query(`
      INSERT INTO purchase_order_items 
      (purchase_order_id, item_name, qty, rate, discount, amount, uom_description, uom_amount) 
      VALUES ?
    `, [items], callback);
  });
};

// Update purchase order
exports.update = (id, data, callback) => {
  const updateQuery = `
    UPDATE purchase_orders SET 
      purchase_order_no = ?, vendor_name = ?, vendor_id = ?,
      purchase_order_date = ?, delivery_date = ?, payment_terms = ?, due_date = ?,
      customer_notes = ?, terms_and_conditions = ?, sub_total = ?, freight = ?, cgst = ?, sgst = ?, total = ?, attachment = ?
    WHERE id = ?
  `;

  const values = [
    data.purchase_order_no, data.vendor_name, data.vendor_id,
    data.purchase_order_date, data.delivery_date, data.payment_terms, 
    data.due_date && data.due_date.trim() !== '' ? data.due_date : null,
    data.customer_notes, data.terms_and_conditions, data.sub_total, data.freight,
    data.cgst, data.sgst, data.total, data.attachment, id
  ];

  db.query(updateQuery, values, (err, result) => {
    if (err) return callback(err);
    
    // If items are provided, update them as well
    if (data.items && data.items.length > 0) {
      // First delete existing items
      db.query('DELETE FROM purchase_order_items WHERE purchase_order_id = ?', [id], (deleteErr) => {
        if (deleteErr) return callback(deleteErr);
        
        // Then insert new items
        const items = data.items.map(item => [
          id,
          item.item_name,
          item.qty,
          item.rate,
          item.discount,
          item.amount,
          item.uom_description || '',
          item.uom_amount || 0
        ]);

        db.query(`
          INSERT INTO purchase_order_items 
          (purchase_order_id, item_name, qty, rate, discount, amount, uom_description, uom_amount) 
          VALUES ?
        `, [items], callback);
      });
    } else {
      callback(null, result);
    }
  });
};

// Get next purchase order number
exports.getNextPurchaseOrderNo = async (callback) => {
  try {
    // Get active financial year
    const activeFinancialYear = await query(
      'SELECT start_date, end_date, id as financial_year_id FROM financial_years WHERE is_active = TRUE'
    );
    
    if (activeFinancialYear.length === 0) {
      return callback(new Error('No active financial year found'));
    }
    
    const { start_date, end_date, financial_year_id } = activeFinancialYear[0];
    const startYear = new Date(start_date).getFullYear();
    const endYear = new Date(end_date).getFullYear();
    const financialYearSuffix = `${startYear}-${endYear.toString().slice(-2)}`;
    
    // Get the last purchase order number for this financial year
    const lastPOQuery = `
      SELECT purchase_order_no 
      FROM purchase_orders 
      WHERE purchase_order_no LIKE ? 
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    const pattern = `PO/%${financialYearSuffix}%`;
    
    db.query(lastPOQuery, [pattern], (err, results) => {
      if (err) return callback(err);
      
      let nextNumber = 1;
      
      if (results.length > 0) {
        const lastPONo = results[0].purchase_order_no;
        // Extract number from format like "PO/2024-25/001"
        const match = lastPONo.match(/\/(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      
      // Format the next purchase order number
      const formattedNumber = nextNumber.toString().padStart(3, '0');
      const nextPurchaseOrderNumber = `PO/${financialYearSuffix}/${formattedNumber}`;
      
      callback(null, { nextPurchaseOrderNumber });
    });
  } catch (err) {
    callback(err);
  }
};