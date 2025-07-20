// backend/models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productId: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1'],
    max: [50, 'La cantidad no puede exceder 50']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'El precio no puede ser negativo']
  },
  subtotal: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Pre-save para calcular subtotal del item
cartItemSchema.pre('save', function(next) {
  this.subtotal = this.price * this.quantity;
  next();
});

const cartSchema = new mongoose.Schema({
  cartId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'abandoned', 'converted'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 7 * 24 * 60 * 60 // 7 días en segundos
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para obtener el número de productos únicos
cartSchema.virtual('uniqueItemsCount').get(function() {
  return this.items.length;
});

// Métodos para calcular totales
cartSchema.methods.calculateTotals = function() {
  // Calcular totales de items
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.subtotal = this.items.reduce((total, item) => total + item.subtotal, 0);
  
  // Calcular impuestos (21% IVA en Argentina)
  this.tax = Math.round(this.subtotal * 0.21 * 100) / 100;
  
  // Calcular envío (gratis si es mayor a $50000)
  this.shipping = this.subtotal >= 50000 ? 0 : 1500;
  
  // Total final
  this.total = this.subtotal + this.tax + this.shipping;
  
  return {
    totalItems: this.totalItems,
    subtotal: this.subtotal,
    tax: this.tax,
    shipping: this.shipping,
    total: this.total
  };
};

// Método para agregar item
cartSchema.methods.addItem = async function(productId, quantity, price) {
  const existingItemIndex = this.items.findIndex(
    item => item.productId === productId
  );

  if (existingItemIndex >= 0) {
    // Actualizar cantidad del item existente
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].subtotal = 
      this.items[existingItemIndex].price * this.items[existingItemIndex].quantity;
  } else {
    // Agregar nuevo item
    this.items.push({
      productId,
      quantity,
      price,
      subtotal: price * quantity
    });
  }

  this.calculateTotals();
  return this.save();
};

// Método para actualizar cantidad
cartSchema.methods.updateItemQuantity = function(productId, quantity) {
  const item = this.items.find(item => item.productId === productId);
  
  if (item) {
    item.quantity = quantity;
    item.subtotal = item.price * quantity;
    this.calculateTotals();
  }
  
  return this.save();
};

// Método para remover item
cartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => item.productId !== productId);
  this.calculateTotals();
  return this.save();
};

// Método para limpiar carrito
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.calculateTotals();
  return this.save();
};

// Pre-save middleware para calcular totales automáticamente
cartSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.calculateTotals();
  }
  next();
});

// Índices
cartSchema.index({ cartId: 1 });
cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ status: 1 });
cartSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Cart', cartSchema);