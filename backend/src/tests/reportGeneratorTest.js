const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const moveAnalysisService = require('../services/moveAnalysisService');
const reportGeneratorService = require('../services/reportGeneratorService');

// Path to a sample contract for testing
const contractPath = path.join(__dirname, '../../samples/token_contract.move');

/**
 * Test report generation for a Move contract
 */
async function runReportGenerationTest() {
  try {
    console.log(chalk.blue('===== REPORT GENERATOR TEST =====\n'));
    
    // Read the contract source code
    let sourceCode;
    try {
      sourceCode = fs.readFileSync(contractPath, 'utf-8');
      console.log(`Loaded contract: ${contractPath}`);
      console.log(`Contract size: ${sourceCode.length} bytes\n`);
    } catch (error) {
      console.log('Sample contract not found, using mock code');
      sourceCode = `
        module test::token {
            use sui::transfer;
            use sui::tx_context::{Self, TxContext};
            use sui::coin::{Self, Coin, TreasuryCap};
            use sui::object::{Self, UID};
            
            // Token struct without key ability
            struct TokenStore {
                id: UID,
                balance: u64
            }
            
            // Missing access control
            public entry fun mint(amount: u64, ctx: &mut TxContext) {
                // Mint tokens without admin check
            }
            
            // Arithmetic without overflow check
            public entry fun add_balance(store: &mut TokenStore, amount: u64) {
                store.balance = store.balance + amount;
            }
        }
      `;
    }
    
    console.log('Analyzing source code...');
    const analysisResults = await moveAnalysisService.analyzeSource(sourceCode);
    
    console.log(`\nAnalysis completed:`);
    console.log(`- Vulnerabilities found: ${analysisResults.vulnerabilities.length}`);
    console.log(`- Security score: ${analysisResults.securityScore}/100`);
    console.log(`- Token contract: ${analysisResults.isToken.isToken ? 'Yes' : 'No'}\n`);
    
    // Generate reports in different formats
    console.log('Generating reports in multiple formats...');
    
    // 1. JSON Report
    console.log(chalk.cyan('\nGenerating JSON report...'));
    const jsonReport = reportGeneratorService.generateReport(analysisResults, {
      format: 'json',
      includeVisuals: false
    });
    console.log('JSON report generated successfully');
    
    // Print a sample of the JSON structure
    const jsonSummary = { 
      summary: jsonReport.data.summary,
      vulnerabilityCount: jsonReport.data.vulnerabilities.total
    };
    console.log(chalk.gray('Report summary:'), JSON.stringify(jsonSummary, null, 2));
    
    // 2. HTML Report
    console.log(chalk.cyan('\nGenerating HTML report...'));
    const htmlReport = reportGeneratorService.generateReport(analysisResults, {
      format: 'html',
      includeVisuals: true
    });
    console.log('HTML report generated successfully');
    console.log(chalk.gray(`HTML report size: ${htmlReport.data.length} characters`));
    
    // 3. PDF Report (or placeholder)
    console.log(chalk.cyan('\nGenerating PDF report...'));
    const pdfReport = reportGeneratorService.generateReport(analysisResults, {
      format: 'pdf'
    });
    console.log('PDF report generation attempt completed');
    
    // 4. Save to file
    console.log(chalk.cyan('\nSaving reports to files...'));
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../../output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save JSON report
    const jsonPath = path.join(outputDir, 'report.json');
    const jsonData = JSON.stringify(jsonReport.data, null, 2);
    fs.writeFileSync(jsonPath, jsonData);
    console.log(`JSON report saved to: ${jsonPath}`);
    
    // Save HTML report
    const htmlPath = path.join(outputDir, 'report.html');
    fs.writeFileSync(htmlPath, htmlReport.data);
    console.log(`HTML report saved to: ${htmlPath}`);
    
    console.log(chalk.green('\n✓ Report generation test completed successfully!'));
    console.log(chalk.blue('\n===== END OF REPORT GENERATOR TEST ====='));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Report generation test failed:'), error);
    throw error;
  }
}

// Run the test
runReportGenerationTest().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});