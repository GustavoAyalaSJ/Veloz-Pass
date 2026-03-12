const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');

// Rate limiter para login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Muitas tentativas de login, tente novamente em 15 minutos'
});

router.post('/cadastro', authController.cadastro);
router.post('/login', loginLimiter, authController.login);

module.exports = router;
