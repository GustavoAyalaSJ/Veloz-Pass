const jwt = require('jsonwebtoken');

const tokenCache = new Map();

setInterval(() => {
    const agora = Date.now();
    for (const [token, cached] of tokenCache.entries()) {
        if (cached.expiresAt < agora) {
            tokenCache.delete(token);
        }
    }
}, 10 * 60 * 1000);

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
        if (tokenCache.has(token)) {
            const cached = tokenCache.get(token);
            if (cached.expiresAt > Date.now()) {
                req.userId = cached.id;
                req.userEmail = cached.email;
                return next();
            } else {
                tokenCache.delete(token);
            }
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.userId = decoded.id;
        req.userEmail = decoded.email;

        tokenCache.set(token, {
            id: decoded.id,
            email: decoded.email,
            expiresAt: decoded.exp * 1000
        });
        
        next();
    } catch (err) {
        tokenCache.delete(token);
        
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