// backend/routes/cart.js
const express = require('express');
const router = express.Router();
const {
  createCart,
  getCartById,
  addProductToCart,
  updateProductQuantity,
  removeProductFromCart,
  clearCart,
  getAllCarts,
  getCartByUserId,
  mergeGuestCart,
  getCartStats
} = require('../controllers/cartController');

const { auth, adminAuth } = require('../middleware/auth');

// @route   POST /api/carts
// @desc    Create new cart
// @access  Public
router.post('/', createCart);

// @route   GET /api/carts
// @desc    Get all carts (Admin only)
// @access  Private/Admin
router.get('/', auth, adminAuth, getAllCarts);

// @route   GET /api/carts/stats
// @desc    Get cart statistics (Admin only)
// @access  Private/Admin
router.get('/stats', auth, adminAuth, getCartStats);

// @route   GET /api/carts/:id
// @desc    Get cart by cart ID
// @access  Public
router.get('/:id', getCartById);

// @route   GET /api/carts/user/:userId
// @desc    Get cart by user ID
// @access  Private
router.get('/user/:userId', auth, getCartByUserId);

// @route   POST /api/carts/:id/products
// @desc    Add product to cart
// @access  Public
router.post('/:id/products', addProductToCart);

// @route   PUT /api/carts/:id/products/:productId
// @desc    Update product quantity in cart
// @access  Public
router.put('/:id/products/:productId', updateProductQuantity);

// @route   DELETE /api/carts/:id/products/:productId
// @desc    Remove product from cart
// @access  Public
router.delete('/:id/products/:productId', removeProductFromCart);

// @route   DELETE /api/carts/:id
// @desc    Clear cart
// @access  Public
router.delete('/:id', clearCart);

// @route   POST /api/carts/merge
// @desc    Merge guest cart with user cart
// @access  Private
router.post('/merge', auth, mergeGuestCart);

module.exports = router;