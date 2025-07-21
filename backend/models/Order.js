// backend/models/Order.js - SOLO MODELO, SIN RUTAS
const mongoose = require('mongoose');

// Schema para los items de la orden
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

// Schema para información del cliente
const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  }
});

// Schema para información de envío
const shippingSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    default: 'Argentina'
  },
  instructions: {
    type: String,
    trim: true
  }
});

// Schema para información de pago
const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: ['stripe', 'paypal', 'transfer', 'cash']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String
  },
  transactionId: {
    type: String
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paidAt: {
    type: Date
  }
});

// Schema para precios
const pricingSchema = new mongoose.Schema({
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0
  },
  shipping: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
});

// Schema para timeline/historial
const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Schema principal de la orden
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  items: [orderItemSchema],
  customer: {
    type: customerSchema,
    required: true
  },
  shipping: {
    type: shippingSchema,
    required: true
  },
  payment: {
    type: paymentSchema,
    required: true
  },
  pricing: {
    type: pricingSchema,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending',      // Orden creada, esperando pago
      'confirmed',    // Pago confirmado
      'processing',   // En preparación
      'shipped',      // Enviado
      'delivered',    // Entregado
      'cancelled'     // Cancelado
    ],
    default: 'pending'
  },
  timeline: [timelineSchema],
  notes: {
    type: String,
    trim: true
  },
  estimatedDelivery: {
    type: Date
  },
  trackingNumber: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para el nombre completo del cliente
orderSchema.virtual('customer.fullName').get(function() {
  if (this.customer) {
    return `${this.customer.firstName} ${this.customer.lastName}`;
  }
  return '';
});

// Virtual para verificar si se puede cancelar
orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

// Índices
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ createdAt: -1 });

// Método para actualizar estado
orderSchema.methods.updateStatus = function(newStatus, message, updatedBy) {
  this.status = newStatus;
  
  this.timeline.push({
    status: newStatus,
    message: message || `Estado cambiado a ${newStatus}`,
    timestamp: new Date(),
    updatedBy: updatedBy
  });
  
  // Actualizar fecha estimada de entrega si se envía
  if (newStatus === 'shipped' && !this.estimatedDelivery) {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 días por defecto
    this.estimatedDelivery = deliveryDate;
  }
  
  return this.save();
};

// Método para calcular totales
orderSchema.methods.calculateTotals = function() {
  const subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = Math.round(subtotal * 0.21 * 100) / 100; // 21% IVA
  const shipping = subtotal >= 50000 ? 0 : 1500; // Envío gratis > $50000
  const total = subtotal + tax + shipping;
  
  this.pricing = {
    subtotal,
    tax,
    shipping,
    total
  };
  
  return { subtotal, tax, shipping, total };
};

// Pre-save middleware para generar orderNumber si no existe
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Método estático para obtener estadísticas
orderSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$pricing.total' }
      }
    }
  ]);
  
  const totalOrders = await this.countDocuments();
  const totalRevenue = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$pricing.total' }
      }
    }
  ]);
  
  return {
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    byStatus: stats
  };
};

module.exports = mongoose.model('Order', orderSchema);