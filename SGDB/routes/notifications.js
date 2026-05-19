const express = require('express');
const verificarToken = require('../middleware/auth');
const notificationsController = require('../controllers/notificationsController');

const router = express.Router();

router.get(
    '/notifications/:idUsuario',
    verificarToken,
    notificationsController.listarNotificacoes
);

module.exports = router;
