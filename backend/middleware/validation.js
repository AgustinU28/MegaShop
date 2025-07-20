// ===== Para middleware/validation.js =====
// backend/middleware/validation.js
const { body, validationResult } = require('express-validator');

// Middleware para validar resultados
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

// Validaciones básicas
const validateProduct = [
  body('title').trim().isLength({ min: 1 }).withMessage('Título es requerido'),
  body('price').isNumeric().withMessage('Precio debe ser numérico'),
  handleValidationErrors
];

const validateUser = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateProduct,
  validateUser
};