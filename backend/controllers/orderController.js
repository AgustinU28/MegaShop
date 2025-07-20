// ===== backend/controllers/orderController.js =====
const getAllOrders = (req, res) => {
  res.json({
    success: true,
    message: 'Órdenes del usuario (placeholder)',
    data: []
  });
};

const getOrderById = (req, res) => {
  res.json({
    success: true,
    message: 'Orden por ID (placeholder)',
    data: { id: req.params.id, status: 'pending' }
  });
};

const createOrder = (req, res) => {
  res.json({
    success: false,
    message: 'Creación de órdenes no implementada aún'
  });
};

const updateOrder = (req, res) => {
  res.json({
    success: true,
    message: 'Orden actualizada (placeholder)'
  });
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder
};