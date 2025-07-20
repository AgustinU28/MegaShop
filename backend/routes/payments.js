// backend/routes/payments.js - Versión SIN autenticación para debugging
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

// Create payment intent (SIN autenticación)
router.post('/create-payment-intent', async (req, res) => {
  try {
    console.log('🔄 Create payment intent called');
    console.log('📦 Request body:', req.body);
    console.log('🔑 Environment variables check:');
    console.log('- STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('- STRIPE_SECRET_KEY starts with sk_:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_'));

    // Verificar si Stripe está configurado
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY no está configurado');
      return res.status(500).json({
        success: false,
        message: 'STRIPE_SECRET_KEY no está configurado en las variables de entorno'
      });
    }

    if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
      console.error('❌ STRIPE_SECRET_KEY no tiene el formato correcto');
      return res.status(500).json({
        success: false,
        message: 'STRIPE_SECRET_KEY no tiene el formato correcto'
      });
    }

    // Inicializar Stripe aquí directamente
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe initialized successfully');

    const { amount, currency = 'ars', metadata = {} } = req.body;

    // Validaciones
    if (!amount || amount <= 0) {
      console.error('❌ Invalid amount:', amount);
      return res.status(400).json({
        success: false,
        message: 'Monto inválido'
      });
    }

    console.log('💰 Creating payment intent for amount:', amount);

    // Crear Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe maneja centavos
      currency: currency.toLowerCase(),
      metadata: {
        orderId: `order_${Date.now()}`,
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('✅ Payment intent created successfully:', paymentIntent.id);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Detailed error in create-payment-intent:');
    console.error('Error message:', error.message);
    console.error('Error type:', error.type);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Error al crear el payment intent',
      error: error.message,
      errorType: error.type,
      errorCode: error.code,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Confirm payment (SIN autenticación)
router.post('/confirm-payment', async (req, res) => {
  try {
    console.log('🔄 Confirm payment called');
    
    const { paymentIntentId, orderData, shippingInfo, customerInfo } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID es requerido'
      });
    }

    // Inicializar Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Verificar el payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('🔍 Payment intent status:', paymentIntent.status);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: `El pago no fue completado. Estado: ${paymentIntent.status}`
      });
    }

    // Crear orden simulada
    const order = {
      id: `ORD-${Date.now()}`,
      paymentIntentId: paymentIntentId,
      amount: paymentIntent.amount / 100,
      status: 'paid',
      items: orderData?.items || [],
      shipping: shippingInfo || {},
      customer: customerInfo || {},
      createdAt: new Date().toISOString()
    };

    console.log('✅ Order created:', order.id);

    res.json({
      success: true,
      message: 'Pago confirmado y orden creada',
      order: order
    });

  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar el pago',
      error: error.message
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

module.exports = router;