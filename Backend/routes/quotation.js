const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotation.js');

router.get('/', quotationController.getAll);
router.get('/:id', quotationController.getOne);
router.post('/', quotationController.create);
router.delete('/:id', quotationController.remove);
router.put('/:id', quotationController.update);

// 🚀 Extra Route: Add items to existing quotation
router.post('/:id/items', quotationController.addItems);
router.get('/next-number', quotationController.getNextQuoteNumber);

module.exports = router;
