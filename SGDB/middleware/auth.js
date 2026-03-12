const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ 
            error: 'Token de autenticação não fornecido',
            code: 'NO_TOKEN'
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expirou',
                code: 'TOKEN_EXPIRED'
            });
        }
        return res.status(403).json({ 
            error: 'Token inválido',
            code: 'INVALID_TOKEN'
        });
    }
};

module.exports = verificarToken;