const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.get('/wallet-data/:idUsuario', 
    verificarToken,
    paymentController.getWalletData
);

router.post('/add-credit', 
    verificarToken,
    paymentController.processCredit
);

module.exports = router;