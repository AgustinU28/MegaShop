// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// @route   GET /api/orders/test
// @desc    Test orders routes
// @access  Public
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Orders routes funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// @route   GET /api/orders
// @desc    Get user orders (placeholder)
// @access  Private
router.get('/', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Órdenes del usuario (placeholder)',
    data: []
  });
});

// @route   POST /api/orders
// @desc    Create new order (placeholder)
// @access  Private
router.post('/', auth, (req, res) => {
  res.json({
    success: false,
    message: 'Creación de órdenes no implementada aún'
  });
});

module.exports = router;
