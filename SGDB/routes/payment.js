const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');
const { validateTransfer, validateRecargaTransporte } = require('../public/pages/src/utils/paymentValidator');


router.get('/carteira-saldo/:idUsuario',
    verificarToken,
    paymentController.getCarteiraSaldo
);

router.get('/wallet-data/:idUsuario',
    verificarToken,
    paymentController.getWalletData
);

router.get('/historico-geral/:idUsuario',
    verificarToken,
    paymentController.getHistoricoGeral
);

router.get('/historico-tipo/:idUsuario',
    verificarToken,
    paymentController.getHistoricoByTipo
);

router.get('/movimentacoes/:idUsuario',
    verificarToken,
    paymentController.listarMovimentacoes
);

router.get('/movimento/:protocolo',
    verificarToken,
    paymentController.getMovimento
);

router.get('/check-status/:protocolo',
    verificarToken,
    paymentController.checkStatus
);

router.post('/add-credit',
    verificarToken,
    validateTransfer,
    paymentController.processCredit
);

router.post('/recarga-transporte',
    verificarToken,
    validateRecargaTransporte,
    paymentController.processRecargaTransporte
);

module.exports = router;