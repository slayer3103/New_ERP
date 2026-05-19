const WorkOrder = require('../models/workOrders');
const WorkOrderItem = require('../models/workOrderItems');

exports.create = (req, res) => {
  const { items, ...workOrderData } = req.body;

  // Required field validation
  if (!workOrderData.vendor_name || !workOrderData.vendor_name.trim())
    return res.status(400).json({ error: 'Vendor name is required' });
  if (!workOrderData.work_order_date)
    return res.status(400).json({ error: 'Work order date is required' });
  if (!workOrderData.payment_terms)
    return res.status(400).json({ error: 'Payment terms is required' });
  if (!workOrderData.due_date)
    return res.status(400).json({ error: 'Due date is required' });
  if (new Date(workOrderData.due_date) < new Date(workOrderData.work_order_date))
    return res.status(400).json({ error: 'Due date must be on or after work order date' });

  // Item validations
  if (items && items.length > 0) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.item_name && !item.itemName)
        return res.status(400).json({ error: `Item name is required for row ${i + 1}` });
      if (!item.qty || parseFloat(item.qty) <= 0)
        return res.status(400).json({ error: `Quantity must be greater than 0 for row ${i + 1}` });
      if (!item.rate || parseFloat(item.rate) <= 0)
        return res.status(400).json({ error: `Rate must be greater than 0 for row ${i + 1}` });
      if (item.discount && parseFloat(item.discount) < 0)
        return res.status(400).json({ error: `Discount cannot be negative for row ${i + 1}` });
    }
  }

  WorkOrder.create(workOrderData, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    
    const workOrderId = result.insertId;
    
    // If there are items, create them
    if (items && items.length > 0) {
      WorkOrderItem.createItems(workOrderId, items, (itemErr, itemResult) => {
        if (itemErr) {
          console.error('Error creating work order items:', itemErr);
          return res.status(500).json({ error: 'Work order created but failed to add items' });
        }
        res.status(201).json({ message: 'Work order and items created successfully', id: workOrderId });
      });
    } else {
      res.status(201).json({ message: 'Work order created', id: workOrderId });
    }
  });
};

exports.getAll = (req, res) => {
  WorkOrder.getAll((err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
};

exports.getById = (req, res) => {
  WorkOrder.getById(req.params.id, (err, workOrderResult) => {
    if (err) {
      console.error("Error fetching work order:", err);
      return res.status(500).json({ error: "Failed to fetch work order" });
    }
    if (!workOrderResult || workOrderResult.length === 0) {
      return res.status(404).json({ error: "Work order not found" });
    }

    const workOrder = workOrderResult[0];

    WorkOrderItem.getItemsByWorkOrderId(req.params.id, (err, workOrderItems) => {
      if (err) {
        console.error("Error fetching work order items:", err);
        return res.status(500).json({ error: "Failed to fetch work order items" });
      }

      const customer = {
        customer_name: workOrder.customer_name,
        billing_recipient_name: workOrder.billing_recipient_name,
        billing_address1: workOrder.billing_address1,
        billing_address2: workOrder.billing_address2,
        billing_city: workOrder.billing_city,
        billing_state: workOrder.billing_state,
        billing_pincode: workOrder.billing_pincode,
        billing_country: workOrder.billing_country,
        gst: workOrder.gst,
        shipping_recipient_name: workOrder.shipping_recipient_name,
        shipping_address1: workOrder.shipping_address1,
        shipping_address2: workOrder.shipping_address2,
        shipping_city: workOrder.shipping_city,
        shipping_state: workOrder.shipping_state,
        shipping_pincode: workOrder.shipping_pincode,
        shipping_country: workOrder.shipping_country,
      };

      res.json({
        workOrder,
        workOrderItems,
        customer,
        total_amount: workOrder.grand_total,
        cgst: workOrder.cgst,
        sgst: workOrder.sgst,
        grand_total: workOrder.grand_total,
      });
    });
  });
};

exports.update = (req, res) => {
  console.log('Work Order Update Request:', {
    id: req.params.id,
    body: req.body
  });
  
  WorkOrder.update(req.params.id, req.body, (err, result) => {
    if (err) {
      console.error('Work Order Update Error:', err);
      return res.status(500).json({ 
        error: 'Failed to update work order',
        details: err.message || err
      });
    }
    console.log('Work Order Update Success:', result);
    res.json({ message: 'Work order updated successfully' });
  });
};

exports.remove = (req, res) => {
  WorkOrder.remove(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Work order deleted' });
  });
};


