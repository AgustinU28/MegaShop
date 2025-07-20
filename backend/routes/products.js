// backend/routes/products.js
const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  updateProductStock,
  addProductReview
} = require('../controllers/productController');

const { auth, adminAuth } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products with optional filters and pagination
// @access  Public
router.get('/', getAllProducts);

// @route   GET /api/products/search
// @desc    Search products
// @access  Public
router.get('/search', searchProducts);

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', getProductById);

// @route   POST /api/products
// @desc    Create new product
// @access  Private/Admin
router.post('/', auth, adminAuth, createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', auth, adminAuth, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, deleteProduct);

// @route   PATCH /api/products/:id/stock
// @desc    Update product stock
// @access  Private
router.patch('/:id/stock', auth, updateProductStock);

// @route   POST /api/products/:id/reviews
// @desc    Add product review
// @access  Private
router.post('/:id/reviews', auth, addProductReview);

module.exports = router;