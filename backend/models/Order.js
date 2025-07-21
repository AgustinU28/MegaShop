// backend/models/Order.js
const mongoose = require('mongoose');

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
  price: {
    type: Number,
    required: true,
    min: [0, 'El precio no puede ser negativo']
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1']
  },
  subtotal: {
    type: Number,
    required: true
  },
  image: {
    type: String
  }
}, {
  _id: false
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customer: {
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
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  shipping: {
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
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    instructions: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      default: 'Argentina'
    }
  },
  items: [orderItemSchema],
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'El subtotal no puede ser negativo']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Los impuestos no pueden ser negativos']
    },
    shipping: {
      type: Number,
      default: 0,
      min: [0, 'El costo de envío no puede ser negativo']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'El total no puede ser negativo']
    }
  },
  payment: {
    method: {
      type: String,
      default: 'stripe'
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
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
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  timeline: [{
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
  }],
  tracking: {
    carrier: {
      type: String
    },
    trackingNumber: {
      type: String
    },
    trackingUrl: {
      type: String
    },
    estimatedDelivery: {
      type: Date
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

orderSchema.virtual('customerFullName').get(function() {
  return `${this.customer.firstName} ${this.customer.lastName}`;
});

// Índices
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'customer.email': 1 });

// Middleware para generar número de orden automáticamente
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp.slice(-6)}${random}`;
  }
  next();
});

// Método para actualizar estado con timeline
orderSchema.methods.updateStatus = function(newStatus, message, updatedBy = null) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    message: message || `Estado actualizado a ${newStatus}`,
    timestamp: new Date(),
    updatedBy: updatedBy
  });
  
  // Actualizar estado de pago si corresponde
  if (newStatus === 'confirmed') {
    this.payment.status = 'completed';
    this.payment.paidAt = new Date();
  } else if (newStatus === 'cancelled') {
    this.payment.status = 'failed';
  }
  
  return this.save();
};

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
    { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
    { $group: { _id: null, total: { $sum: '$pricing.total' } } }
  ]);
  
  return {
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    byStatus: stats
  };
};

module.exports = mongoose.model('Order', orderSchema);