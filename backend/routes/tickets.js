// backend/routes/tickets.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// @route   GET /api/tickets/test
// @desc    Test tickets routes
// @access  Public
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Tickets routes funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// @route   GET /api/tickets
// @desc    Get user tickets (placeholder)
// @access  Private
router.get('/', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Tickets del usuario (placeholder)',
    data: []
  });
});

// @route   POST /api/tickets
// @desc    Create new ticket (placeholder)
// @access  Private
router.post('/', auth, (req, res) => {
  res.json({
    success: false,
    message: 'Creación de tickets no implementada aún'
  });
});

module.exports = router;