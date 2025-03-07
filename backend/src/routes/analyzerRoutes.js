const express = require('express');
const { param, body } = require('express-validator');
const analyzerController = require('../controllers/analyzerController');

const router = express.Router();

// Get analysis for a token
router.get(
  '/token/:tokenAddress',
  [
    param('tokenAddress')
      .isString()
      .withMessage('Token address must be a string')
      .matches(/^0x[a-fA-F0-9]{40,64}$/)
      .withMessage('Invalid token address format'),
  ],
  analyzerController.getTokenAnalysis
);

// Submit token for analysis
router.post(
  '/analyze',
  [
    body('tokenAddress')
      .isString()
      .withMessage('Token address must be a string')
      .matches(/^0x[a-fA-F0-9]{40,64}$/)
      .withMessage('Invalid token address format'),
    body('address')
      .isString()
      .withMessage('Sender address must be a string')
      .matches(/^0x[a-fA-F0-9]{40,64}$/)
      .withMessage('Invalid sender address format'),
  ],
  analyzerController.analyzeToken
);

module.exports = router;