const express = require('express');
const { body } = require('express-validator');
const analyzerController = require('../controllers/analyzerController');
const reportController = require('../controllers/reportController');

const router = express.Router();

// Analyzer routes
router.post(
  '/analyze',
  [body('sourceCode').notEmpty().withMessage('Source code is required')],
  analyzerController.analyzeSource
);

router.post(
  '/analyze-token',
  [body('tokenAddress').notEmpty().withMessage('Token address is required')],
  analyzerController.analyzeToken
);

// Report routes
router.post(
  '/generate-report',
  [
    body('contractAddress').optional(),
    body('sourceCode').optional(),
    body('format').isIn(['json', 'html', 'pdf']).withMessage('Invalid format'),
  ],
  reportController.generateReport
);

router.post(
  '/save-report',
  [
    body('contractAddress').optional(),
    body('sourceCode').optional(),
    body('format').isIn(['json', 'html', 'pdf']).withMessage('Invalid format'),
    body('outputPath').notEmpty().withMessage('Output path is required'),
  ],
  reportController.saveReport
);

router.get('/report-formats', reportController.getReportFormats);

module.exports = router;