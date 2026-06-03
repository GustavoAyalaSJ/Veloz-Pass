const express = require('express');
const verificarToken = require('../middleware/auth');
const notificationsController = require('../controllers/notificationsController');

const router = express.Router();

router.get(
    '/:idUsuario',
    verificarToken,
    notificationsController.listarNotificacoes
);

router.post(
    '/',
    verificarToken,
    notificationsController.criarNotificacao
);

module.exports = router;
