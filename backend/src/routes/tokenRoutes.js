const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');

router.get('/', tokenController.getAllTokens);
router.get('/:id', tokenController.getTokenById);
router.post('/launch', tokenController.emitTokenLaunch); // Add this line

module.exports = router;