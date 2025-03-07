const suiService = require('../services/suiService');
const { validationResult } = require('express-validator');

// Get analysis for a token
async function getTokenAnalysis(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tokenAddress } = req.params;
    const analysis = await suiService.getTokenAnalysis(tokenAddress);
    
    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Error in getTokenAnalysis:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// Submit token for analysis
async function analyzeToken(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tokenAddress } = req.body;
    const { address: senderAddress } = req.body; // Sender's wallet address

    const result = await suiService.analyzeToken(tokenAddress, senderAddress);
    
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in analyzeToken:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  getTokenAnalysis,
  analyzeToken,
};