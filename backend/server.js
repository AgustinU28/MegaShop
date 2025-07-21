// backend/server.js - FIXED VERSION QUE SÍ CARGA ÓRDENES
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Conectar MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected');
  checkProducts();
})
.catch(err => {
  console.error('❌ MongoDB Error:', err.message);
  process.exit(1);
});

// 🧪 Verificar si hay productos
const checkProducts = async () => {
  try {
    const Product = require('./models/Product');
    const productCount = await Product.countDocuments();

    if (productCount === 0) {
      console.log('📦 No hay productos - ejecuta: npm run seed');
    } else {
      console.log(`📊 Base de datos contiene ${productCount} productos`);
    }
  } catch (error) {
    console.log('⚠️  Error verificando productos:', error.message);
  }
};

// Rutas básicas
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'UriShop Backend funcionando',
    timestamp: new Date().toISOString()
  });
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente'
  });
});

// 🔗 CARGAR TODAS LAS RUTAS
console.log('🔄 Starting to load all routes...');

// Products
try {
  const productRoutes = require('./routes/products');
  app.use('/api/products', productRoutes);
  console.log('✅ Product routes loaded');
} catch (err) {
  console.error('❌ Product routes error:', err.message);
}

// Carts
try {
  const cartRoutes = require('./routes/cart');
  app.use('/api/carts', cartRoutes);
  console.log('✅ Cart routes loaded');
} catch (err) {
  console.error('❌ Cart routes error:', err.message);
}

// Auth
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (err) {
  console.error('❌ Auth routes error:', err.message);
}

// 🚨 ÓRDENES - LA PARTE CRÍTICA
console.log('🔄 Loading ORDER ROUTES - CRITICAL...');
try {
  console.log('📁 Checking if routes/orders.js exists...');
  
  const fs = require('fs');
  const path = require('path');
  const orderFilePath = path.join(__dirname, 'routes', 'orders.js');
  
  if (!fs.existsSync(orderFilePath)) {
    console.error('❌ ERROR: routes/orders.js file does not exist!');
    console.error('❌ File path checked:', orderFilePath);
    throw new Error('orders.js file not found');
  }
  
  console.log('✅ orders.js file exists, attempting to require...');
  const orderRoutes = require('./routes/orders');
  
  if (typeof orderRoutes !== 'function') {
    console.error('❌ ERROR: orders.js does not export a router function');
    console.error('❌ Exported type:', typeof orderRoutes);
    throw new Error('Invalid router export');
  }
  
  console.log('✅ orders.js loaded successfully, mounting routes...');
  app.use('/api/orders', orderRoutes);
  
  console.log('🎉 ORDER ROUTES LOADED SUCCESSFULLY!');
  console.log('🎉 You should now be able to access /api/orders');
  
} catch (err) {
  console.error('❌ CRITICAL ERROR loading order routes:');
  console.error('❌ Error message:', err.message);
  console.error('❌ Stack trace:', err.stack);
  console.error('❌ This is why /api/orders returns 404');
  console.error('❌ Fix this error to resolve the 404 issue');
}

// Payments
try {
  const paymentRoutes = require('./routes/payments');
  app.use('/api/payments', paymentRoutes);
  console.log('✅ Payment routes loaded');
} catch (err) {
  console.error('❌ Payment routes error:', err.message);
}

// 🔍 Estadísticas
app.get('/api/stats', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const Cart = require('./models/Cart');

    const [productCount, cartCount] = await Promise.all([
      Product.countDocuments(),
      Cart.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        products: productCount,
        carts: cartCount,
        database: {
          status: 'Connected',
          host: mongoose.connection.host,
          name: mongoose.connection.name
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    message: `Endpoint no encontrado: ${req.method} ${req.originalUrl}`,
    hint: 'Check server logs for route loading errors'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API test: http://localhost:${PORT}/api/test`);
  console.log(`📦 Products: http://localhost:${PORT}/api/products`);
  console.log(`🛒 Carts: http://localhost:${PORT}/api/carts`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`📋 Orders: http://localhost:${PORT}/api/orders`);
  console.log(`💳 Payments: http://localhost:${PORT}/api/payments`);
  console.log('');
  console.log('📋 ORDERS STATUS CHECK:');
  console.log('- Look for "🎉 ORDER ROUTES LOADED SUCCESSFULLY!" above');
  console.log('- If not present, check the error details');
  console.log('- Test: http://localhost:${PORT}/api/orders/test');
});

module.exports = app;