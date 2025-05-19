const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const moveAnalysisService = require('../services/moveAnalysisService');
const reportGeneratorService = require('../services/reportGeneratorService');
const suiService = require('../services/suiService');

// Generate report for a smart contract
async function generateReport(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contractAddress, format = 'json', includeVisuals = true } = req.body;
    
    // Get analysis results - either from source code or from token address
    let analysisResults;
    
    if (req.body.sourceCode) {
      // Analyze source code directly
      analysisResults = await moveAnalysisService.analyzeSource(req.body.sourceCode);
    } else if (contractAddress) {
      // Get analysis for a specific token
      analysisResults = await suiService.getTokenAnalysis(contractAddress);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either source code or contract address must be provided',
      });
    }
    
    // Generate the report
    const reportOptions = {
      format,
      includeVisuals,
      includeSolutions: req.body.includeSolutions !== false,
      includeCodeSnippets: req.body.includeCodeSnippets !== false,
    };
    
    const report = reportGeneratorService.generateReport(analysisResults, reportOptions);
    
    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// Save a report to file
async function saveReport(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contractAddress, format = 'html', outputPath } = req.body;
    
    if (!outputPath) {
      return res.status(400).json({
        success: false,
        error: 'Output path is required',
      });
    }
    
    // Get analysis results
    let analysisResults;
    
    if (req.body.sourceCode) {
      // Analyze source code directly
      analysisResults = await moveAnalysisService.analyzeSource(req.body.sourceCode);
    } else if (contractAddress) {
      // Get analysis for a specific token
      analysisResults = await suiService.getTokenAnalysis(contractAddress);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either source code or contract address must be provided',
      });
    }
    
    // Generate and save the report
    const reportOptions = {
      format,
      includeVisuals: true,
      includeSolutions: true,
      includeCodeSnippets: true,
      outputPath,
    };
    
    reportGeneratorService.generateReport(analysisResults, reportOptions);
    
    return res.status(200).json({
      success: true,
      message: `Report saved to ${outputPath}`,
    });
  } catch (error) {
    console.error('Error saving report:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// Get available report formats
function getReportFormats(req, res) {
  return res.status(200).json({
    success: true,
    formats: [
      {
        id: 'json',
        name: 'JSON',
        description: 'Machine-readable JSON format'
      },
      {
        id: 'html',
        name: 'HTML',
        description: 'Human-readable HTML report with visualizations'
      },
      {
        id: 'pdf',
        name: 'PDF',
        description: 'Portable document format (PDF) for sharing or printing'
      }
    ]
  });
}

module.exports = {
  generateReport,
  saveReport,
  getReportFormats
};