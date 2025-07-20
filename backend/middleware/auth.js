// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware de autenticación
const auth = async (req, res, next) => {
  try {
    let token;

    // Verificar si el token viene en el header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        // Extraer token del header
        token = req.headers.authorization.split(' ')[1];
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Token malformado'
        });
      }
    }

    // Verificar si no hay token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado, token requerido'
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Obtener usuario del token
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Cuenta desactivada'
        });
      }

      // Agregar usuario a req object
      req.user = user;
      next();

    } catch (error) {
      console.error('JWT Error:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor en autenticación'
    });
  }
};

// Middleware para verificar rol de administrador
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador'
    });
  }
};

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id);
          
          if (user && user.isActive) {
            req.user = user;
          }
        } catch (error) {
          // Si hay error en el token, continuar sin usuario
          console.log('Optional auth error:', error.message);
        }
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Middleware para verificar ownership (el usuario puede acceder solo a sus datos)
const checkOwnership = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  // Admin puede acceder a todo
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Usuario solo puede acceder a sus propios recursos
  if (req.user.id.toString() === resourceUserId.toString()) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Acceso denegado. No puedes acceder a este recurso'
  });
};

module.exports = {
  auth,
  adminAuth,
  optionalAuth,
  checkOwnership
};