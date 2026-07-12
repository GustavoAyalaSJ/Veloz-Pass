const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verificarToken = require('../middleware/auth');

router.post('/login', authController.login);

router.post('/register', authController.cadastro);

router.get('/:userId', verificarToken, authController.obterUsuario);

router.put('/:userId', verificarToken, authController.atualizarPerfil);

module.exports = router;