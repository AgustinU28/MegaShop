// backend/routes/orders.js - Archivo completo y funcional
const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const Order = require('../models/Order');

// @route   GET /api/orders/test
// @desc    Test orders routes
// @access  Public
router.get('/test', (req, res) => {
  console.log('✅ Orders test route accessed');
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
    console.log('🔍 Getting orders for user:', req.user.id);
    console.log('📋 Query params:', req.query);

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

    console.log('🔍 Applied filters:', filters);

    // Configurar paginación
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Configurar ordenamiento
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    console.log('📊 Pagination:', { pageNumber, limitNumber, skip });
    console.log('🔢 Sort options:', sortOptions);

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

    console.log('📦 Found orders:', orders.length);
    console.log('📊 Total orders:', totalOrders);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalOrders / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    const response = {
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
    };

    console.log('✅ Sending response with', orders.length, 'orders');
    res.json(response);

  } catch (error) {
    console.error('❌ Error getting orders:', error);
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
    console.log('🔍 Getting order by ID:', req.params.id);
    console.log('👤 User requesting:', { id: req.user.id, role: req.user.role });

    const order = await Order.findById(req.params.id)
      .populate('items.product', 'title image code category brand')
      .populate('user', 'name email');

    if (!order) {
      console.log('❌ Order not found');
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    console.log('📦 Found order:', {
      id: order._id,
      orderNumber: order.orderNumber,
      orderUserId: order.user?.toString(),
      requestingUserId: req.user.id
    });

    // ✅ VERIFICACIÓN CORREGIDA: Obtener el ID del usuario correctamente
    let orderUserId = null;
    
    if (order.user) {
      // Si order.user es un objeto poblado, obtener el _id
      if (typeof order.user === 'object' && order.user._id) {
        orderUserId = order.user._id.toString();
      } 
      // Si order.user es solo un ObjectId
      else {
        orderUserId = order.user.toString();
      }
    }
    
    const requestingUserId = req.user.id.toString();
    const isAdmin = req.user.role === 'admin';
    
    console.log('🔐 Authorization check:', {
      orderUserId,
      requestingUserId,
      isAdmin,
      isOwner: orderUserId === requestingUserId,
      canAccess: isAdmin || orderUserId === requestingUserId || !order.user
    });

    // Permitir acceso si:
    // 1. Es admin
    // 2. Es el dueño de la orden
    // 3. La orden no tiene usuario asignado (orden de invitado)
    if (order.user && orderUserId !== requestingUserId && !isAdmin) {
      console.log('❌ Access denied - User not owner of order');
      console.log('❌ Comparison failed:', { orderUserId, requestingUserId, equal: orderUserId === requestingUserId });
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta orden'
      });
    }

    console.log('✅ Access granted');

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('❌ Error getting order:', error);
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
    console.log('🔍 Getting order by number:', req.params.orderNumber);

    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('items.product', 'title image code')
      .select('-payment.paymentIntentId -payment.transactionId'); // Ocultar info sensible

    if (!order) {
      console.log('❌ Order not found by number');
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    console.log('✅ Order found by number');

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('❌ Error getting order by number:', error);
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

    console.log('🔄 Updating order status:', { orderId: req.params.id, status, user: req.user.role });

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

    console.log('✅ Order status updated successfully');

    res.json({
      success: true,
      message: 'Estado de orden actualizado exitosamente',
      data: order
    });

  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado de la orden',
      error: error.message
    });
  }
});

// @route   PATCH /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;

    console.log('🔄 Cancelling order:', { orderId: req.params.id, reason, userId: req.user.id });

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar permisos
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para cancelar esta orden'
      });
    }

    // Verificar si se puede cancelar
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar una orden que ya ha sido enviada, entregada o cancelada'
      });
    }

    await order.updateStatus('cancelled', reason || 'Cancelado por el usuario', req.user.id);

    console.log('✅ Order cancelled successfully');

    res.json({
      success: true,
      message: 'Orden cancelada exitosamente',
      data: order
    });

  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar la orden',
      error: error.message
    });
  }
});

// @route   GET /api/orders/stats/summary
// @desc    Get orders statistics
// @access  Private/Admin
router.get('/stats/summary', auth, async (req, res) => {
  try {
    console.log('📊 Getting order stats for user:', req.user.role);

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver estadísticas'
      });
    }

    const stats = await Order.getStats();

    console.log('✅ Order stats retrieved');

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error getting order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

// ✅ CRÍTICO: Exportar el router
module.exports = router;