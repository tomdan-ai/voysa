const moveParserService = require('./moveParserService');
const astGeneratorService = require('./astGeneratorService');
const vulnerabilityDetectorService = require('./vulnerabilityDetectorService');
const controlFlowService = require('./controlFlowService');
const dataFlowService = require('./dataFlowService');

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
      
      // 3. Detect vulnerabilities using pattern matching and AST analysis
      const vulnerabilities = vulnerabilityDetectorService.detectVulnerabilities(sourceCode, ast);
      
      // 4. Control flow analysis for functions
      const controlFlowGraphs = {};
      for (const func of ast.functions) {
        try {
          controlFlowGraphs[func.name] = controlFlowService.generateControlFlowGraph(ast, func.name);
        } catch (error) {
          console.warn(`Could not generate control flow graph for ${func.name}: ${error.message}`);
        }
      }
      
      // 5. Data flow analysis for selected functions
      const dataFlowAnalyses = {};
      for (const func of ast.functions.filter(f => f.isPublic || f.isEntry)) {
        try {
          dataFlowAnalyses[func.name] = dataFlowService.analyzeDataFlow(ast, func.name);
        } catch (error) {
          console.warn(`Could not perform data flow analysis for ${func.name}: ${error.message}`);
        }
      }
      
      return {
        ast,
        vulnerabilities,
        controlFlow: controlFlowGraphs,
        dataFlow: dataFlowAnalyses,
        sourceCode
      };
    } catch (error) {
      console.error('Error analyzing Move source:', error);
      throw new Error(`Failed to analyze Move source: ${error.message}`);
    }
  }
}

module.exports = new MoveAnalysisService();