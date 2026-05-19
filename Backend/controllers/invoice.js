// controllers/invoice.js
const invoice = require('../models/invoice');
const Customer = require('../models/customers');

exports.getAll = (req, res) => {
  invoice.getAll((err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });   
};

exports.getDashboardSummary = (req, res) => {
  invoice.getInvoiceSummary((err, summary) => {
    if (err) {
      console.error('Error Fetching invoice summary:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(summary);
  });
};

exports.getRecentInvoices = (req, res) => {
  invoice.getRecentInvoices((err, recentInvoices) => {
    if (err) {
      console.log('Error Fetching recent invoices:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(recentInvoices);
  });
};

exports.getInvoicesOverTime = (req, res) => {
  invoice.getInvoicesOverTime((err, invoicesOverTime) => {
    if (err) {
      console.error('Error Fetching invoices from overtime:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(invoicesOverTime);
  });
};

exports.getOne = (req, res) => {
  const id = req.params.id;
  invoice.getById(id, (err, invoiceData) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!invoiceData) return res.status(404).json({ message: 'Invoice not found' });
    invoice.getItemsByInvoiceId(id, (itemErr, items) => {
      if (itemErr) return res.status(500).json({ error: itemErr.message });
      Customer.getById(invoiceData.customer_id, (custErr, customer) => {
        if (custErr) return res.status(500).json({ error: custErr.message });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        const sub_total = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
        const freight = parseFloat(invoiceData.freight || 0);
        const subtotalWithFreight = sub_total + freight;
        
        // Conditional GST calculation based on customer billing state code
        const billingStateCode = customer.billing_state_code || '';
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
        res.json({
          invoice: invoiceData,
          items,
          customer,
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
};

exports.getNextInvoiceNumber = (req, res) => {
  invoice.getNextInvoiceNumber((err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

exports.create = (req, res) => {
  const { invoice: invoiceData, items = [] } = req.body;

  if (!invoiceData || typeof invoiceData !== 'object' || !invoiceData.customer_id || !invoiceData.customer_name)
    return res.status(400).json({ error: 'Customer is required' });
  if (!invoiceData.invoice_date)
    return res.status(400).json({ error: 'Invoice date is required' });
  if (invoiceData.expiry_date && new Date(invoiceData.expiry_date) < new Date(invoiceData.invoice_date))
    return res.status(400).json({ error: 'Due date must be on or after invoice date' });
  if (!items || items.length === 0)
    return res.status(400).json({ error: 'At least one item is required' });

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.item && !item.item_detail)
      return res.status(400).json({ error: `Item name is required for row ${i + 1}` });
    if (!item.qty || parseFloat(item.qty) <= 0)
      return res.status(400).json({ error: `Quantity must be greater than 0 for row ${i + 1}` });
    if (!item.rate || parseFloat(item.rate) <= 0)
      return res.status(400).json({ error: `Rate must be greater than 0 for row ${i + 1}` });
    if (item.discount && parseFloat(item.discount) < 0)
      return res.status(400).json({ error: `Discount cannot be negative for row ${i + 1}` });
  }

  if (invoiceData.freight && parseFloat(invoiceData.freight) < 0)
    return res.status(400).json({ error: 'Freight cannot be negative' });

  const validStatuses = ['Draft', 'Partial', 'Paid'];
  if (invoiceData.status && !validStatuses.includes(invoiceData.status))
    return res.status(400).json({ error: 'Invalid status. Must be Draft, Partial, or Paid' });

  if (!invoiceData.status) invoiceData.status = 'Draft';

  invoice.create(invoiceData, items, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      message: 'Invoice created successfully',
      invoiceId: result.invoiceId,
      invoiceNumber: result.invoiceNumber,
      itemsInserted: result.itemsInserted,
      sub_total: result.sub_total,
      freight: result.freight,
      cgst: result.cgst,
      sgst: result.sgst,
      grand_total: result.grand_total,
    });
  });
};

exports.remove = (req, res) => {
  invoice.remove(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Invoice and related items deleted successfully' });
  });
};

exports.update = (req, res) => {
  const id = req.params.id;
  const { invoice: invoiceData, items = [] } = req.body;

  if (!invoiceData || typeof invoiceData !== 'object') {
    return res.status(400).json({ error: 'Missing or invalid invoice data' });
  }

  invoice.update(id, invoiceData, items, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      message: 'Invoice updated successfully',
      invoiceId: result.invoiceId,
      itemsUpdated: result.itemsUpdated,
      sub_total: result.sub_total,
      freight: result.freight,
      cgst: result.cgst,
      sgst: result.sgst,
      grand_total: result.grand_total,
    });
  });
};

exports.getSalesAnalytics = (req, res) => {
  const { period = 'monthly' } = req.query;
  
  invoice.getSalesAnalyticsByPeriod(period, (err, analytics) => {
    if (err) {
      console.error('Error fetching sales analytics:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(analytics);
  });
};

exports.updateStatus = (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Validate status values
  const validStatuses = ['Draft', 'Partial', 'Paid'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be one of: Draft, Partial, Paid' });
  }

  invoice.updateStatus(id, status, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      message: 'Invoice status updated successfully',
      invoiceId: id,
      status: status
    });
  });
};

module.exports = exports;