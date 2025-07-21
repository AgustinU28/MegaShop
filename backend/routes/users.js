// backend/routes/users.js
const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');

// @route   GET /api/users/test
// @desc    Test users routes
// @access  Public
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Users routes funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// @route   GET /api/users
// @desc    Get all users (placeholder)
// @access  Private/Admin
router.get('/', auth, adminAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Lista de usuarios (placeholder)',
    data: []
  });
});

module.exports = router;


