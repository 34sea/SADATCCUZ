const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_sgpd_2026';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token não fornecido' 
    });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ 
      success: false, 
      error: 'Formato de token inválido. Use: Bearer <token>' 
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    return next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token inválido ou expirado' 
    });
  }
};