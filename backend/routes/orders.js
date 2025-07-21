// backend/routes/orders.js - ARCHIVO COMPLETO Y FUNCIONAL
const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const Order = require('../models/Order');
const puppeteer = require('puppeteer');

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
// Reemplaza SOLO la ruta /:id/invoice en tu routes/orders.js

// @route   GET /api/orders/:id/invoice
// @desc    Download order invoice as PDF - FIXED VALIDATION
// @access  Private
router.get('/:id/invoice', auth, async (req, res) => {
  let browser;
  try {
    console.log('📄 Generating invoice for order:', req.params.id);

    const order = await Order.findById(req.params.id)
      .populate('items.product', 'title image code category brand')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    console.log('✅ Order found:', order.orderNumber);

    // Verificar permisos
    let orderUserId = null;
    if (order.user) {
      orderUserId = typeof order.user === 'object' ? order.user._id.toString() : order.user.toString();
    }
    
    const requestingUserId = req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (order.user && orderUserId !== requestingUserId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para descargar esta factura'
      });
    }

    console.log('✅ Permission granted, generating PDF...');

    // Usar la función existente
    const simpleHTML = generateSimpleInvoiceHTML(order);
    console.log('✅ HTML generated using existing function');

    // Puppeteer con configuración robusta
    console.log('🔄 Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run'
      ]
    });

    console.log('✅ Browser launched');
    const page = await browser.newPage();
    
    // Configurar página
    await page.setViewport({ width: 1200, height: 800 });
    
    console.log('🔄 Setting HTML content...');
    await page.setContent(simpleHTML, { 
      waitUntil: 'networkidle0',
      timeout: 15000 
    });

    console.log('🔄 Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      },
      preferCSSPageSize: false
    });

    console.log('✅ PDF generated successfully');
    console.log('📊 PDF buffer size:', pdfBuffer.length, 'bytes');

    await browser.close();
    console.log('✅ Browser closed');

    // ✅ VALIDACIONES SIMPLIFICADAS - SIN VERIFICAR FIRMA
    if (!pdfBuffer) {
      throw new Error('PDF buffer is null');
    }

    if (pdfBuffer.length === 0) {
      throw new Error('PDF buffer is empty (0 bytes)');
    }

    if (pdfBuffer.length < 500) {
      console.warn('⚠️ PDF seems very small:', pdfBuffer.length, 'bytes');
    }

    console.log('✅ PDF validation passed - size is good');

    // Headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="factura-${order.orderNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    console.log('✅ Sending PDF response');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ Error generating PDF:', error.message);
    console.error('❌ Full error:', error);
    
    if (browser) {
      try {
        await browser.close();
        console.log('✅ Browser closed after error');
      } catch (closeError) {
        console.error('❌ Error closing browser:', closeError.message);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al generar la factura PDF',
      error: error.message,
      details: 'Revisa los logs del servidor para más información'
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

    // Verificación de permisos
    let orderUserId = null;
    
    if (order.user) {
      if (typeof order.user === 'object' && order.user._id) {
        orderUserId = order.user._id.toString();
      } else {
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

    if (order.user && orderUserId !== requestingUserId && !isAdmin) {
      console.log('❌ Access denied - User not owner of order');
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
      .select('-payment.paymentIntentId -payment.transactionId');

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

// FUNCIÓN SIMPLIFICADA PARA GENERAR HTML
function generateSimpleInvoiceHTML(order) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-AR');
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Factura - ${order.orderNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          font-size: 14px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 15px;
        }
        .company-name {
          font-size: 24px;
          color: #007bff;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .invoice-info {
          background: #f8f9fa;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 5px;
        }
        .customer-info {
          margin-bottom: 20px;
        }
        .customer-info h3 {
          color: #007bff;
          margin-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background: #007bff;
          color: white;
          padding: 10px;
          text-align: left;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        .text-right {
          text-align: right;
        }
        .totals {
          margin-top: 20px;
          text-align: right;
        }
        .total-row {
          background: #007bff;
          color: white;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">UriShop</div>
        <p>Tienda de Gaming & Tecnología</p>
      </div>

      <div class="invoice-info">
        <h2>FACTURA N° ${order.orderNumber}</h2>
        <p><strong>Fecha:</strong> ${formatDate(order.createdAt)}</p>
        <p><strong>Estado:</strong> ${order.status.toUpperCase()}</p>
      </div>

      <div class="customer-info">
        <h3>Información del Cliente</h3>
        <p><strong>Nombre:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
        <p><strong>Email:</strong> ${order.customer.email}</p>
        <p><strong>Teléfono:</strong> ${order.customer.phone}</p>
      </div>

      <div class="customer-info">
        <h3>Dirección de Envío</h3>
        <p>${order.shipping.address}</p>
        <p>${order.shipping.city}, ${order.shipping.state} ${order.shipping.postalCode}</p>
        <p>${order.shipping.country}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th class="text-right">Cantidad</th>
            <th class="text-right">Precio</th>
            <th class="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td>${item.title}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatPrice(item.price)}</td>
              <td class="text-right">${formatPrice(item.subtotal)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <table style="width: 300px; margin-left: auto;">
          <tr>
            <td><strong>Subtotal:</strong></td>
            <td class="text-right">${formatPrice(order.pricing.subtotal)}</td>
          </tr>
          <tr>
            <td><strong>IVA (21%):</strong></td>
            <td class="text-right">${formatPrice(order.pricing.tax)}</td>
          </tr>
          <tr>
            <td><strong>Envío:</strong></td>
            <td class="text-right">${order.pricing.shipping > 0 ? formatPrice(order.pricing.shipping) : 'GRATIS'}</td>
          </tr>
          <tr class="total-row">
            <td><strong>TOTAL:</strong></td>
            <td class="text-right"><strong>${formatPrice(order.pricing.total)}</strong></td>
          </tr>
        </table>
      </div>

      <div style="margin-top: 30px; text-align: center; color: #666;">
        <p>Gracias por tu compra en UriShop</p>
        <p>Orden: ${order.orderNumber} - Generado: ${formatDate(new Date())}</p>
      </div>
    </body>
    </html>
  `;
}

module.exports = router;