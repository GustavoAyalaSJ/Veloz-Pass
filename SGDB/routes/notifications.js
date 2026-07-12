const express = require('express');
const verificarToken = require('../middleware/auth');
const notificationsController = require('../controllers/notificationsController');

const router = express.Router();

router.get(
    '/:idUsuario',
    verificarToken,
    notificationsController.listarNotificacoes
);

router.get(
    '/:idUsuario/todas',
    verificarToken,
    notificationsController.listarTodasNotificacoes
);

router.get(
    '/:idUsuario/protocolo/:protocolo',
    verificarToken,
    notificationsController.buscarPorProtocolo
);

router.get(
    '/:idUsuario/notificacao/:idNotificacao',
    verificarToken,
    notificationsController.obterNotificacao
);

router.get(
    '/:idUsuario/contar',
    verificarToken,
    notificationsController.contarNotificacoes
);

router.post(
    '/',
    verificarToken,
    notificationsController.criarNotificacao
);

router.delete(
    '/:idNotificacao',
    verificarToken,
    notificationsController.deletarNotificacao
);

router.delete(
    '/:idUsuario/limpar-expiradas',
    verificarToken,
    notificationsController.limparNotificacoesExpiradas
);

module.exports = router;
