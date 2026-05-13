const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.cadastro);
router.post('/login', authController.login);
/*router.patch('/password', authController.updatePasswordPatch);*/

module.exports = router;