// ===== backend/controllers/userController.js =====
const getAllUsers = (req, res) => {
  res.json({
    success: true,
    message: 'Lista de usuarios (placeholder)',
    data: []
  });
};

const getUserById = (req, res) => {
  res.json({
    success: true,
    message: 'Usuario por ID (placeholder)',
    data: { id: req.params.id, name: 'Usuario Test' }
  });
};

const updateUser = (req, res) => {
  res.json({
    success: true,
    message: 'Usuario actualizado (placeholder)'
  });
};

const deleteUser = (req, res) => {
  res.json({
    success: true,
    message: 'Usuario eliminado (placeholder)'
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};
