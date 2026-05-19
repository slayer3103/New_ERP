const db = require('../config/db'); // assumes db is your MySQL connection
const { promisify } = require('util');
const query = promisify(db.query).bind(db);

const WorkOrder = {
  create: (data, callback) => {
    try {
      const {
        work_order_number, vendor_name, customer_name, work_order_date, due_date, payment_terms,
        subject, vendor_notes, customer_notes, terms_and_conditions, attachment_url,
        sub_total, cgst, sgst, grand_total, status , purchase_order_number, purchase_order_date
      } = data;

      // Use vendor_name if provided, otherwise fall back to customer_name for backward compatibility
      const finalVendorName = vendor_name || customer_name;
      const finalVendorNotes = vendor_notes || customer_notes;

      // Validate required fields
      if (!work_order_number || !finalVendorName || !work_order_date) {
        return callback(new Error('Missing required fields: work_order_number, vendor_name/customer_name, work_order_date'), null);
      }

    const sql = `
      INSERT INTO work_orders (
        work_order_number, customer_name, work_order_date, due_date, payment_terms,
        subject, customer_notes, terms_and_conditions, attachment_url,
        sub_total, cgst, sgst, grand_total, status , purchase_order_number, purchase_order_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?, ?)
    `;

    db.query(sql, [
      work_order_number, finalVendorName, work_order_date, due_date, payment_terms,
      subject, finalVendorNotes, terms_and_conditions, attachment_url,
      sub_total, cgst, sgst, grand_total, status , purchase_order_number, purchase_order_date
    ], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return callback(err);
      }
      callback(null, result);
    });
    } catch (error) {
      console.error('Work order creation failed:', error);
      callback(error);
    }
  },

  getAll: async (callback) => {
    try {
      // Get active financial year with date range
      const activeFinancialYear = await query(
        'SELECT start_date, end_date, id as financial_year_id FROM financial_years WHERE is_active = TRUE'
      );
      
      if (activeFinancialYear.length === 0) {
        return callback(new Error('No active financial year found'));
      }
      
      const { start_date, end_date, financial_year_id } = activeFinancialYear[0];
      
      // Query work orders where work_order_date falls within the active financial year
      const sql = `
        SELECT 
          wo.*,
          fy.start_date as fy_start_date,
          fy.end_date as fy_end_date,
          CONCAT('FY ', YEAR(fy.start_date), '-', RIGHT(YEAR(fy.end_date), 2)) as financial_year_name
        FROM work_orders wo
        LEFT JOIN financial_years fy ON fy.id = ?
        WHERE DATE(wo.work_order_date) >= DATE(?) AND DATE(wo.work_order_date) <= DATE(?)
        ORDER BY wo.work_order_date DESC
      `;
      
      db.query(sql, [financial_year_id, start_date, end_date], callback);
    } catch (err) {
      callback(err);
    }
  },

  getById: (id, callback) => {
    const sql = `
      SELECT
        wo.*,      
        v.vendor_name, v.billing_recipient_name, v.billing_address1, v.billing_address2, v.billing_city, v.billing_state, v.billing_pincode, v.billing_country, v.gst,
        v.shipping_recipient_name, v.shipping_address1, v.shipping_address2, v.shipping_city, v.shipping_state, v.shipping_pincode, v.shipping_country
      FROM
        work_orders wo
      LEFT JOIN
        vendors v ON wo.customer_name = v.vendor_name
      WHERE
        wo.work_order_id = ?
    `;
    db.query(sql, [id], callback);
  },

  update: (id, data, callback) => {
    console.log('Work Order Model Update - ID:', id);
    console.log('Work Order Model Update - Data:', JSON.stringify(data, null, 2));
    
    try {
      // Build dynamic update query based on provided fields
      const updateFields = [];
      const queryParams = [];
      
      // Add fields that can be updated
      if (data.customer_name !== undefined) {
        updateFields.push('customer_name = ?');
        queryParams.push(data.customer_name);
      }
      if (data.work_order_number !== undefined) {
        updateFields.push('work_order_number = ?');
        queryParams.push(data.work_order_number);
      }
      if (data.work_order_date !== undefined) {
        updateFields.push('work_order_date = ?');
        // work_order_date is required (NOT NULL), so don't convert empty string to NULL
        queryParams.push(data.work_order_date);
      }
      if (data.expiry_date !== undefined || data.due_date !== undefined) {
        updateFields.push('due_date = ?');
        // Convert empty string to NULL for MySQL date field
        const dateValue = data.expiry_date !== undefined ? data.expiry_date : data.due_date;
        queryParams.push(dateValue === '' ? null : dateValue);
      }
      if (data.status !== undefined) {
        updateFields.push('status = ?');
        queryParams.push(data.status);
      }
      if (data.grand_total !== undefined) {
        updateFields.push('grand_total = ?');
        queryParams.push(data.grand_total);
      }
      if (data.payment_terms !== undefined) {
        updateFields.push('payment_terms = ?');
        queryParams.push(data.payment_terms);
      }
      if (data.subject !== undefined) {
        updateFields.push('subject = ?');
        queryParams.push(data.subject);
      }
      if (data.customer_notes !== undefined) {
        updateFields.push('customer_notes = ?');
        queryParams.push(data.customer_notes);
      }
      if (data.terms_and_conditions !== undefined) {
        updateFields.push('terms_and_conditions = ?');
        queryParams.push(data.terms_and_conditions);
      }
      if (data.attachment_url !== undefined) {
        updateFields.push('attachment_url = ?');
        queryParams.push(data.attachment_url);
      }
      if (data.sub_total !== undefined) {
        updateFields.push('sub_total = ?');
        queryParams.push(data.sub_total);
      }
      if (data.cgst !== undefined) {
        updateFields.push('cgst = ?');
        queryParams.push(data.cgst);
      }
      if (data.sgst !== undefined) {
        updateFields.push('sgst = ?');
        queryParams.push(data.sgst);
      }
      if (data.purchase_order_number !== undefined) {
        updateFields.push('purchase_order_number = ?');
        queryParams.push(data.purchase_order_number);
      }
      if (data.purchase_order_date !== undefined) {
        updateFields.push('purchase_order_date = ?');
        // Convert empty string to NULL for MySQL date field
        queryParams.push(data.purchase_order_date === '' ? null : data.purchase_order_date);
      }
      
      // If no fields to update, return error
      if (updateFields.length === 0) {
        return callback(new Error('No valid fields provided for update'));
      }
      
      // Add work_order_id to the end of params
      queryParams.push(id);
      
      const sql = `UPDATE work_orders SET ${updateFields.join(', ')} WHERE work_order_id = ?`;
      
      console.log('SQL Query:', sql);
      console.log('Query Parameters:', queryParams);

      db.query(sql, queryParams, (err, result) => {
        if (err) {
          console.error('Database Query Error:', err);
          console.error('Error details:', {
            code: err.code,
            errno: err.errno,
            sqlMessage: err.sqlMessage,
            sqlState: err.sqlState,
            index: err.index,
            sql: err.sql
          });
          return callback(err);
        }
        console.log('Database Query Success:', result);
        console.log('Affected rows:', result.affectedRows);
        callback(null, result);
      });
    } catch (error) {
      console.error('Update function error:', error);
      callback(error);
    }
  },

  remove: (id, callback) => {
    db.query('DELETE FROM work_orders WHERE work_order_id = ?', [id], callback);
  }
};

module.exports = WorkOrder;
