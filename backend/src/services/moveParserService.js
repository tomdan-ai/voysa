const fs = require('fs');
const path = require('path');

class MoveParserService {
  /**
   * Parse Move source code to an internal representation
   * @param {string} sourceCode - Move source code to parse
   * @returns {Object} Parsed representation of the code
   */
  async parseSource(sourceCode) {
    try {
      console.log('Parsing Move source code...');
      
      // Simple regex-based parser
      // This is a basic implementation - a production version would need a more robust parser
      
      // Extract module name and address
      const moduleMatch = sourceCode.match(/module\s+([a-zA-Z0-9_]+)::([a-zA-Z0-9_]+)/);
      const moduleName = moduleMatch ? moduleMatch[2] : 'unknown';
      const moduleAddress = moduleMatch ? moduleMatch[1] : 'unknown';
      
      // Extract structs
      const structs = [];
      const structRegex = /struct\s+([a-zA-Z0-9_]+)(?:\s+has\s+([a-zA-Z0-9_, ]+))?\s*{([^}]*)}/g;
      let structMatch;
      while ((structMatch = structRegex.exec(sourceCode)) !== null) {
        const name = structMatch[1];
        const abilities = structMatch[2] ? structMatch[2].split(',').map(a => a.trim()) : [];
        const fieldsText = structMatch[3];
        
        const fields = [];
        const fieldRegex = /([a-zA-Z0-9_]+):\s*([a-zA-Z0-9_<>, ]+)/g;
        let fieldMatch;
        while ((fieldMatch = fieldRegex.exec(fieldsText)) !== null) {
          fields.push({
            name: fieldMatch[1],
            type: fieldMatch[2].trim()
          });
        }
        
        structs.push({ name, abilities, fields });
      }
      
      // Extract functions
      const functions = [];
      const functionRegex = /(?:public\s+)?(entry\s+)?fun\s+([a-zA-Z0-9_]+)\s*<([^>]*)>?\s*\(([^)]*)\)(?:\s*:\s*([a-zA-Z0-9_<>, ]*))?/g;
      let functionMatch;
      while ((functionMatch = functionRegex.exec(sourceCode)) !== null) {
        const isEntry = !!functionMatch[1];
        const name = functionMatch[2];
        const typeParams = functionMatch[3] ? functionMatch[3].split(',').map(t => t.trim()) : [];
        
        const paramsText = functionMatch[4];
        const params = [];
        const paramRegex = /([a-zA-Z0-9_]+):\s*([a-zA-Z0-9_<>, &mut]+)/g;
        let paramMatch;
        while ((paramMatch = paramRegex.exec(paramsText)) !== null) {
          params.push({
            name: paramMatch[1],
            type: paramMatch[2].trim()
          });
        }
        
        const returnType = functionMatch[5] ? functionMatch[5].trim() : null;
        
        functions.push({ 
          name, 
          isPublic: sourceCode.includes(`public fun ${name}`),
          isEntry, 
          typeParams, 
          params, 
          returnType 
        });
      }
      
      // Extract constants
      const constants = [];
      const constRegex = /const\s+([A-Z_][A-Z0-9_]*):\s*([a-zA-Z0-9_]+)\s*=\s*([^;]+);/g;
      let constMatch;
      while ((constMatch = constRegex.exec(sourceCode)) !== null) {
        constants.push({
          name: constMatch[1],
          type: constMatch[2],
          value: constMatch[3].trim()
        });
      }
      
      // Return the parsed representation
      return {
        modules: [{
          name: moduleName,
          address: moduleAddress,
          structs,
          functions,
          constants
        }]
      };
    } catch (error) {
      console.error('Error parsing Move source code:', error);
      throw new Error(`Failed to parse Move source: ${error.message}`);
    }
  }
}

module.exports = new MoveParserService();