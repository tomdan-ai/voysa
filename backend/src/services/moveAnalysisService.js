const moveParserService = require('./moveParserService');
const astGeneratorService = require('./astGeneratorService');
const vulnerabilityDetectorService = require('./vulnerabilityDetectorService');
const tokenAnalyzerService = require('./tokenAnalyzerService');
const tokenSupplyService = require('./tokenSupplyService');
const ownershipAnalysisService = require('./ownershipAnalysisService');
const upgradeAnalysisService = require('./upgradeAnalysisService');

class MoveAnalysisService {
  /**
   * Analyze Move source code for security issues
   * @param {string} sourceCode - Move source code to analyze
   * @returns {Object} Complete analysis results
   */
  async analyzeSource(sourceCode) {
    try {
      console.log('Starting comprehensive Move source analysis...');
      
      // 1. Parse the source code
      const parsedCode = await moveParserService.parseSource(sourceCode);
      
      // 2. Generate AST
      const ast = astGeneratorService.generateAST(parsedCode);
      
      // 3. Detect general vulnerabilities using pattern matching and AST analysis
      const vulnerabilities = vulnerabilityDetectorService.detectVulnerabilities(sourceCode, ast);
      
      // 4. Perform token-specific analysis
      const tokenAnalysis = tokenAnalyzerService.analyzeToken(sourceCode, ast);
      
      // 5. Perform detailed analyses if this is a token contract
      let detailedTokenAnalysis = null;
      if (tokenAnalysis.isToken.isToken) {
        detailedTokenAnalysis = {
          supply: tokenSupplyService.analyzeSupplyMechanisms(sourceCode, ast),
          ownership: ownershipAnalysisService.analyzeOwnershipStructures(sourceCode, ast),
          treasury: ownershipAnalysisService.analyzeTreasuryOperations(sourceCode, ast),
          upgrade: upgradeAnalysisService.analyzeUpgradeCapabilities(sourceCode, ast)
        };
      }
      
      // 6. Consolidate all findings
      const allVulnerabilities = [
        ...vulnerabilities,
        ...tokenAnalysis.securityRisks
      ];
      
      if (detailedTokenAnalysis) {
        const tokenSpecificRisks = [
          ...detailedTokenAnalysis.supply.riskAssessment,
          ...detailedTokenAnalysis.ownership.riskAssessment,
          ...detailedTokenAnalysis.treasury.riskAssessment,
          ...detailedTokenAnalysis.upgrade.riskAssessment
        ];
        
        allVulnerabilities.push(...tokenSpecificRisks);
      }
      
      // 7. Generate security score
      const securityScore = this.calculateSecurityScore(allVulnerabilities);
      
      return {
        ast,
        vulnerabilities: allVulnerabilities,
        isToken: tokenAnalysis.isToken,
        tokenAnalysis: detailedTokenAnalysis,
        securityScore,
        sourceCode
      };
    } catch (error) {
      console.error('Error analyzing Move source:', error);
      throw new Error(`Failed to analyze Move source: ${error.message}`);
    }
  }
  
  /**
   * Calculate a security score based on vulnerabilities
   */
  calculateSecurityScore(vulnerabilities) {
    // Start with a perfect score
    let score = 100;
    
    // Count vulnerabilities by severity
    const criticalCount = vulnerabilities.filter(v => v.severity === 'Critical').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'High').length;
    const mediumCount = vulnerabilities.filter(v => v.severity === 'Medium').length;
    const lowCount = vulnerabilities.filter(v => v.severity === 'Low').length;
    
    // Deduct points based on severity
    score -= criticalCount * 20;  // -20 points per critical
    score -= highCount * 10;      // -10 points per high
    score -= mediumCount * 5;     // -5 points per medium
    score -= lowCount * 1;        // -1 point per low
    
    // Ensure score doesn't go below 0
    return Math.max(0, score);
  }
}

module.exports = new MoveAnalysisService();