const quotation = require('../models/quotation');
const pool = require('../config/db'); // Added missing import for pool

// Get all quotations
exports.getAll = (req, res) => {
  quotation.getAll((err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// Get single quotation by ID with its items
exports.getOne = (req, res) => {
  const id = req.params.id;

  quotation.getById(id, (err, quotationData) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!quotationData) return res.status(404).json({ message: 'Quotation not found' });

    quotation.getItemsByQuotationId(id, (itemErr, items) => {
      if (itemErr) return res.status(500).json({ error: itemErr.message });

      const sub_total = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      const freight = parseFloat(quotationData.freight || 0);
      const subtotalWithFreight = sub_total + freight;
      const cgst = parseFloat((subtotalWithFreight * 0.09).toFixed(2));
      const sgst = parseFloat((subtotalWithFreight * 0.09).toFixed(2));
      const grand_total = parseFloat((subtotalWithFreight + cgst + sgst).toFixed(2));

      res.json({
        quotation: quotationData,
        items,
        sub_total,
        freight,
        cgst,
        sgst,
        grand_total
      });
    });
  });
};

// Create new quotation with items
exports.create = (req, res) => {
  const { quotation: quotationData, items = [] } = req.body;

  if (!quotationData || typeof quotationData !== 'object' || !quotationData.customer_name)
    return res.status(400).json({ error: 'Customer name is required' });
  if (!quotationData.quote_date)
    return res.status(400).json({ error: 'Quote date is required' });
  if (!quotationData.expiry_date)
    return res.status(400).json({ error: 'Expiry date is required' });
  if (new Date(quotationData.expiry_date) <= new Date(quotationData.quote_date))
    return res.status(400).json({ error: 'Expiry date must be after quote date' });
  if (!items || items.length === 0)
    return res.status(400).json({ error: 'At least one item is required' });

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.item_detail && !item.item)
      return res.status(400).json({ error: `Item name is required for row ${i + 1}` });
    if (!item.quantity || parseFloat(item.quantity) <= 0)
      return res.status(400).json({ error: `Quantity must be greater than 0 for row ${i + 1}` });
    if (!item.rate || parseFloat(item.rate) <= 0)
      return res.status(400).json({ error: `Rate must be greater than 0 for row ${i + 1}` });
    if (item.discount && parseFloat(item.discount) < 0)
      return res.status(400).json({ error: `Discount cannot be negative for row ${i + 1}` });
  }

  if (quotationData.freight && parseFloat(quotationData.freight) < 0)
    return res.status(400).json({ error: 'Freight cannot be negative' });

  if (!quotationData.status) quotationData.status = 'Draft';

  quotation.create(quotationData, items, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      message: 'Quotation created successfully',
      quotationId: result.quotationId,
      quoteNumber: result.quoteNumber,
      itemsInserted: result.itemsInserted,
      sub_total: result.sub_total,
      freight: result.freight,
      cgst: result.cgst,
      sgst: result.sgst,
      igst: result.igst,
      grand_total: result.grand_total
    });
  });
};

// Delete quotation and its items
exports.remove = (req, res) => {
  quotation.remove(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Quotation and related items deleted successfully' });
  });
};

// Add items to an existing quotation and update totals
exports.addItems = (req, res) => {
  const quotationId = req.params.id;
  const items = req.body.items;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items provided to add' });
  }

  const itemValues = items.map(item => {
    item.amount = parseFloat((item.quantity * item.rate - (item.discount || 0)).toFixed(2));
    return [
      quotationId,
      item.item_detail,
      item.quantity,
      item.rate,
      item.discount,
      item.amount
    ];
  });

  const itemSql = `
    INSERT INTO quotation_items (
      quotation_id, item_detail, quantity, rate, discount, amount
    ) VALUES ?
  `;

  pool.query(itemSql, [itemValues], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    // Recalculate updated totals
    quotation.getItemsByQuotationId(quotationId, (itemErr, allItems) => {
      if (itemErr) return res.status(500).json({ error: itemErr.message });

      // Get quotation to find customer name, then get customer billing state code
      quotation.getById(quotationId, (quotErr, quotationData) => {
        if (quotErr) return res.status(500).json({ error: quotErr.message });

        pool.query('SELECT billing_state_code FROM customers WHERE customer_name = ? LIMIT 1', [quotationData.customer_name], (custErr, custResult) => {
          if (custErr) return res.status(500).json({ error: custErr.message });
          
          const billingStateCode = custResult.length > 0 ? (custResult[0].billing_state_code || '') : '';
          const sub_total = allItems.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
          
          // Conditional GST calculation based on customer billing state code
          let cgst = 0, sgst = 0, igst = 0;
          
          if (billingStateCode === '27') {
            // Maharashtra - use CGST/SGST
            cgst = parseFloat((sub_total * 0.09).toFixed(2));
            sgst = parseFloat((sub_total * 0.09).toFixed(2));
            igst = 0;
          } else {
            // Other states - use IGST
            cgst = 0;
            sgst = 0;
            igst = parseFloat((sub_total * 0.18).toFixed(2));
          }
          
          const grand_total = parseFloat((sub_total + cgst + sgst + igst).toFixed(2));

          const updateSql = `
            UPDATE quotation
            SET sub_total = ?, cgst = ?, sgst = ?, igst = ?, grand_total = ?
            WHERE quotation_id = ?
          `;

          pool.query(updateSql, [sub_total, cgst, sgst, igst, grand_total, quotationId], (updateErr) => {
            if (updateErr) return res.status(500).json({ error: updateErr.message });

            res.json({
              message: 'Items added and quotation updated successfully',
              quotationId,
              addedItems: result.affectedRows,
              sub_total,
              cgst,
              sgst,
              igst,
              grand_total
            });
          });
        });
      });
    });
  });
};

// Update a quotation by ID
exports.update = (req, res) => {
  const id = req.params.id;
  
  // Handle status-only updates (for toggle functionality)
  if (req.body.status && !req.body.quotation) {
    const statusData = { status: req.body.status };
    quotation.update(id, statusData, [], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        message: 'Status updated successfully',
        quotationId: result.quotationId,
        status: req.body.status
      });
    });
    return;
  }

  // Handle full quotation updates
  const { quotation: quotationData, items = [] } = req.body;

  if (!quotationData || typeof quotationData !== 'object') {
    return res.status(400).json({ error: 'Missing or invalid quotation data' });
  }

  quotation.update(id, quotationData, items, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      message: 'Quotation updated successfully',
      quotationId: result.quotationId,
      itemsUpdated: result.itemsUpdated,
      sub_total: result.sub_total,
      freight: result.freight,
      cgst: result.cgst,
      sgst: result.sgst,
      igst: result.igst,
      grand_total: result.grand_total,
    });
  });
};

// Get next quotation number
exports.getNextQuoteNumber = (req, res) => {
  quotation.getNextQuoteNumber((err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};