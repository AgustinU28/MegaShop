// backend/controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { v4: uuidv4 } = require('uuid');

// @desc    Create new cart
// @route   POST /api/carts
// @access  Public
const createCart = async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    const newCart = await Cart.create({
      cartId: uuidv4(),
      user: userId || null,
      sessionId: sessionId || null,
      items: []
    });

    res.status(201).json({
      success: true,
      message: 'Carrito creado exitosamente',
      data: newCart
    });
  } catch (error) {
    console.error('Error creating cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear carrito',
      error: error.message
    });
  }
};

// @desc    Get cart by ID
// @route   GET /api/carts/:id
// @access  Public
const getCartById = async (req, res) => {
  try {
    const cartId = req.params.id;

    const cart = await Cart.findOne({ cartId })
      .populate({
        path: 'items.product',
        select: 'id title description price thumbnail code stock status'
      });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    // Verificar disponibilidad de productos y actualizar precios
    let needsUpdate = false;
    const updatedItems = [];

    for (const item of cart.items) {
      const product = await Product.findOne({ id: item.productId });
      
      if (!product || product.status !== 'active') {
        // Producto no disponible, remover del carrito
        needsUpdate = true;
        continue;
      }

      // Actualizar precio si cambió
      if (item.price !== product.price) {
        item.price = product.price;
        item.subtotal = item.price * item.quantity;
        needsUpdate = true;
      }

      // Verificar stock disponible
      if (item.quantity > product.stock) {
        item.quantity = product.stock;
        item.subtotal = item.price * item.quantity;
        needsUpdate = true;
      }

      updatedItems.push(item);
    }

    if (needsUpdate) {
      cart.items = updatedItems;
      cart.calculateTotals();
      await cart.save();
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener carrito',
      error: error.message
    });
  }
};

// @desc    Add product to cart
// @route   POST /api/carts/:id/products
// @access  Public
const addProductToCart = async (req, res) => {
  try {
    const cartId = req.params.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'ID del producto es requerido'
      });
    }

    // Verificar que el producto existe y está disponible
    const product = await Product.findOne({ 
      id: parseInt(productId), 
      status: 'active' 
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado o no disponible'
      });
    }

    // Verificar stock disponible
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Disponible: ${product.stock}`
      });
    }

    // Buscar carrito
    const cart = await Cart.findOne({ cartId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === parseInt(productId)
    );

    if (existingItemIndex >= 0) {
      // Actualizar cantidad del producto existente
      const newQuantity = cart.items[existingItemIndex].quantity + parseInt(quantity);
      
      // Verificar stock total
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para la cantidad solicitada. Disponible: ${product.stock}`
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].subtotal = 
        cart.items[existingItemIndex].price * newQuantity;
    } else {
      // Agregar nuevo producto al carrito
      cart.items.push({
        product: product._id,
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        price: product.price,
        subtotal: product.price * parseInt(quantity)
      });
    }

    // Recalcular totales y guardar
    cart.calculateTotals();
    await cart.save();

    // Repoblar el carrito para la respuesta
    await cart.populate({
      path: 'items.product',
      select: 'id title description price thumbnail code stock status'
    });

    res.json({
      success: true,
      message: 'Producto agregado al carrito exitosamente',
      data: cart
    });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar producto al carrito',
      error: error.message
    });
  }
};

// @desc    Update product quantity in cart
// @route   PUT /api/carts/:id/products/:productId
// @access  Public
const updateProductQuantity = async (req, res) => {
  try {
    const { id: cartId, productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Cantidad debe ser mayor a 0'
      });
    }

    // Verificar que el producto existe y tiene stock
    const product = await Product.findOne({ 
      id: parseInt(productId),
      status: 'active'
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Disponible: ${product.stock}`
      });
    }

    const cart = await Cart.findOne({ cartId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId === parseInt(productId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en el carrito'
      });
    }

    // Actualizar cantidad y subtotal
    cart.items[itemIndex].quantity = parseInt(quantity);
    cart.items[itemIndex].price = product.price; // Actualizar precio por si cambió
    cart.items[itemIndex].subtotal = product.price * parseInt(quantity);

    // Recalcular totales y guardar
    cart.calculateTotals();
    await cart.save();

    // Repoblar para la respuesta
    await cart.populate({
      path: 'items.product',
      select: 'id title description price thumbnail code stock status'
    });

    res.json({
      success: true,
      message: 'Cantidad actualizada exitosamente',
      data: cart
    });
  } catch (error) {
    console.error('Error updating product quantity:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cantidad',
      error: error.message
    });
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/carts/:id/products/:productId
// @access  Public
const removeProductFromCart = async (req, res) => {
  try {
    const { id: cartId, productId } = req.params;

    const cart = await Cart.findOne({ cartId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId === parseInt(productId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en el carrito'
      });
    }

    // Remover item del carrito
    cart.items.splice(itemIndex, 1);

    // Recalcular totales y guardar
    cart.calculateTotals();
    await cart.save();

    // Repoblar para la respuesta
    await cart.populate({
      path: 'items.product',
      select: 'id title description price thumbnail code stock status'
    });

    res.json({
      success: true,
      message: 'Producto eliminado del carrito exitosamente',
      data: cart
    });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto del carrito',
      error: error.message
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/carts/:id
// @access  Public
const clearCart = async (req, res) => {
  try {
    const cartId = req.params.id;

    const cart = await Cart.findOne({ cartId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    // Limpiar items y recalcular
    cart.items = [];
    cart.calculateTotals();
    await cart.save();

    res.json({
      success: true,
      message: 'Carrito vaciado exitosamente',
      data: cart
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error al vaciar carrito',
      error: error.message
    });
  }
};

// @desc    Get all carts (for admin)
// @route   GET /api/carts
// @access  Private/Admin
const getAllCarts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'active',
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const filter = {};
    if (status !== 'all') {
      filter.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const carts = await Cart.find(filter)
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'id title price thumbnail'
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Cart.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      count: carts.length,
      total,
      page: parseInt(page),
      totalPages,
      data: carts
    });
  } catch (error) {
    console.error('Error getting all carts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener carritos',
      error: error.message
    });
  }
};

// @desc    Get cart by user ID
// @route   GET /api/carts/user/:userId
// @access  Private
const getCartByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    let cart = await Cart.findOne({ 
      user: userId, 
      status: 'active' 
    }).populate({
      path: 'items.product',
      select: 'id title description price thumbnail code stock status'
    });

    // Si no existe carrito, crear uno nuevo
    if (!cart) {
      cart = await Cart.create({
        cartId: uuidv4(),
        user: userId,
        items: []
      });
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error getting cart by user:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener carrito del usuario',
      error: error.message
    });
  }
};

// @desc    Merge guest cart with user cart
// @route   POST /api/carts/merge
// @access  Private
const mergeGuestCart = async (req, res) => {
  try {
    const { guestCartId, userId } = req.body;

    if (!guestCartId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'ID de carrito invitado y usuario son requeridos'
      });
    }

    // Obtener carrito de invitado
    const guestCart = await Cart.findOne({ cartId: guestCartId });
    
    if (!guestCart || guestCart.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Carrito de invitado no encontrado o vacío'
      });
    }

    // Obtener o crear carrito de usuario
    let userCart = await Cart.findOne({ 
      user: userId, 
      status: 'active' 
    });

    if (!userCart) {
      userCart = await Cart.create({
        cartId: uuidv4(),
        user: userId,
        items: []
      });
    }

    // Merge items del carrito de invitado
    for (const guestItem of guestCart.items) {
      const existingItemIndex = userCart.items.findIndex(
        item => item.productId === guestItem.productId
      );

      if (existingItemIndex >= 0) {
        // Sumar cantidades si el producto ya existe
        userCart.items[existingItemIndex].quantity += guestItem.quantity;
        userCart.items[existingItemIndex].subtotal = 
          userCart.items[existingItemIndex].price * 
          userCart.items[existingItemIndex].quantity;
      } else {
        // Agregar nuevo item
        userCart.items.push(guestItem);
      }
    }

    // Recalcular totales
    userCart.calculateTotals();
    await userCart.save();

    // Marcar carrito de invitado como convertido
    guestCart.status = 'converted';
    await guestCart.save();

    // Repoblar para la respuesta
    await userCart.populate({
      path: 'items.product',
      select: 'id title description price thumbnail code stock status'
    });

    res.json({
      success: true,
      message: 'Carritos fusionados exitosamente',
      data: userCart
    });
  } catch (error) {
    console.error('Error merging carts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al fusionar carritos',
      error: error.message
    });
  }
};

// @desc    Get cart statistics
// @route   GET /api/carts/stats
// @access  Private/Admin
const getCartStats = async (req, res) => {
  try {
    const stats = await Cart.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$total' },
          averageValue: { $avg: '$total' },
          totalItems: { $sum: '$totalItems' }
        }
      }
    ]);

    const totalCarts = await Cart.countDocuments();
    const abandonedCarts = await Cart.countDocuments({ 
      status: 'active', 
      totalItems: { $gt: 0 },
      updatedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 horas
    });

    res.json({
      success: true,
      data: {
        byStatus: stats,
        totalCarts,
        abandonedCarts,
        conversionRate: totalCarts > 0 ? 
          ((totalCarts - abandonedCarts) / totalCarts * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error getting cart stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del carrito',
      error: error.message
    });
  }
};

module.exports = {
  createCart,
  getCartById,
  addProductToCart,
  updateProductQuantity,
  removeProductFromCart,
  clearCart,
  getAllCarts,
  getCartByUserId,
  mergeGuestCart,
  getCartStats
};