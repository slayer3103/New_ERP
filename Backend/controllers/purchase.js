// controllers/purchase.js
const PurchaseOrder = require('../models/purchase');

// Get all
exports.getAllPurchaseOrders = (req, res) => {
  PurchaseOrder.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Group items by purchase order
    const grouped = {};
    results.forEach(row => {
      if (!grouped[row.purchase_order_no]) {
        grouped[row.purchase_order_no] = {
          id: row.id,
          purchase_order_no: row.purchase_order_no,
          vendor_name: row.vendor_name,
          purchase_order_date: row.purchase_order_date,
          delivery_date: row.delivery_date,
          sub_total: row.sub_total,
          cgst: row.cgst,
          sgst: row.sgst,
          total: row.total,
          items: [],
          vendor: {
            vendor_name: row.vendor_name,
            company_name: row.company_name,
            display_name: row.display_name,
            email: row.email,
            phone: row.phone,
            gst: row.gst,
            billing_address: `${row.billing_address1 || ''} ${row.billing_address2 || ''}, ${row.billing_city || ''}, ${row.billing_state || ''}, ${row.billing_pincode || ''}`.trim(),
            shipping_address: `${row.shipping_address1 || ''} ${row.shipping_address2 || ''}, ${row.shipping_city || ''}, ${row.shipping_state || ''}, ${row.shipping_pincode || ''}`.trim(),
            contact_name: row.billing_recipient_name || row.shipping_recipient_name || 'N/A',
            mobile_no: row.billing_phone || row.shipping_phone || row.phone || 'N/A'
          }
        };
      }
      if (row.item_name) {
        grouped[row.purchase_order_no].items.push({
          item_name: row.item_name,
          qty: row.qty,
          rate: row.rate,
          discount: row.discount,
          amount: row.amount
        });
      }
    });
    res.json(Object.values(grouped));
  });
};

exports.getNextPurchaseOrderNumber = (req, res) => {
  PurchaseOrder.getNextPurchaseOrderNo((err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// Get one
exports.getPurchaseOrderById = (req, res) => {
  const id = req.params.id;
  PurchaseOrder.getById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results.length) return res.status(404).json({ error: 'Purchase order not found' });

    const purchaseOrder = {
      id: results[0].id,
      purchase_order_no: results[0].purchase_order_no,
      vendor_name: results[0].vendor_name,
      purchase_order_date: results[0].purchase_order_date,
      delivery_date: results[0].delivery_date,
      payment_terms: results[0].payment_terms,
      sub_total: results[0].sub_total,
      freight: results[0].freight,
      cgst: results[0].cgst,
      sgst: results[0].sgst,
      total: results[0].total,
      total_in_words: results[0].total_in_words || 'N/A',
      delivery_time: results[0].delivery_time || '1 to 2 Weeks (Immediate)',
      required_docs: results[0].required_docs || 'Test Certificate',
      po_validity: results[0].po_validity || '4 Month',
      items: results
        .filter(row => row.item_name)
        .map(row => ({
          description: row.item_name,
          hsnCode: row.hsn_code || '32149090',
          quantity: row.qty,
          mou: row.mou || 'Box',
          rate: row.rate,
          amount: row.amount
        })),
      vendor: {
        vendor_name: results[0].vendor_name,
        company_name: results[0].company_name,
        display_name: results[0].display_name,
        email: results[0].email,
        phone: results[0].phone,
        gst: results[0].gst,
        billing_address: `${results[0].billing_address1 || ''} ${results[0].billing_address2 || ''}, ${results[0].billing_city || ''}, ${results[0].billing_state || ''}, ${results[0].billing_pincode || ''}`.trim(),
        shipping_address: `${results[0].shipping_address1 || ''} ${results[0].shipping_address2 || ''}, ${results[0].shipping_city || ''}, ${results[0].shipping_state || ''}, ${results[0].shipping_pincode || ''}`.trim(),
        contact_name: results[0].billing_recipient_name || results[0].shipping_recipient_name || 'N/A',
        mobile_no: results[0].billing_phone || results[0].shipping_phone || results[0].phone || 'N/A'
      }
    };
    res.json({ purchase_order: purchaseOrder, vendor: purchaseOrder.vendor });
  });
};

// Create
exports.createPurchaseOrder = (req, res) => {
  const data = req.body;

  // Required field validation
  if (!data.vendor_name || !data.vendor_name.trim())
    return res.status(400).json({ error: 'Vendor name is required' });
  if (!data.purchase_order_date)
    return res.status(400).json({ error: 'Purchase order date is required' });
  if (!data.payment_terms)
    return res.status(400).json({ error: 'Payment terms is required' });
  if (data.delivery_date && new Date(data.delivery_date) < new Date(data.purchase_order_date))
    return res.status(400).json({ error: 'Delivery date must be on or after purchase order date' });
  if (data.freight && parseFloat(data.freight) < 0)
    return res.status(400).json({ error: 'Freight cannot be negative' });

  // Item validations
  const items = data.items || [];
  if (items.length === 0)
    return res.status(400).json({ error: 'At least one item is required' });
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.item_name && !item.description)
      return res.status(400).json({ error: `Item name is required for row ${i + 1}` });
    if (!item.qty || parseFloat(item.qty) <= 0)
      return res.status(400).json({ error: `Quantity must be greater than 0 for row ${i + 1}` });
    if (!item.rate || parseFloat(item.rate) <= 0)
      return res.status(400).json({ error: `Rate must be greater than 0 for row ${i + 1}` });
    if (item.discount && parseFloat(item.discount) < 0)
      return res.status(400).json({ error: `Discount cannot be negative for row ${i + 1}` });
  }

  PurchaseOrder.getNextPurchaseOrderNo((err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const purchaseOrderNumber = result.nextPurchaseOrderNumber;
    const financialYear = purchaseOrderNumber.split('/')[1] || '';

    const newPurchaseOrder = {
      purchase_order_no: purchaseOrderNumber,
      financial_year: financialYear,
      ...req.body
    };

    PurchaseOrder.create(newPurchaseOrder, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: 'Purchase order created',
        id: results.insertId,
        purchase_order_no: purchaseOrderNumber
      });
    });
  });
};

// Update
exports.updatePurchaseOrder = (req, res) => {
  const id = req.params.id;
  PurchaseOrder.update(id, req.body, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Purchase order updated' });
  });
};