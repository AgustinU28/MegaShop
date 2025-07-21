// backend/routes/payments.js - Con autenticación y usuario asignado
const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth'); // ✅ Importar middleware

// Test route
router.get('/test', (req, res) => {
  console.log('✅ Payment test route accessed');
  res.json({
    success: true,
    message: 'Payment routes funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    console.log('🔄 Create payment intent called');
    console.log('📦 Request body:', req.body);

    // Verificar si Stripe está configurado
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY no está configurado');
      return res.status(500).json({
        success: false,
        message: 'STRIPE_SECRET_KEY no está configurado'
      });
    }

    // Inicializar Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe initialized successfully');

    const { amount, currency = 'usd', metadata = {} } = req.body;

    // Validaciones básicas
    if (!amount || amount <= 0) {
      console.error('❌ Invalid amount:', amount);
      return res.status(400).json({
        success: false,
        message: 'Monto inválido'
      });
    }

    console.log('💰 Creating payment intent for amount:', amount, 'currency:', currency);

    // Crear Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: currency.toLowerCase(),
      metadata: {
        orderId: `order_${Date.now()}`,
        ...metadata
      },
      payment_method_types: ['card']
    });

    console.log('✅ Payment intent created successfully:', paymentIntent.id);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

  } catch (error) {
    console.error('❌ Error in create-payment-intent:');
    console.error('Error message:', error.message);
    console.error('Error type:', error.type);
    console.error('Error code:', error.code);
    
    res.status(500).json({
      success: false,
      message: 'Error al crear el payment intent',
      error: error.message,
      errorType: error.type || 'unknown',
      errorCode: error.code || 'unknown'
    });
  }
});

// Config route
router.get('/config', (req, res) => {
  console.log('🔧 Config route accessed');
  res.json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    hasSecretKey: !!process.env.STRIPE_SECRET_KEY
  });
});

// ✅ Confirm payment - Con autenticación opcional y usuario asignado
router.post('/confirm-payment', optionalAuth, async (req, res) => {
  try {
    console.log('🔄 Confirm payment called');
    console.log('📦 Full request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User from auth:', req.user ? { id: req.user.id, email: req.user.email } : 'No user');
    
    const { paymentIntentId, orderData, shippingInfo, customerInfo } = req.body;

    if (!paymentIntentId) {
      console.log('❌ Missing paymentIntentId');
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID es requerido'
      });
    }

    console.log('✅ PaymentIntentId received:', paymentIntentId);

    // Validar que tenemos todos los datos necesarios
    if (!orderData?.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      console.log('❌ Missing or invalid order items');
      return res.status(400).json({
        success: false,
        message: 'Los items de la orden son requeridos'
      });
    }

    console.log('✅ Order items validated:', orderData.items.length, 'items');

    // Verificar que el modelo Order existe
    let Order;
    try {
      Order = require('../models/Order');
      console.log('✅ Order model imported successfully');
    } catch (error) {
      console.error('❌ Error importing Order model:', error.message);
      
      // Si no existe el modelo, crear orden temporal
      const temporalOrder = {
        id: `ORD-${Date.now()}`,
        orderNumber: `ORD-TEMP-${Date.now()}`,
        paymentIntentId: paymentIntentId,
        status: 'confirmed',
        items: orderData.items,
        customer: customerInfo,
        shipping: shippingInfo,
        user: req.user ? req.user.id : null, // ✅ Agregar usuario si está autenticado
        createdAt: new Date().toISOString()
      };

      console.log('⚠️ Using temporal order (Order model not found)');
      
      return res.json({
        success: true,
        message: 'Pago confirmado (orden temporal)',
        order: temporalOrder
      });
    }

    // Calcular totales
    console.log('🧮 Calculating totals...');
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.21 * 100) / 100;
    const shipping = subtotal >= 50000 ? 0 : 1500;
    const total = subtotal + tax + shipping;

    console.log('💰 Totals calculated:', { subtotal, tax, shipping, total });

    // ✅ Preparar datos de la orden CON USUARIO
    const orderToCreate = {
      // ✅ Agregar orderNumber explícitamente
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      
      // ✅ CRÍTICO: Asignar usuario si está autenticado
      user: req.user ? req.user.id : null,
      
      customer: {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone
      },
      shipping: {
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode,
        instructions: shippingInfo.instructions || '',
        country: 'Argentina'
      },
      // ✅ Mapeo corregido de items
      items: orderData.items.map((item, index) => {
        console.log(`🔍 Mapping item ${index + 1}:`, JSON.stringify(item, null, 2));
        
        const mappedItem = {
          product: item.product?._id || item.product || null,
          productId: item.productId || item.product?.id || item.id || index + 1,
          // ✅ Corrección principal: obtener título del objeto product
          title: item.product?.title || item.title || item.name || `Producto ${index + 1}`,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
          // ✅ Obtener imagen del producto
          image: item.product?.thumbnail || item.image || item.thumbnail || ''
        };
        
        console.log(`✅ Mapped item ${index + 1}:`, mappedItem);
        return mappedItem;
      }),
      pricing: {
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: total
      },
      payment: {
        method: 'stripe',
        status: 'completed',
        paymentIntentId: paymentIntentId,
        currency: 'USD',
        paidAt: new Date()
      },
      status: 'confirmed',
      timeline: [{
        status: 'confirmed',
        message: 'Orden confirmada y pago procesado exitosamente',
        timestamp: new Date()
      }]
    };

    // ✅ Logging mejorado para debug
    console.log('📋 Order data prepared:');
    console.log('- OrderNumber:', orderToCreate.orderNumber);
    console.log('- User ID:', orderToCreate.user || 'No user assigned');
    console.log('- Items count:', orderToCreate.items.length);
    console.log('- First item title:', orderToCreate.items[0]?.title);
    console.log('- Customer:', orderToCreate.customer.firstName, orderToCreate.customer.lastName);
    console.log('- Total amount:', orderToCreate.pricing.total);

    // Intentar crear orden en la base de datos
    console.log('💾 Attempting to save order to database...');
    
    try {
      const order = new Order(orderToCreate);
      
      // ✅ Validar datos antes de guardar
      console.log('🔍 Validating order data before saving...');
      const validationErrors = order.validateSync();
      if (validationErrors) {
        console.error('❌ Validation errors found:', validationErrors.errors);
        throw validationErrors;
      }
      
      const savedOrder = await order.save();
      
      console.log('✅ Order saved successfully:', savedOrder.orderNumber);
      console.log('👤 Order assigned to user:', savedOrder.user || 'No user');

      res.json({
        success: true,
        message: 'Pago confirmado y orden creada',
        order: {
          id: savedOrder._id,
          orderNumber: savedOrder.orderNumber,
          status: savedOrder.status,
          total: savedOrder.pricing.total,
          items: savedOrder.items,
          customer: savedOrder.customer,
          shipping: savedOrder.shipping,
          payment: savedOrder.payment,
          user: savedOrder.user,
          createdAt: savedOrder.createdAt
        }
      });

    } catch (dbError) {
      console.error('❌ Database error:', dbError.message);
      console.error('Full error:', dbError);
      
      // ✅ Logging detallado del error
      if (dbError.errors) {
        Object.keys(dbError.errors).forEach(key => {
          console.error(`❌ Field error [${key}]:`, dbError.errors[key].message);
        });
      }
      
      // Si falla la BD, devolver orden temporal
      const temporalOrder = {
        id: `ORD-${Date.now()}`,
        orderNumber: `ORD-TEMP-${Date.now()}`,
        paymentIntentId: paymentIntentId,
        status: 'confirmed',
        total: total,
        items: orderData.items,
        customer: customerInfo,
        shipping: shippingInfo,
        user: req.user ? req.user.id : null, // ✅ Incluir usuario en temporal también
        createdAt: new Date().toISOString(),
        error: dbError.message
      };

      console.log('⚠️ Returning temporal order due to DB error');
      
      res.json({
        success: true,
        message: 'Pago confirmado (orden temporal por error en BD)',
        order: temporalOrder,
        warning: 'La orden no se guardó en la base de datos',
        dbError: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }

  } catch (error) {
    console.error('❌ General error in confirm-payment:', error.message);
    console.error('Full error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Error al confirmar el pago y crear la orden',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;