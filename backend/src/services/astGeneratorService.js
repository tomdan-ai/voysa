class ASTGeneratorService {
  /**
   * Generate a structured AST from parsed Move code
   * @param {Object} parsedCode - Output from the Move parser
   * @returns {Object} Enhanced AST with additional analysis information
   */
  generateAST(parsedCode) {
    // Create a more structured and enhanced AST
    const ast = {
      modules: [],
      types: [],
      functions: [],
      resources: [],
      relationships: []
    };

    try {
      // Process each module from the parsed code
      for (const module of parsedCode.modules) {
        const moduleNode = {
          name: module.name,
          address: module.address,
          fullName: `${module.address}::${module.name}`,
          structs: module.structs || [],
          functions: module.functions || [],
          constants: module.constants || []
        };
        
        ast.modules.push(moduleNode);
        
        // Process structs into types and resources
        for (const struct of module.structs || []) {
          const typeNode = {
            name: struct.name,
            module: module.name,
            fullName: `${module.address}::${module.name}::${struct.name}`,
            abilities: struct.abilities || [],
            fields: struct.fields || [],
            isResource: (struct.abilities || []).includes('key')
          };
          
          ast.types.push(typeNode);
          
          if (typeNode.isResource) {
            ast.resources.push(typeNode);
          }
        }
        
        // Process functions
        for (const func of module.functions || []) {
          const funcNode = {
            name: func.name,
            module: module.name,
            fullName: `${module.address}::${module.name}::${func.name}`,
            isPublic: func.isPublic,
            isEntry: func.isEntry,
            params: func.params || [],
            returnType: func.returnType,
            typeParams: func.typeParams || []
          };
          
          ast.functions.push(funcNode);
        }
      }
      
      // Build relationships
      ast.relationships = this.buildRelationships(ast);
      
      return ast;
    } catch (error) {
      console.error('Error generating AST:', error);
      throw new Error(`Failed to generate AST: ${error.message}`);
    }
  }
  
  // Build relationships between components (function calls, type usage, etc.)
  buildRelationships(ast) {
    const relationships = [];
    
    // For a simple implementation, we'll just identify which functions use which types
    for (const func of ast.functions) {
      // Check params
      for (const param of func.params) {
        for (const type of ast.types) {
          if (param.type.includes(type.name)) {
            relationships.push({
              from: func.fullName,
              to: type.fullName,
              type: 'uses'
            });
          }
        }
      }
      
      // Check return type
      if (func.returnType) {
        for (const type of ast.types) {
          if (func.returnType.includes(type.name)) {
            relationships.push({
              from: func.fullName,
              to: type.fullName,
              type: 'returns'
            });
          }
        }
      }
    }
    
    return relationships;
  }
}

module.exports = new ASTGeneratorService();