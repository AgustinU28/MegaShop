// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  thumbnail: {
    type: String,
    required: [true, 'La imagen es requerida'],
    validate: {
      validator: function(v) {
        return /^(https?:\/\/)|(data:image\/)/.test(v);
      },
      message: 'Debe ser una URL válida o una imagen en base64'
    }
  },
  code: {
    type: String,
    required: [true, 'El código es requerido'],
    unique: true,
    uppercase: true,
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  category: {
    type: String,
    default: 'Gaming',
    enum: ['Gaming', 'Oficina', 'Profesional', 'Multimedia']
  },
  brand: {
    type: String,
    default: 'UriShop'
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true
  }],
  specifications: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  }],
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para verificar si está disponible
productSchema.virtual('isAvailable').get(function() {
  return this.stock > 0 && this.status === 'active';
});

// Virtual para verificar stock bajo
productSchema.virtual('isLowStock').get(function() {
  return this.stock <= 5 && this.stock > 0;
});

// Índices para búsquedas eficientes
productSchema.index({ title: 'text', description: 'text', code: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });

// Middleware para actualizar el rating promedio
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
    return;
  }

  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
  this.totalReviews = this.reviews.length;
};

// Pre-save middleware
productSchema.pre('save', function(next) {
  this.calculateAverageRating();
  next();
});

module.exports = mongoose.model('Product', productSchema);