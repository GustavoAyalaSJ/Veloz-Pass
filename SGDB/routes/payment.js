const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');
const { validateTransfer, validateRecargaTransporte } = require('../validators/paymentValidator');

router.get('/wallet-data/:idUsuario',
    verificarToken,
    paymentController.getWalletData
);

router.get('/historico-geral/:idUsuario',
    verificarToken,
    paymentController.getHistoricoGeral
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

router.post('/save-card',
    verificarToken,
    paymentController.saveCard
);

router.get('/user-cards/:idUsuario',
    verificarToken,
    paymentController.getUserCards
);

router.post('/verify-card',
    verificarToken,
    paymentController.verifyCard
);

module.exports = router;