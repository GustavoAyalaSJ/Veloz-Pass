const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');
const { criarTransfer } = require('../validators/paymentValidator');

router.get('/wallet-data/:idUsuario', 
    verificarToken,
    paymentController.getWalletData
);

router.post('/add-credit', 
    verificarToken,
    criarTransfer,
    paymentController.processCredit
);

module.exports = router;