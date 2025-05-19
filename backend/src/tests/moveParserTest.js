const moveParserService = require('../services/moveParserService');
const astGeneratorService = require('../services/astGeneratorService');
const moveAnalysisService = require('../services/moveAnalysisService');
const fs = require('fs');
const path = require('path');

// Path to the Move contract we want to test
const contractPath = path.join(__dirname, '../../../contract/sources/degen_sniffer.move');

async function runTest() {
  try {
    console.log('Running Move Parser test with our custom implementation...\n');
    
    // Read the contract source code
    const sourceCode = fs.readFileSync(contractPath, 'utf-8');
    console.log(`Loaded contract: ${contractPath}`);
    console.log(`Contract size: ${sourceCode.length} bytes\n`);
    
    // 1. Test the parser
    console.log('1. Testing Move Parser...');
    const parsedCode = await moveParserService.parseSource(sourceCode);
    console.log('Parsing successful!');
    
    // Log basic statistics about the parsed code
    const moduleCount = parsedCode.modules.length;
    const module = parsedCode.modules[0];
    console.log(`Found ${moduleCount} module(s)`);
    console.log(`Module name: ${module.name}`);
    console.log(`Module address: ${module.address}`);
    console.log(`Structs: ${module.structs.length}`);
    console.log(`Functions: ${module.functions.length}`);
    console.log(`Constants: ${module.constants.length}\n`);
    
    // 2. Test the AST generator
    console.log('2. Testing AST Generator...');
    const ast = astGeneratorService.generateAST(parsedCode);
    console.log('AST generation successful!');
    
    // Log a summary of the AST
    console.log(`Modules found: ${ast.modules.length}`);
    console.log(`Types found: ${ast.types.length}`);
    console.log(`Functions found: ${ast.functions.length}`);
    console.log(`Resources found: ${ast.resources.length}`);
    console.log(`Relationships found: ${ast.relationships.length}\n`);
    
    // 3. Test full analysis
    console.log('3. Testing full analysis pipeline...');
    const fullAnalysis = await moveAnalysisService.analyzeSource(sourceCode);
    console.log('Full analysis successful!');
    
    // Display security findings
    if (fullAnalysis.bytecodeAnalysis && fullAnalysis.bytecodeAnalysis.vulnerabilities) {
      const vulnerabilities = fullAnalysis.bytecodeAnalysis.vulnerabilities;
      console.log(`\nVulnerabilities detected: ${vulnerabilities.length}`);
      
      vulnerabilities.forEach((vuln, index) => {
        console.log(`\n[${index + 1}] ${vuln.title} (Severity: ${vuln.severity})`);
        console.log(`Description: ${vuln.description}`);
        console.log(`Location: ${vuln.location}`);
        console.log(`Recommendation: ${vuln.recommendation}`);
      });
    } else {
      console.log('\nNo vulnerabilities detected in initial scan');
    }
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

runTest();