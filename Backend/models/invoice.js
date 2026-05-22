// models/invoice.js
const db = require('../config/db');

// Utility to promisify db.query (optional, but helpful for existing async logic)
function query(sql, values = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

const invoice = {
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
      
      // Query invoices where invoice_date falls within the active financial year
      const sql = `
        SELECT 
          i.invoice_id, i.invoice_number, i.customer_id, i.customer_name, i.invoice_date, 
          i.expiry_date, i.subject, i.customer_notes, i.terms_and_conditions, 
          i.sub_total, i.freight, i.cgst, i.sgst, i.igst, i.grand_total, i.status,
          fy.start_date as fy_start_date,
          fy.end_date as fy_end_date,
          CONCAT('FY ', YEAR(fy.start_date), '-', RIGHT(YEAR(fy.end_date), 2)) as financial_year_name
        FROM invoice i
        LEFT JOIN financial_years fy ON fy.id = ?
        WHERE DATE(i.invoice_date) >= DATE(?) AND DATE(i.invoice_date) <= DATE(?)
        ORDER BY i.invoice_date DESC
      `;
      
      db.query(sql, [financial_year_id, start_date, end_date], callback);
    } catch (err) {
      callback(err);
    }
  },

  getById: (id, callback) => {
    db.query(
      'SELECT invoice_id, invoice_number, customer_id, customer_name, invoice_date, expiry_date, subject, customer_notes, terms_and_conditions, sub_total, freight, cgst, sgst, igst, grand_total, status FROM invoice WHERE invoice_id = ?',
      [id],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
      }
    );
  },

  getItemsByInvoiceId: (invoiceId, callback) => {
    db.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoiceId], callback);
  },


  getInvoiceSummary: (callback) => {
    db.query(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Draft' THEN 1 ELSE 0 END) AS draft,
        SUM(CASE WHEN status = 'Partial' THEN 1 ELSE 0 END) AS partial,
        SUM(CASE WHEN status = 'Paid' THEN 1 ELSE 0 END) AS paid
      FROM invoice`,
      (err, rows) => {
        if (err) return callback(err);
        callback(null, rows[0]);
      }
    );
  },

  getRecentInvoices: (callback) => {
    db.query(
      `SELECT invoice_id AS id, invoice_number AS name, customer_name AS client_name, status, invoice_date AS date FROM invoice ORDER BY invoice_date DESC LIMIT 4`,
      (err, rows) => {
        if (err) return callback(err);
        callback(null, rows);
      }
    );
  },

  getInvoicesOverTime: (callback) => {
    db.query(
      `SELECT DATE_FORMAT(invoice_date,  '%b') AS name, COUNT(*) AS invoices FROM invoice GROUP BY name, MONTH(invoice_date) ORDER BY MONTH(invoice_date) LIMIT 6`,
      (err, rows) => {
        if (err) return callback(err);
        callback(null, rows);
      }
    );
  },

  // Get the next invoice number based on active financial year
  getNextInvoiceNumber: (callback) => {
    db.query(
      'SELECT start_date FROM financial_years WHERE is_active = TRUE',
      (err, financialYears) => {
        if (err) return callback(err);

        if (financialYears.length === 0) {
          return callback(new Error('No active financial year found'));
        }

        const startDate = new Date(financialYears[0].start_date);
        const startYear = startDate.getFullYear();
        const endYear = (startYear + 1) % 100;
        const financialYear = `${startYear}-${endYear.toString().padStart(2, '0')}`;
        const counterId = `invoice_${financialYear}`;

        db.query('SELECT seq FROM counters WHERE id = ?', [counterId], (err, counterResult) => {
          if (err) return callback(err);

          let nextSeq;
          if (counterResult.length === 0) {
            nextSeq = 1;
            db.query('INSERT INTO counters (id, seq) VALUES (?, ?)', [counterId, nextSeq], (err) => {
              if (err) return callback(err);
              const invoiceNumber = `ME/${financialYear}/${nextSeq.toString().padStart(3, '0')}`;
              callback(null, { nextInvoiceNumber: invoiceNumber });
            });
          } else {
            nextSeq = counterResult[0].seq + 1;
            db.query('UPDATE counters SET seq = ? WHERE id = ?', [nextSeq, counterId], (err) => {
              if (err) return callback(err);
              const invoiceNumber = `ME/${financialYear}/${nextSeq.toString().padStart(3, '0')}`;
              callback(null, { nextInvoiceNumber: invoiceNumber });
            });
          }
        });
      }
    );
  },

  create: (data, items = [], callback) => {
    if (!Array.isArray(items) || items.length === 0) {
      return callback(new Error('At least one item is required'));
    }

    // First, get customer billing state code
    db.query('SELECT billing_state_code FROM customers WHERE id = ?', [data.customer_id], (custErr, custResult) => {
      if (custErr) return callback(custErr);
      
      const billingStateCode = custResult.length > 0 ? (custResult[0].billing_state_code || '') : '';

      let sub_total = 0;
      items.forEach(item => {
        const quantity = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        const discount = parseFloat(item.discount) || 0;
        const amount = (quantity * rate) - discount;
        item.amount = parseFloat(amount.toFixed(2));
        sub_total += amount;
      });

      sub_total = parseFloat(sub_total.toFixed(2));
      const freight = parseFloat(data.freight || 0);
      const subtotalWithFreight = sub_total + freight;
      
      // Conditional GST calculation based on customer billing state code
      let cgst = 0, sgst = 0, igst = 0;
      
      if (billingStateCode === '27') {
        // Maharashtra - use CGST/SGST
        cgst = parseFloat((subtotalWithFreight * 0.09).toFixed(2));
        sgst = parseFloat((subtotalWithFreight * 0.09).toFixed(2));
        igst = 0;
      } else {
        // Other states - use IGST
        cgst = 0;
        sgst = 0;
        igst = parseFloat((subtotalWithFreight * 0.18).toFixed(2));
      }
      
      const grand_total = parseFloat((subtotalWithFreight + cgst + sgst + igst).toFixed(2));

      invoice.getNextInvoiceNumber((err, result) => {
        if (err) return callback(err);
        const invoiceNumber = result.nextInvoiceNumber;

        const invoiceSql = `
          INSERT INTO invoice (
            invoice_number, customer_id, customer_name, invoice_date, expiry_date, subject,
            customer_notes, terms_and_conditions, sub_total, freight, cgst, sgst, igst, grand_total, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const invoiceValues = [
          invoiceNumber,
          data.customer_id,
          data.customer_name,
          data.invoice_date,
          data.expiry_date,
          data.subject,
          data.customer_notes,
          data.terms_and_conditions,
          sub_total,
          freight,
          cgst,
          sgst,
          igst,
          grand_total,
          data.status || 'Draft',
        ];

        db.query(invoiceSql, invoiceValues, (err, result) => {
          if (err) return callback(err);
          const invoiceId = result.insertId;

          const itemSql = `
            INSERT INTO invoice_items (
              invoice_id, item_detail, quantity, rate, discount, amount, uom_amount, uom_description
            ) VALUES ?
          `;

          const itemValues = items.map(item => [
            invoiceId,
            item.item_detail,
            item.quantity,
            item.rate,
            item.discount,
            item.amount,
            item.uom_amount || 0,
            item.uom_description || "",
          ]);

          db.query(itemSql, [itemValues], (itemErr, itemResult) => {
            if (itemErr) return callback(itemErr);
            callback(null, {
              invoiceId,
              invoiceNumber,
              itemsInserted: itemResult.affectedRows,
              sub_total,
              freight,
              cgst,
              sgst,
              igst,
              grand_total,
            });
          });
        });
      });
    });
  },

  update: (id, data, items = [], callback) => {
    // First, get customer billing state code
    db.query('SELECT billing_state_code FROM customers WHERE id = ?', [data.customer_id], (custErr, custResult) => {
      if (custErr) return callback(custErr);
      
      const billingStateCode = custResult.length > 0 ? (custResult[0].billing_state_code || '') : '';

      let sub_total = 0;
      items.forEach(item => {
        const quantity = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        const discount = parseFloat(item.discount) || 0;
        const amount = (quantity * rate) - discount;
        item.amount = parseFloat(amount.toFixed(2));
        sub_total += amount;
      });

      sub_total = parseFloat(sub_total.toFixed(2));
      const freight = parseFloat(data.freight || 0);
      const subtotalWithFreight = sub_total + freight;
      
      // Conditional GST calculation based on customer billing state code
      let cgst = 0, sgst = 0, igst = 0;
      
      if (billingStateCode === '27') {
        // Maharashtra - use CGST/SGST
        cgst = parseFloat((subtotalWithFreight * 0.09).toFixed(2));
        sgst = parseFloat((subtotalWithFreight * 0.09).toFixed(2));
        igst = 0;
      } else {
        // Other states - use IGST
        cgst = 0;
        sgst = 0;
        igst = parseFloat((subtotalWithFreight * 0.18).toFixed(2));
      }
      
      const grand_total = parseFloat((subtotalWithFreight + cgst + sgst + igst).toFixed(2));

      const invoiceSql = `
        UPDATE invoice SET
          customer_id = ?, customer_name = ?, invoice_date = ?, expiry_date = ?,
          subject = ?, customer_notes = ?, terms_and_conditions = ?,
          sub_total = ?, freight = ?, cgst = ?, sgst = ?, igst = ?, grand_total = ?, status = ?
        WHERE invoice_id = ?
      `;

      const invoiceValues = [
        data.customer_id,
        data.customer_name,
        data.invoice_date,
        data.expiry_date,
        data.subject,
        data.customer_notes,
        data.terms_and_conditions,
        sub_total,
        freight,
        cgst,
        sgst,
        igst,
        grand_total,
        data.status || 'Draft',
        id,
      ];

      db.query(invoiceSql, invoiceValues, (err) => {
        if (err) return callback(err);

        db.query(`DELETE FROM invoice_items WHERE invoice_id = ?`, [id], (deleteErr) => {
          if (deleteErr) return callback(deleteErr);

          if (items.length > 0) {
            const itemSql = `
              INSERT INTO invoice_items (
                invoice_id, item_detail, quantity, rate, discount, amount
              ) VALUES ?
            `;
            const itemValues = items.map(item => [
              id,
              item.item_detail,
              item.quantity,
              item.rate,
              item.discount,
              item.amount,
            ]);
            db.query(itemSql, [itemValues], (itemErr, itemResult) => {
              if (itemErr) return callback(itemErr);
              callback(null, {
                invoiceId: id,
                itemsUpdated: itemResult.affectedRows,
                sub_total,
                freight,
                cgst,
                sgst,
                igst,
                grand_total,
              });
            });
          } else {
            callback(null, { invoiceId: id, itemsUpdated: 0, sub_total, freight, cgst, sgst, igst, grand_total });
          }
        });
      });
    });
  },

  remove: (id, callback) => {
    db.query('DELETE FROM invoice_items WHERE invoice_id = ?', [id], (err) => {
      if (err) return callback(err);
      db.query('DELETE FROM invoice WHERE invoice_id = ?', [id], callback);
    });
  },

  getSalesAnalyticsByPeriod: (period, offset = 0, callback) => {
    // Support (period, callback) signature for backwards compatibility
    if (typeof offset === 'function') {
      callback = offset;
      offset = 0;
    }
    offset = parseInt(offset) || 0;

    let dateCondition = '';
    let groupBy = '';
    let selectFields = '';

    if (period === 'all') {
      // All-time: no date filter
      dateCondition = '1=1';
      selectFields = `
        'All Time' as period_name,
        'All Time' as period_label,
        YEAR(CURDATE()) as year
      `;
      groupBy = '1';
    } else {
      switch (period) {
        case 'monthly': {
          // Use offset to shift from current month
          dateCondition = `
            YEAR(invoice_date) = YEAR(DATE_ADD(CURDATE(), INTERVAL ${offset} MONTH)) 
            AND MONTH(invoice_date) = MONTH(DATE_ADD(CURDATE(), INTERVAL ${offset} MONTH))
          `;
          selectFields = `
            CONCAT(MONTHNAME(DATE_ADD(CURDATE(), INTERVAL ${offset} MONTH)), ' ', YEAR(DATE_ADD(CURDATE(), INTERVAL ${offset} MONTH))) as period_name,
            MONTHNAME(DATE_ADD(CURDATE(), INTERVAL ${offset} MONTH)) as period_label,
            YEAR(DATE_ADD(CURDATE(), INTERVAL ${offset} MONTH)) as year
          `;
          groupBy = 'YEAR(invoice_date), MONTH(invoice_date)';
          break;
        }

        case 'quarterly': {
          // Compute target quarter using offset
          dateCondition = `
            YEAR(invoice_date) = YEAR(DATE_ADD(CURDATE(), INTERVAL ${offset * 3} MONTH))
            AND QUARTER(invoice_date) = QUARTER(DATE_ADD(CURDATE(), INTERVAL ${offset * 3} MONTH))
          `;
          selectFields = `
            CONCAT('Q', QUARTER(DATE_ADD(CURDATE(), INTERVAL ${offset * 3} MONTH)), ' ', YEAR(DATE_ADD(CURDATE(), INTERVAL ${offset * 3} MONTH))) as period_name,
            CONCAT('Q', QUARTER(DATE_ADD(CURDATE(), INTERVAL ${offset * 3} MONTH)), ' ', YEAR(DATE_ADD(CURDATE(), INTERVAL ${offset * 3} MONTH))) as period_label,
            YEAR(DATE_ADD(CURDATE(), INTERVAL ${offset * 3} MONTH)) as year
          `;
          groupBy = 'YEAR(invoice_date), QUARTER(invoice_date)';
          break;
        }

        case 'six_months': {
          // 6-month window shifted by offset (each offset = 6 months)
          dateCondition = `
            invoice_date >= DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 6 MONTH), INTERVAL ${offset * 6} MONTH)
            AND invoice_date < DATE_ADD(CURDATE(), INTERVAL ${offset * 6} MONTH)
          `;
          selectFields = `
            'Half Year' as period_name,
            CONCAT(DATE_FORMAT(DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 6 MONTH), INTERVAL ${offset * 6} MONTH), '%b %Y'),
                   ' – ',
                   DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL ${offset * 6} MONTH), '%b %Y')) as period_label,
            YEAR(DATE_ADD(CURDATE(), INTERVAL ${offset * 6} MONTH)) as year
          `;
          groupBy = '1';
          break;
        }

        case 'yearly': {
          dateCondition = `YEAR(invoice_date) = YEAR(DATE_ADD(CURDATE(), INTERVAL ${offset} YEAR))`;
          selectFields = `
            CONCAT('Year ', YEAR(DATE_ADD(CURDATE(), INTERVAL ${offset} YEAR))) as period_name,
            YEAR(DATE_ADD(CURDATE(), INTERVAL ${offset} YEAR)) as period_label,
            YEAR(DATE_ADD(CURDATE(), INTERVAL ${offset} YEAR)) as year
          `;
          groupBy = 'YEAR(invoice_date)';
          break;
        }

        default: {
          dateCondition = `
            YEAR(invoice_date) = YEAR(DATE_ADD(CURDATE(), INTERVAL ${offset} MONTH)) 
            AND MONTH(invoice_date) = MONTH(DATE_ADD(CURDATE(), INTERVAL ${offset} MONTH))
          `;
          selectFields = `
            CONCAT(MONTHNAME(DATE_ADD(CURDATE(), INTERVAL ${offset} MONTH)), ' ', YEAR(DATE_ADD(CURDATE(), INTERVAL ${offset} MONTH))) as period_name,
            MONTHNAME(DATE_ADD(CURDATE(), INTERVAL ${offset} MONTH)) as period_label,
            YEAR(DATE_ADD(CURDATE(), INTERVAL ${offset} MONTH)) as year
          `;
          groupBy = 'YEAR(invoice_date), MONTH(invoice_date)';
        }
      }
    }

    const sql = `
      SELECT 
        ${selectFields},
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'Paid' THEN 1 END) as completed_invoices,
        COUNT(CASE WHEN status IN ('Draft', 'Pending', 'Partial') THEN 1 END) as pending_invoices,
        COALESCE(SUM(grand_total), 0) as total_amount,
        COALESCE(SUM(CASE WHEN status = 'Paid' THEN grand_total ELSE 0 END), 0) as completed_amount,
        COALESCE(SUM(CASE WHEN status IN ('Draft', 'Pending', 'Partial') THEN grand_total ELSE 0 END), 0) as pending_amount,
        COALESCE(AVG(grand_total), 0) as average_invoice_amount
      FROM invoice 
      WHERE ${dateCondition}
      GROUP BY ${groupBy}
    `;

    db.query(sql, (err, results) => {
      if (err) {
        return callback(err);
      }
      
      // If no results, return default structure
      if (results.length === 0) {
        const defaultResult = {
          period_name: period === 'all' ? 'All Time' :
                      period === 'monthly' ? 'Month' : 
                      period === 'quarterly' ? 'Quarter' :
                      period === 'yearly' ? 'Year' : 'Half Year',
          period_label: period === 'all' ? 'All Time' : 'No Data',
          total_invoices: 0,
          completed_invoices: 0,
          pending_invoices: 0,
          total_amount: 0,
          completed_amount: 0,
          pending_amount: 0,
          average_invoice_amount: 0
        };
        return callback(null, [defaultResult]);
      }
      
      callback(null, results);
    });
  },

  updateStatus: (id, status, callback) => {
    const sql = 'UPDATE invoice SET status = ? WHERE invoice_id = ?';
    db.query(sql, [status, id], (err, result) => {
      if (err) return callback(err);
      if (result.affectedRows === 0) {
        return callback(new Error('Invoice not found'));
      }
      callback(null, { invoiceId: id, status: status });
    });
  },
};

module.exports = invoice;

// Helper to fetch product name by id
function getProductNameById(productId, callback) {
  if (!productId) return callback(null, '');
  db.query('SELECT product_name FROM products_services WHERE id = ?', [productId], (err, rows) => {
    if (err) {
      console.error('Error fetching product name:', err);
      return callback(err);
    }
    callback(null, rows.length ? rows[0].product_name : '');
  });
}