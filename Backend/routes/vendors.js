const express = require('express');
const router = express.Router();
const controller = require('../controllers/vendors');

// Existing routes
router.get('/', controller.getAll);
router.get('/name', controller.getByName); // Pehle wala rahega
router.get('/:id', controller.getById); // Naya endpoint for vendor by ID
router.get('/:id', controller.getById); // Naya endpoint for vendor by ID
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.patch('/:id/status', controller.updateStatus);

module.exports = router;