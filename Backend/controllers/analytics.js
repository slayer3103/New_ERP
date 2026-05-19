// controllers/analytics.js
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

// ─── Sales By Customers ───────────────────────────────────────────────
exports.getSalesByCustomers = async (req, res) => {
  try {
    const sql = `
      SELECT 
        i.customer_name,
        i.customer_id,
        COUNT(*) as total_invoices,
        COALESCE(SUM(i.grand_total), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN i.status = 'Paid' THEN i.grand_total ELSE 0 END), 0) as paid_amount,
        COALESCE(SUM(CASE WHEN i.status IN ('Draft', 'Partial') THEN i.grand_total ELSE 0 END), 0) as outstanding_amount,
        COUNT(CASE WHEN i.status = 'Paid' THEN 1 END) as paid_invoices,
        COUNT(CASE WHEN i.status IN ('Draft', 'Partial') THEN 1 END) as pending_invoices,
        COALESCE(AVG(i.grand_total), 0) as avg_invoice_value,
        MAX(i.invoice_date) as last_invoice_date
      FROM invoice i
      GROUP BY i.customer_name, i.customer_id
      ORDER BY total_revenue DESC
    `;
    const results = await query(sql);

    // Also get overall totals
    const totalsSql = `
      SELECT 
        COUNT(DISTINCT customer_name) as total_customers,
        COUNT(*) as total_invoices,
        COALESCE(SUM(grand_total), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'Paid' THEN grand_total ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status IN ('Draft', 'Partial') THEN grand_total ELSE 0 END), 0) as total_outstanding
      FROM invoice
    `;
    const totals = await query(totalsSql);

    res.json({ customers: results, summary: totals[0] });
  } catch (err) {
    console.error('Error fetching sales by customers:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── Sales By Products ───────────────────────────────────────────────
exports.getSalesByProducts = async (req, res) => {
  try {
    const sql = `
      SELECT 
        ii.item_detail as product_name,
        COUNT(DISTINCT ii.invoice_id) as times_sold,
        COALESCE(SUM(ii.quantity), 0) as total_quantity,
        COALESCE(SUM(ii.amount), 0) as total_revenue,
        COALESCE(AVG(ii.rate), 0) as avg_rate,
        COALESCE(SUM(ii.discount), 0) as total_discount
      FROM invoice_items ii
      JOIN invoice i ON ii.invoice_id = i.invoice_id
      GROUP BY ii.item_detail
      ORDER BY total_revenue DESC
    `;
    const results = await query(sql);

    const totalsSql = `
      SELECT 
        COUNT(DISTINCT ii.item_detail) as unique_products,
        COALESCE(SUM(ii.quantity), 0) as total_quantity_sold,
        COALESCE(SUM(ii.amount), 0) as total_product_revenue,
        COALESCE(SUM(ii.discount), 0) as total_discounts
      FROM invoice_items ii
      JOIN invoice i ON ii.invoice_id = i.invoice_id
    `;
    const totals = await query(totalsSql);

    res.json({ products: results, summary: totals[0] });
  } catch (err) {
    console.error('Error fetching sales by products:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GST Summary ─────────────────────────────────────────────────────
exports.getGstSummary = async (req, res) => {
  try {
    const sql = `
      SELECT 
        DATE_FORMAT(i.invoice_date, '%Y-%m') as month,
        DATE_FORMAT(i.invoice_date, '%b %Y') as month_label,
        COUNT(*) as invoice_count,
        COALESCE(SUM(i.sub_total), 0) as taxable_amount,
        COALESCE(SUM(i.cgst), 0) as total_cgst,
        COALESCE(SUM(i.sgst), 0) as total_sgst,
        COALESCE(SUM(i.igst), 0) as total_igst,
        COALESCE(SUM(i.cgst + i.sgst + i.igst), 0) as total_gst,
        COALESCE(SUM(i.grand_total), 0) as total_with_gst
      FROM invoice i
      GROUP BY DATE_FORMAT(i.invoice_date, '%Y-%m'), DATE_FORMAT(i.invoice_date, '%b %Y')
      ORDER BY month DESC
    `;
    const results = await query(sql);

    const totalsSql = `
      SELECT 
        COALESCE(SUM(sub_total), 0) as total_taxable,
        COALESCE(SUM(cgst), 0) as total_cgst,
        COALESCE(SUM(sgst), 0) as total_sgst,
        COALESCE(SUM(igst), 0) as total_igst,
        COALESCE(SUM(cgst + sgst + igst), 0) as total_gst_collected,
        COALESCE(SUM(grand_total), 0) as grand_total
      FROM invoice
    `;
    const totals = await query(totalsSql);

    res.json({ monthly: results, summary: totals[0] });
  } catch (err) {
    console.error('Error fetching GST summary:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── Tax Liability Reports ───────────────────────────────────────────
exports.getTaxLiability = async (req, res) => {
  try {
    // Tax rates and their applied amounts from invoices
    const invoiceTaxSql = `
      SELECT 
        i.invoice_id,
        i.invoice_number,
        i.customer_name,
        i.invoice_date,
        i.sub_total as taxable_amount,
        i.cgst,
        i.sgst,
        i.igst,
        (i.cgst + i.sgst + i.igst) as total_tax,
        i.grand_total,
        i.status,
        CASE 
          WHEN i.igst > 0 THEN 'IGST'
          ELSE 'CGST + SGST'
        END as tax_type
      FROM invoice i
      WHERE (i.cgst + i.sgst + i.igst) > 0
      ORDER BY i.invoice_date DESC
    `;
    const invoiceTaxes = await query(invoiceTaxSql);

    // Configured tax rates
    const taxesSql = `SELECT * FROM taxes ORDER BY tax_name`;
    const configuredTaxes = await query(taxesSql);

    // Summary by tax type
    const summarySql = `
      SELECT 
        CASE 
          WHEN igst > 0 THEN 'IGST (Inter-State)'
          ELSE 'CGST + SGST (Intra-State)'
        END as tax_category,
        COUNT(*) as invoice_count,
        COALESCE(SUM(sub_total), 0) as taxable_amount,
        COALESCE(SUM(cgst), 0) as cgst_total,
        COALESCE(SUM(sgst), 0) as sgst_total,
        COALESCE(SUM(igst), 0) as igst_total,
        COALESCE(SUM(cgst + sgst + igst), 0) as total_tax
      FROM invoice
      WHERE (cgst + sgst + igst) > 0
      GROUP BY CASE WHEN igst > 0 THEN 'IGST (Inter-State)' ELSE 'CGST + SGST (Intra-State)' END
    `;
    const summary = await query(summarySql);

    // Total liability
    const totalSql = `
      SELECT 
        COALESCE(SUM(cgst + sgst + igst), 0) as total_tax_liability,
        COALESCE(SUM(CASE WHEN status = 'Paid' THEN cgst + sgst + igst ELSE 0 END), 0) as collected_tax,
        COALESCE(SUM(CASE WHEN status IN ('Draft', 'Partial') THEN cgst + sgst + igst ELSE 0 END), 0) as pending_tax
      FROM invoice
    `;
    const totals = await query(totalSql);

    res.json({ 
      invoices: invoiceTaxes, 
      configuredTaxes, 
      taxSummary: summary,
      totals: totals[0]
    });
  } catch (err) {
    console.error('Error fetching tax liability:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── Outstanding Invoices ────────────────────────────────────────────
exports.getOutstandingInvoices = async (req, res) => {
  try {
    const sql = `
      SELECT 
        i.invoice_id,
        i.invoice_number,
        i.customer_name,
        i.invoice_date,
        i.expiry_date,
        i.grand_total,
        i.status,
        COALESCE(pe.total_paid, 0) as total_paid,
        (i.grand_total - COALESCE(pe.total_paid, 0)) as balance_due,
        DATEDIFF(CURDATE(), i.invoice_date) as days_since_invoice,
        CASE 
          WHEN i.expiry_date IS NOT NULL AND i.expiry_date < CURDATE() THEN 'Overdue'
          WHEN DATEDIFF(CURDATE(), i.invoice_date) > 60 THEN '60+ Days'
          WHEN DATEDIFF(CURDATE(), i.invoice_date) > 30 THEN '30-60 Days'
          WHEN DATEDIFF(CURDATE(), i.invoice_date) > 15 THEN '15-30 Days'
          ELSE 'Current'
        END as aging_category
      FROM invoice i
      LEFT JOIN (
        SELECT invoice_id, COALESCE(SUM(amount), 0) as total_paid
        FROM payment_entries
        GROUP BY invoice_id
      ) pe ON i.invoice_id = pe.invoice_id
      WHERE i.status IN ('Draft', 'Partial')
      ORDER BY days_since_invoice DESC
    `;
    const results = await query(sql);

    const summarySql = `
      SELECT 
        COUNT(*) as total_outstanding,
        COALESCE(SUM(i.grand_total - COALESCE(pe.total_paid, 0)), 0) as total_balance_due,
        COALESCE(SUM(i.grand_total), 0) as total_invoice_value,
        COUNT(CASE WHEN i.expiry_date IS NOT NULL AND i.expiry_date < CURDATE() THEN 1 END) as overdue_count,
        COALESCE(AVG(DATEDIFF(CURDATE(), i.invoice_date)), 0) as avg_days_outstanding
      FROM invoice i
      LEFT JOIN (
        SELECT invoice_id, COALESCE(SUM(amount), 0) as total_paid
        FROM payment_entries
        GROUP BY invoice_id
      ) pe ON i.invoice_id = pe.invoice_id
      WHERE i.status IN ('Draft', 'Partial')
    `;
    const totals = await query(summarySql);

    res.json({ invoices: results, summary: totals[0] });
  } catch (err) {
    console.error('Error fetching outstanding invoices:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── Payment Receipts ────────────────────────────────────────────────
exports.getPaymentReceipts = async (req, res) => {
  try {
    const sql = `
      SELECT 
        pe.payment_id,
        pe.invoice_id,
        pe.invoice_number,
        pe.payment_date,
        pe.payment_mode,
        pe.currency,
        pe.amount,
        pe.invoice_total,
        pe.remaining_balance,
        pe.created_at,
        i.customer_name,
        i.status as invoice_status
      FROM payment_entries pe
      JOIN invoice i ON pe.invoice_id = i.invoice_id
      ORDER BY pe.payment_date DESC
    `;
    const results = await query(sql);

    const summarySql = `
      SELECT 
        COUNT(*) as total_receipts,
        COALESCE(SUM(pe.amount), 0) as total_collected,
        COUNT(CASE WHEN pe.payment_mode = 'Cash' THEN 1 END) as cash_payments,
        COUNT(CASE WHEN pe.payment_mode = 'Online' THEN 1 END) as online_payments,
        COUNT(CASE WHEN pe.payment_mode = 'Cheque' THEN 1 END) as cheque_payments,
        COALESCE(SUM(CASE WHEN pe.payment_mode = 'Cash' THEN pe.amount ELSE 0 END), 0) as cash_amount,
        COALESCE(SUM(CASE WHEN pe.payment_mode = 'Online' THEN pe.amount ELSE 0 END), 0) as online_amount,
        COALESCE(SUM(CASE WHEN pe.payment_mode = 'Cheque' THEN pe.amount ELSE 0 END), 0) as cheque_amount
      FROM payment_entries pe
    `;
    const totals = await query(summarySql);

    res.json({ payments: results, summary: totals[0] });
  } catch (err) {
    console.error('Error fetching payment receipts:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── PO Summaries ────────────────────────────────────────────────────
exports.getPOSummaries = async (req, res) => {
  try {
    const sql = `
      SELECT 
        po.id,
        po.purchase_order_no,
        po.vendor_name,
        po.purchase_order_date,
        po.delivery_date,
        po.sub_total,
        po.freight,
        po.cgst,
        po.sgst,
        po.total,
        COUNT(poi.id) as item_count,
        COALESCE(SUM(poi.qty), 0) as total_quantity
      FROM purchase_orders po
      LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
      GROUP BY po.id, po.purchase_order_no, po.vendor_name, po.purchase_order_date, 
               po.delivery_date, po.sub_total, po.freight, po.cgst, po.sgst, po.total
      ORDER BY po.purchase_order_date DESC
    `;
    const results = await query(sql);

    const summarySql = `
      SELECT 
        COUNT(DISTINCT po.id) as total_orders,
        COUNT(DISTINCT po.vendor_name) as unique_vendors,
        COALESCE(SUM(po.total), 0) as total_spent,
        COALESCE(AVG(po.total), 0) as avg_order_value,
        COALESCE(SUM(po.cgst + po.sgst), 0) as total_tax_on_purchases,
        MAX(po.purchase_order_date) as latest_order_date
      FROM purchase_orders po
    `;
    const totals = await query(summarySql);

    res.json({ orders: results, summary: totals[0] });
  } catch (err) {
    console.error('Error fetching PO summaries:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── Vendor Spend Analysis ──────────────────────────────────────────
exports.getVendorSpendAnalysis = async (req, res) => {
  try {
    const sql = `
      SELECT 
        po.vendor_name,
        COUNT(*) as total_orders,
        COALESCE(SUM(po.total), 0) as total_spent,
        COALESCE(AVG(po.total), 0) as avg_order_value,
        COALESCE(SUM(po.sub_total), 0) as subtotal_spent,
        COALESCE(SUM(po.cgst + po.sgst), 0) as tax_paid,
        MIN(po.purchase_order_date) as first_order_date,
        MAX(po.purchase_order_date) as last_order_date,
        COALESCE(SUM(poi_totals.total_items), 0) as total_items_ordered
      FROM purchase_orders po
      LEFT JOIN (
        SELECT purchase_order_id, SUM(qty) as total_items
        FROM purchase_order_items
        GROUP BY purchase_order_id
      ) poi_totals ON po.id = poi_totals.purchase_order_id
      GROUP BY po.vendor_name
      ORDER BY total_spent DESC
    `;
    const results = await query(sql);

    const summarySql = `
      SELECT 
        COUNT(DISTINCT po.vendor_name) as total_vendors,
        COUNT(*) as total_orders,
        COALESCE(SUM(po.total), 0) as total_procurement_spend,
        COALESCE(AVG(po.total), 0) as avg_order_value
      FROM purchase_orders po
    `;
    const totals = await query(summarySql);

    res.json({ vendors: results, summary: totals[0] });
  } catch (err) {
    console.error('Error fetching vendor spend analysis:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── Enhanced Sales By Time Period ───────────────────────────────────
exports.getSalesDetailed = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    // Build the date filter
    let dateCondition = '';
    switch (period) {
      case 'monthly':
        dateCondition = `YEAR(i.invoice_date) = YEAR(CURDATE()) AND MONTH(i.invoice_date) = MONTH(CURDATE())`;
        break;
      case 'quarterly':
        dateCondition = `YEAR(i.invoice_date) = YEAR(CURDATE()) AND QUARTER(i.invoice_date) = QUARTER(CURDATE())`;
        break;
      case 'six_months':
        dateCondition = `i.invoice_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)`;
        break;
      case 'yearly':
        dateCondition = `YEAR(i.invoice_date) = YEAR(CURDATE())`;
        break;
      default:
        dateCondition = `YEAR(i.invoice_date) = YEAR(CURDATE()) AND MONTH(i.invoice_date) = MONTH(CURDATE())`;
    }

    // 1. Monthly trend data (for charts)
    const trendSql = `
      SELECT 
        DATE_FORMAT(i.invoice_date, '%Y-%m') as month_key,
        DATE_FORMAT(i.invoice_date, '%b %Y') as month_label,
        DATE_FORMAT(i.invoice_date, '%b') as short_label,
        COUNT(*) as invoice_count,
        COALESCE(SUM(i.grand_total), 0) as revenue,
        COALESCE(SUM(CASE WHEN i.status = 'Paid' THEN i.grand_total ELSE 0 END), 0) as collected,
        COALESCE(SUM(CASE WHEN i.status IN ('Draft', 'Partial') THEN i.grand_total ELSE 0 END), 0) as pending
      FROM invoice i
      WHERE ${dateCondition}
      GROUP BY DATE_FORMAT(i.invoice_date, '%Y-%m'), DATE_FORMAT(i.invoice_date, '%b %Y'), DATE_FORMAT(i.invoice_date, '%b')
      ORDER BY month_key ASC
    `;
    const trends = await query(trendSql);

    // 2. Daily trend for current month or week-wise for longer periods
    const dailySql = `
      SELECT 
        DATE(i.invoice_date) as day,
        DATE_FORMAT(i.invoice_date, '%d %b') as day_label,
        COUNT(*) as invoice_count,
        COALESCE(SUM(i.grand_total), 0) as revenue
      FROM invoice i
      WHERE ${dateCondition}
      GROUP BY DATE(i.invoice_date), DATE_FORMAT(i.invoice_date, '%d %b')
      ORDER BY day ASC
    `;
    const dailyTrends = await query(dailySql);

    // 3. Top customers for the period
    const topCustomersSql = `
      SELECT 
        i.customer_name,
        COUNT(*) as invoice_count,
        COALESCE(SUM(i.grand_total), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN i.status = 'Paid' THEN i.grand_total ELSE 0 END), 0) as paid_amount
      FROM invoice i
      WHERE ${dateCondition}
      GROUP BY i.customer_name
      ORDER BY total_revenue DESC
      LIMIT 5
    `;
    const topCustomers = await query(topCustomersSql);

    // 4. Recent invoices for the period
    const recentSql = `
      SELECT 
        i.invoice_id,
        i.invoice_number,
        i.customer_name,
        i.invoice_date,
        i.grand_total,
        i.status
      FROM invoice i
      WHERE ${dateCondition}
      ORDER BY i.invoice_date DESC
      LIMIT 10
    `;
    const recentInvoices = await query(recentSql);

    // 5. Status distribution
    const statusSql = `
      SELECT 
        i.status,
        COUNT(*) as count,
        COALESCE(SUM(i.grand_total), 0) as amount
      FROM invoice i
      WHERE ${dateCondition}
      GROUP BY i.status
    `;
    const statusDist = await query(statusSql);

    // 6. Top products for the period
    const topProductsSql = `
      SELECT 
        ii.item_detail as product_name,
        COALESCE(SUM(ii.quantity), 0) as qty_sold,
        COALESCE(SUM(ii.amount), 0) as revenue
      FROM invoice_items ii
      JOIN invoice i ON ii.invoice_id = i.invoice_id
      WHERE ${dateCondition}
      GROUP BY ii.item_detail
      ORDER BY revenue DESC
      LIMIT 5
    `;
    const topProducts = await query(topProductsSql);

    res.json({
      trends,
      dailyTrends,
      topCustomers,
      recentInvoices,
      statusDistribution: statusDist,
      topProducts
    });
  } catch (err) {
    console.error('Error fetching detailed sales analytics:', err);
    res.status(500).json({ error: err.message });
  }
};
