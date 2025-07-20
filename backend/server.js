// backend/server.js
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
  res.status(204).end(); // No Content - evita el error 404
});

// O si quieres servir un favicon real:
app.get('/favicon.ico', (req, res) => {
  res.redirect('https://cdn-icons-png.flaticon.com/32/3712/3712200.png');
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente'
  });
});

// 🔗 Importar y registrar TODAS las rutas
try {
  const productRoutes = require('./routes/products');
  app.use('/api/products', productRoutes);
  console.log('✅ Product routes loaded');
} catch (err) {
  console.log('⚠️ Product routes not loaded:', err.message);
}

try {
  const cartRoutes = require('./routes/cart');
  app.use('/api/carts', cartRoutes);
  console.log('✅ Cart routes loaded');
} catch (err) {
  console.log('⚠️ Cart routes not loaded:', err.message);
}

try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (err) {
  console.log('⚠️ Auth routes not loaded:', err.message);
}

try {
  const orderRoutes = require('./routes/orders');
  app.use('/api/orders', orderRoutes);
  console.log('✅ Order routes loaded');
} catch (err) {
  console.log('⚠️ Order routes not loaded:', err.message);
}

// 🔍 Estadísticas de base de datos
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
  res.status(404).json({ 
    success: false,
    message: `Endpoint no encontrado: ${req.method} ${req.originalUrl}`
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
});

module.exports = app;