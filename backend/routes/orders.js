// backend/routes/orders.js - Versión completa y funcional
const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const Order = require('../models/Order');

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
// @desc    Get user orders with pagination and filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Construir filtros
    const filters = { user: req.user.id };

    if (status) {
      filters.status = status;
    }

    if (search) {
      filters.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }

    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) filters.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filters.createdAt.$lte = new Date(dateTo);
    }

    // Configurar paginación
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Configurar ordenamiento
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Ejecutar consulta
    const [orders, totalOrders] = await Promise.all([
      Order.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber)
        .populate('items.product', 'title image code')
        .lean(),
      Order.countDocuments(filters)
    ]);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalOrders / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalOrders,
          hasNextPage,
          hasPrevPage,
          limit: limitNumber
        }
      }
    });

  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las órdenes',
      error: error.message
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'title image code category brand')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar que el usuario puede acceder a esta orden
    if (order.user && order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta orden'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la orden',
      error: error.message
    });
  }
});

// @route   GET /api/orders/number/:orderNumber
// @desc    Get order by order number
// @access  Public (for order tracking)
router.get('/number/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('items.product', 'title image code')
      .select('-payment.paymentIntentId -payment.transactionId'); // Ocultar info sensible

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error getting order by number:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la orden',
      error: error.message
    });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, message } = req.body;

    // Solo admins pueden cambiar estado de órdenes
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar el estado de órdenes'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    await order.updateStatus(status, message, req.user.id);

    res.json({
      success: true,
      message: 'Estado de orden actualizado exitosamente',
      data: order
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado de la orden',
      error: error.message
    });
  }
});

// @route   GET /api/orders/stats/summary
// @desc    Get orders statistics
// @access  Private/Admin
router.get('/stats/summary', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver estadísticas'
      });
    }

    const stats = await Order.getStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

module.exports = router;