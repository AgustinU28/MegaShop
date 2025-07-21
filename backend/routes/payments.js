// backend/routes/payments.js - Archivo completo y correcto
const express = require('express');
const router = express.Router();

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

// Confirm payment - Versión de debugging
router.post('/confirm-payment', async (req, res) => {
  try {
    console.log('🔄 Confirm payment called');
    console.log('📦 Full request body:', JSON.stringify(req.body, null, 2));
    
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

    // Preparar datos de la orden
    const orderToCreate = {
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
      items: orderData.items.map(item => ({
        product: item.product || null,
        productId: item.productId || item.id,
        title: item.title || item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        image: item.image || ''
      })),
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

    console.log('📋 Order data prepared');

    // Intentar crear orden en la base de datos
    console.log('💾 Attempting to save order to database...');
    
    try {
      const order = new Order(orderToCreate);
      const savedOrder = await order.save();
      
      console.log('✅ Order saved successfully:', savedOrder.orderNumber);

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
          createdAt: savedOrder.createdAt
        }
      });

    } catch (dbError) {
      console.error('❌ Database error:', dbError.message);
      console.error('Full error:', dbError);
      
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
        createdAt: new Date().toISOString()
      };

      console.log('⚠️ Returning temporal order due to DB error');
      
      res.json({
        success: true,
        message: 'Pago confirmado (orden temporal por error en BD)',
        order: temporalOrder,
        warning: 'La orden no se guardó en la base de datos'
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