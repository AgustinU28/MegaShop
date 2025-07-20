// ===== backend/config/jwt.js =====
const jwt = require('jsonwebtoken');

// Configuración JWT
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
  expiresIn: process.env.JWT_EXPIRE || '30d',
  issuer: 'UriShop',
  audience: 'UriShop-Users'
};

// Generar token JWT
const generateToken = (payload) => {
  try {
    const token = jwt.sign(
      payload,
      JWT_CONFIG.secret,
      {
        expiresIn: JWT_CONFIG.expiresIn,
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience
      }
    );
    
    return {
      success: true,
      token
    };
  } catch (error) {
    console.error('Error generating JWT token:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verificar token JWT
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    });
    
    return {
      success: true,
      decoded
    };
  } catch (error) {
    let message = 'Token inválido';
    
    if (error.name === 'TokenExpiredError') {
      message = 'Token expirado';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token malformado';
    } else if (error.name === 'NotBeforeError') {
      message = 'Token no activo aún';
    }
    
    return {
      success: false,
      error: message,
      code: error.name
    };
  }
};

// Decodificar token sin verificar (útil para obtener info del payload)
const decodeToken = (token) => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    return {
      success: true,
      decoded
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Generar token de refresh
const generateRefreshToken = (payload) => {
  try {
    const token = jwt.sign(
      payload,
      JWT_CONFIG.secret,
      {
        expiresIn: '7d', // Los refresh tokens duran más
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience
      }
    );
    
    return {
      success: true,
      refreshToken: token
    };
  } catch (error) {
    console.error('Error generating refresh token:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generar ambos tokens (access + refresh)
const generateTokenPair = (payload) => {
  try {
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);
    
    if (!accessToken.success || !refreshToken.success) {
      throw new Error('Error generando tokens');
    }
    
    return {
      success: true,
      accessToken: accessToken.token,
      refreshToken: refreshToken.refreshToken,
      expiresIn: JWT_CONFIG.expiresIn
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Extraer token del header Authorization
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

// Middleware para verificar autenticación
const authenticateToken = (req, res, next) => {
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acceso requerido'
    });
  }
  
  const verification = verifyToken(token);
  
  if (!verification.success) {
    return res.status(401).json({
      success: false,
      message: verification.error
    });
  }
  
  req.user = verification.decoded;
  next();
};

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = (req, res, next) => {
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (token) {
    const verification = verifyToken(token);
    if (verification.success) {
      req.user = verification.decoded;
    }
  }
  
  next();
};

module.exports = {
  JWT_CONFIG,
  generateToken,
  verifyToken,
  decodeToken,
  generateRefreshToken,
  generateTokenPair,
  extractTokenFromHeader,
  authenticateToken,
  optionalAuth
};
