const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchase');

// Routes
router.get('/next-number',purchaseOrderController.getNextPurchaseOrderNumber);
router.get('/', purchaseOrderController.getAllPurchaseOrders);
router.get('/:id', purchaseOrderController.getPurchaseOrderById);
router.post('/', purchaseOrderController.createPurchaseOrder);
router.put('/:id', purchaseOrderController.updatePurchaseOrder);
module.exports = router;
