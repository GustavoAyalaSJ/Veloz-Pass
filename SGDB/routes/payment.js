const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');
const { validateTransfer } = require('../validators/paymentValidator');

router.get('/wallet-data/:idUsuario',
    verificarToken,
    paymentController.getWalletData
);

router.post('/add-credit',
    verificarToken,
    validateTransfer,
    paymentController.processCredit
);

router.post('/recarga-transporte',
    verificarToken,
    paymentController.processRecargaTransporte
);

module.exports = router;