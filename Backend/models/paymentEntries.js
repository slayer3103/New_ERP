// models/paymentEntries.js
const db = require('../config/db');

// Utility to promisify db.query
function query(sql, values = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}


const PaymentEntry = {
  // Get all payment entries
  getAll: (callback) => {
    db.query(
      `SELECT pe.*, i.invoice_number, i.customer_name 
       FROM payment_entries pe 
       JOIN invoice i ON pe.invoice_id = i.invoice_id 
       ORDER BY pe.created_at DESC`,
      callback
    );
  },

  // Get payment entry by ID
  getById: (id, callback) => {
    db.query(
      `SELECT pe.*, i.invoice_number, i.customer_name 
       FROM payment_entries pe 
       JOIN invoice i ON pe.invoice_id = i.invoice_id 
       WHERE pe.payment_id = ?`,
      [id],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
      }
    );
  },

  // Get payment entries by invoice ID
  getByInvoiceId: (invoiceId, callback) => {
    db.query(
      'SELECT * FROM payment_entries WHERE invoice_id = ? ORDER BY created_at DESC',
      [invoiceId],
      callback
    );
  },

  // Create new payment entry
  create: async (paymentData, callback) => {
    try {
      // First, get the invoice total
      const invoiceResult = await query(
        'SELECT grand_total FROM invoice WHERE invoice_id = ?',
        [paymentData.invoice_id]
      );

      if (invoiceResult.length === 0) {
        return callback(new Error('Invoice not found'));
      }

      const invoiceTotal = parseFloat(invoiceResult[0].grand_total);
      
      // Calculate total payments made so far for this invoice
      const paymentsResult = await query(
        'SELECT COALESCE(SUM(amount), 0) as total_paid FROM payment_entries WHERE invoice_id = ?',
        [paymentData.invoice_id]
      );

      const totalPaid = parseFloat(paymentsResult[0].total_paid);
      const newPaymentAmount = parseFloat(paymentData.amount);
      const remainingBalance = invoiceTotal - (totalPaid + newPaymentAmount);

      // Insert the payment entry
      const insertSql = `
        INSERT INTO payment_entries 
        (invoice_id, invoice_number, payment_date, payment_mode, currency, amount, invoice_total, remaining_balance) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          paymentData.invoice_id,
          paymentData.invoice_number,
          paymentData.payment_date,
          paymentData.payment_mode,
          paymentData.currency,
          newPaymentAmount,
          invoiceTotal,
          remainingBalance
        ],
        (err, result) => {
          if (err) return callback(err);
          
          // Update invoice status based on remaining balance
          let newStatus = 'Draft';
          if (remainingBalance <= 0) {
            newStatus = 'Paid';
          } else if (totalPaid + newPaymentAmount > 0) {
            newStatus = 'Partial';
          }

          // Update invoice status
          db.query(
            'UPDATE invoice SET status = ? WHERE invoice_id = ?',
            [newStatus, paymentData.invoice_id],
            (updateErr) => {
              if (updateErr) console.error('Error updating invoice status:', updateErr);
              callback(null, { insertId: result.insertId, remainingBalance, invoiceTotal });
            }
          );
        }
      );
    } catch (error) {
      callback(error);
    }
  },

  // Update payment entry
  update: (id, paymentData, callback) => {
    const sql = `
      UPDATE payment_entries 
      SET payment_date = ?, payment_mode = ?, currency = ?, amount = ?, remaining_balance = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE payment_id = ?
    `;
    
    db.query(
      sql,
      [
        paymentData.payment_date,
        paymentData.payment_mode,
        paymentData.currency,
        paymentData.amount,
        paymentData.remaining_balance || 0,
        id
      ],
      callback
    );
  },

  // Delete payment entry
  remove: (id, callback) => {
    db.query('DELETE FROM payment_entries WHERE payment_id = ?', [id], callback);
  }
};

module.exports = PaymentEntry;