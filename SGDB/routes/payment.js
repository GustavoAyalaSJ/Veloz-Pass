const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/wallet-data/:idUsuario', paymentController.getWalletData);
router.post('/add-credit', paymentController.processCredit);

module.exports = router;