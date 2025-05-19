const fs = require('fs');
const path = require('path');

class TokenAnalyzerService {
  /**
   * Analyze token-specific security concerns in a Move contract
   * @param {string} sourceCode - Move source code to analyze
   * @param {Object} ast - AST representation of the code
   * @returns {Object} Token-specific analysis results
   */
  analyzeToken(sourceCode, ast) {
    console.log('Performing token-specific analysis...');

    const analysis = {
      isToken: this.isTokenContract(sourceCode, ast),
      supplyAnalysis: this.analyzeSupply(sourceCode, ast),
      ownershipAnalysis: this.analyzeOwnership(sourceCode, ast),
      upgradeAnalysis: this.analyzeUpgradeCapabilities(sourceCode, ast),
      treasuryAnalysis: this.analyzeTreasuryOperations(sourceCode, ast),
      securityRisks: []
    };

    // Consolidate security risks
    analysis.securityRisks = [
      ...this.detectSupplyRisks(analysis.supplyAnalysis),
      ...this.detectOwnershipRisks(analysis.ownershipAnalysis),
      ...this.detectUpgradeRisks(analysis.upgradeAnalysis),
      ...this.detectTreasuryRisks(analysis.treasuryAnalysis)
    ];

    return analysis;
  }

  /**
   * Determine if the contract is a token implementation
   */
  isTokenContract(sourceCode, ast) {
    // Check if it's using Sui coin module
    const usesCoinModule = sourceCode.includes('sui::coin') || 
                          sourceCode.includes('::coin::');
    
    // Check if it has coin-related structs
    const hasTokenStructs = ast.types.some(type => 
      type.name.toLowerCase().includes('coin') || 
      type.name.toLowerCase().includes('token') || 
      type.name.toLowerCase().includes('treasury')
    );

    // Check for coin operations
    const hasMintFunctions = sourceCode.includes('mint') ||
                            sourceCode.includes('::coin::create');
    
    const hasBurnFunctions = sourceCode.includes('burn') ||
                            sourceCode.includes('::coin::burn');

    // Evaluate if this is likely a token contract
    const isToken = usesCoinModule || 
                   (hasTokenStructs && (hasMintFunctions || hasBurnFunctions));
    
    return {
      isToken,
      usesCoinModule,
      hasTokenStructs,
      hasMintFunctions,
      hasBurnFunctions
    };
  }

  /**
   * Analyze token supply management
   */
  analyzeSupply(sourceCode, ast) {
    const supplyAnalysis = {
      hasFixedSupply: !sourceCode.includes('mint'),
      hasBurnFunction: sourceCode.includes('burn'),
      hasSupplyCap: sourceCode.includes('supply::create_supply') || sourceCode.includes('SupplyCap'),
      maxSupply: this.extractMaxSupply(sourceCode),
      initialSupply: this.extractInitialSupply(sourceCode),
      mintableByOwner: sourceCode.includes('mint') && (sourceCode.includes('&SupplyCap') || sourceCode.includes('&mut TreasuryCap')),
      hasPauseControl: sourceCode.includes('pause') || sourceCode.includes('frozen')
    };

    return supplyAnalysis;
  }

  /**
   * Extract maximum supply cap if defined
   */
  extractMaxSupply(sourceCode) {
    // Try to find a MAX_SUPPLY constant or similar
    const maxSupplyRegex = /(?:const|let)\s+(?:MAX_SUPPLY|MAX_CAP|TOTAL_SUPPLY|CAP)\s*(?::\s*u\d+)?\s*=\s*(\d+)/i;
    const match = sourceCode.match(maxSupplyRegex);
    
    if (match) {
      return match[1];
    }
    
    return null;
  }

  /**
   * Extract initial supply if defined
   */
  extractInitialSupply(sourceCode) {
    // Try to find an INITIAL_SUPPLY constant or similar
    const initialSupplyRegex = /(?:const|let)\s+(?:INITIAL_SUPPLY|INIT_SUPPLY)\s*(?::\s*u\d+)?\s*=\s*(\d+)/i;
    const match = sourceCode.match(initialSupplyRegex);
    
    if (match) {
      return match[1];
    }
    
    return null;
  }

  /**
   * Analyze ownership structures
   */
  analyzeOwnership(sourceCode, ast) {
    // Look for ownership-related structs and functions
    const ownershipStructs = ast.types.filter(type => 
      type.name.includes('Admin') || 
      type.name.includes('Owner') || 
      type.name.includes('Cap') ||
      type.name.includes('Authority')
    );

    // Look for transfer ownership functions
    const hasOwnershipTransfer = sourceCode.includes('transfer_ownership') || 
                               sourceCode.match(/transfer\s*\(\s*\w+\s*,\s*\w+\s*\)/g) !== null;
    
    // Check if ownership can be renounced
    const hasRenounceOwnership = sourceCode.includes('renounce_ownership') || 
                               sourceCode.includes('burn_cap');

    // Detect if admin operations are protected
    const hasAdminOperations = ast.functions.some(func => 
      func.params.some(param => 
        param.type.includes('Admin') || 
        param.type.includes('Cap')
      )
    );

    return {
      ownershipStructs: ownershipStructs.map(s => s.name),
      hasOwnershipTransfer,
      hasRenounceOwnership,
      hasAdminOperations,
      hasMultiSig: sourceCode.includes('multi_sig') || sourceCode.includes('MultiSig'),
      hasTimelock: sourceCode.includes('timelock') || sourceCode.includes('TimeLock')
    };
  }

  /**
   * Analyze upgrade capabilities
   */
  analyzeUpgradeCapabilities(sourceCode, ast) {
    // Look for upgrade-related patterns
    const isUpgradeable = sourceCode.includes('upgrade') || 
                        sourceCode.includes('::package::');
    
    // Check for specific upgrade patterns in Sui
    const hasSuiUpgradeCapability = sourceCode.includes('sui::package') || 
                                  sourceCode.includes('UpgradeCap');
    
    // Check for authority over upgrades
    const upgradeRequiresAdmin = isUpgradeable && sourceCode.match(/upgrade.*(&Admin|&Cap)/) !== null;

    // Check for upgrade policy restrictions
    const hasUpgradePolicy = sourceCode.includes('upgrade_policy');

    return {
      isUpgradeable,
      hasSuiUpgradeCapability,
      upgradeRequiresAdmin,
      hasUpgradePolicy,
      hasCommitteeApproval: sourceCode.includes('committee') && sourceCode.includes('approve'),
      upgradeTimelock: sourceCode.includes('timelock') && sourceCode.includes('upgrade')
    };
  }

  /**
   * Analyze treasury operations
   */
  analyzeTreasuryOperations(sourceCode, ast) {
    // Look for treasury-related patterns
    const hasTreasury = sourceCode.includes('Treasury') || 
                      sourceCode.includes('DAO') ||
                      sourceCode.includes('Fund');
    
    // Check for fee collection
    const hasFees = sourceCode.includes('fee') || 
                  sourceCode.includes('tax') ||
                  sourceCode.includes('royalty');
    
    // Check for fee limits
    const hasFeeLimit = sourceCode.match(/(?:fee|tax).*?(?:limit|max|cap)/i) !== null;

    return {
      hasTreasury,
      hasFees,
      hasFeeLimit,
      hasWithdrawFunction: sourceCode.includes('withdraw'),
      hasDistributeFunction: sourceCode.includes('distribute') || sourceCode.includes('dividends'),
      treasuryProtected: hasTreasury && sourceCode.match(/(?:treasury|fund).*?(&Admin|&Cap)/) !== null,
      hasTreasuryTimelock: sourceCode.includes('treasury') && sourceCode.includes('timelock')
    };
  }

  /**
   * Detect supply-related security risks
   */
  detectSupplyRisks(supplyAnalysis) {
    const risks = [];
    
    if (!supplyAnalysis.hasFixedSupply && !supplyAnalysis.hasSupplyCap) {
      risks.push({
        id: "SUI-TOKEN-001",
        title: "Uncapped Token Supply",
        description: "Token supply can be increased without a maximum cap",
        severity: "High",
        category: "Supply",
        recommendation: "Implement a supply cap or limit minting capabilities"
      });
    }
    
    if (supplyAnalysis.mintableByOwner) {
      risks.push({
        id: "SUI-TOKEN-002",
        title: "Centralized Minting Control",
        description: "Token supply can be increased by owner without restrictions",
        severity: "Medium",
        category: "Supply",
        recommendation: "Add time-locks or governance approval for minting operations"
      });
    }
    
    if (!supplyAnalysis.hasBurnFunction && !supplyAnalysis.hasFixedSupply) {
      risks.push({
        id: "SUI-TOKEN-003",
        title: "No Burn Capability",
        description: "Token lacks burn capability which may affect tokenomics",
        severity: "Low",
        category: "Supply",
        recommendation: "Consider adding burn functionality for supply management"
      });
    }
    
    return risks;
  }

  /**
   * Detect ownership-related security risks
   */
  detectOwnershipRisks(ownershipAnalysis) {
    const risks = [];
    
    if (ownershipAnalysis.hasAdminOperations && !ownershipAnalysis.hasMultiSig) {
      risks.push({
        id: "SUI-TOKEN-004",
        title: "Centralized Admin Control",
        description: "Critical admin functions controlled by a single account",
        severity: "Medium",
        category: "Ownership",
        recommendation: "Implement multi-signature control or DAO governance"
      });
    }
    
    if (!ownershipAnalysis.hasRenounceOwnership) {
      risks.push({
        id: "SUI-TOKEN-005",
        title: "Ownership Not Renounceable",
        description: "Contract ownership cannot be renounced or transferred to a burn address",
        severity: "Low",
        category: "Ownership",
        recommendation: "Add capability to renounce ownership for future immutability"
      });
    }
    
    if (!ownershipAnalysis.hasTimelock && ownershipAnalysis.hasAdminOperations) {
      risks.push({
        id: "SUI-TOKEN-006",
        title: "No Timelock on Admin Actions",
        description: "Admin actions can be executed immediately without delay",
        severity: "Medium",
        category: "Ownership",
        recommendation: "Implement timelock mechanism for critical admin functions"
      });
    }
    
    return risks;
  }

  /**
   * Detect upgrade-related security risks
   */
  detectUpgradeRisks(upgradeAnalysis) {
    const risks = [];
    
    if (upgradeAnalysis.isUpgradeable && !upgradeAnalysis.upgradeRequiresAdmin) {
      risks.push({
        id: "SUI-TOKEN-007",
        title: "Unrestricted Upgrade Capability",
        description: "Contract can be upgraded without proper access control",
        severity: "Critical",
        category: "Upgradeability",
        recommendation: "Add robust access controls to upgrade functions"
      });
    }
    
    if (upgradeAnalysis.isUpgradeable && !upgradeAnalysis.hasUpgradePolicy) {
      risks.push({
        id: "SUI-TOKEN-008",
        title: "Missing Upgrade Policy",
        description: "Contract lacks formal upgrade policy or restrictions",
        severity: "Medium",
        category: "Upgradeability",
        recommendation: "Define and enforce upgrade policies using Sui package::upgrade_policy"
      });
    }
    
    if (upgradeAnalysis.isUpgradeable && !upgradeAnalysis.upgradeTimelock) {
      risks.push({
        id: "SUI-TOKEN-009",
        title: "No Upgrade Timelock",
        description: "Upgrades can be applied immediately without delay",
        severity: "Medium",
        category: "Upgradeability",
        recommendation: "Implement timelock for upgrades to allow users to react"
      });
    }
    
    return risks;
  }

  /**
   * Detect treasury-related security risks
   */
  detectTreasuryRisks(treasuryAnalysis) {
    const risks = [];
    
    if (treasuryAnalysis.hasTreasury && !treasuryAnalysis.treasuryProtected) {
      risks.push({
        id: "SUI-TOKEN-010",
        title: "Unprotected Treasury",
        description: "Treasury functions lack proper access controls",
        severity: "Critical",
        category: "Treasury",
        recommendation: "Implement strong access controls for treasury operations"
      });
    }
    
    if (treasuryAnalysis.hasFees && !treasuryAnalysis.hasFeeLimit) {
      risks.push({
        id: "SUI-TOKEN-011",
        title: "Uncapped Fee Structure",
        description: "Fees can be set without upper limits",
        severity: "Medium",
        category: "Treasury",
        recommendation: "Implement maximum caps on fees and taxes"
      });
    }
    
    if (treasuryAnalysis.hasWithdrawFunction && !treasuryAnalysis.hasTreasuryTimelock) {
      risks.push({
        id: "SUI-TOKEN-012",
        title: "No Timelock on Treasury Withdrawals",
        description: "Funds can be withdrawn from treasury without delay",
        severity: "High",
        category: "Treasury",
        recommendation: "Add timelock mechanism to treasury withdrawal functions"
      });
    }
    
    return risks;
  }
}

module.exports = new TokenAnalyzerService();