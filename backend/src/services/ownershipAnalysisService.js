class OwnershipAnalysisService {
  /**
   * Analyze ownership and governance structures in detail
   * @param {string} sourceCode - Move source code
   * @param {Object} ast - AST representation
   * @returns {Object} Detailed ownership analysis
   */
  analyzeOwnershipStructures(sourceCode, ast) {
    // Identify ownership-related structures
    const ownershipStructs = ast.types.filter(type => 
      type.name.includes('Admin') || 
      type.name.includes('Owner') || 
      type.name.includes('Cap') ||
      type.name.includes('Authority')
    );
    
    // Basic ownership analysis
    const ownershipAnalysis = {
      adminCapabilities: this.identifyAdminCapabilities(ownershipStructs, sourceCode),
      ownershipTransfer: this.analyzeOwnershipTransfer(sourceCode, ast),
      multiSigDetails: this.analyzeMultiSig(sourceCode, ast),
      governanceModel: this.identifyGovernanceModel(sourceCode, ast),
      accessControlPatterns: this.identifyAccessControlPatterns(sourceCode)
    };
    
    // Risk assessment
    ownershipAnalysis.riskAssessment = this.assessOwnershipRisks(ownershipAnalysis, sourceCode);
    
    return ownershipAnalysis;
  }
  
  /**
   * Analyze treasury operations in detail
   * @param {string} sourceCode - Move source code
   * @param {Object} ast - AST representation
   * @returns {Object} Detailed treasury analysis
   */
  analyzeTreasuryOperations(sourceCode, ast) {
    const treasuryAnalysis = {
      hasTreasury: sourceCode.includes('Treasury') || 
                 sourceCode.includes('DAO') ||
                 sourceCode.includes('Fund'),
      treasury: {
        treasuryStructs: this.identifyTreasuryStructs(ast),
        hasFeeCollection: this.detectFeeCollection(sourceCode),
        withdrawalMechanisms: this.analyzeWithdrawals(sourceCode, ast),
        distributionMechanisms: this.analyzeDistribution(sourceCode, ast)
      }
    };
    
    // Fee analysis
    treasuryAnalysis.feeAnalysis = this.analyzeFeeStructure(sourceCode);
    
    // Risk assessment
    treasuryAnalysis.riskAssessment = this.assessTreasuryRisks(treasuryAnalysis, sourceCode);
    
    return treasuryAnalysis;
  }
  
  /**
   * Identify admin capability structures
   */
  identifyAdminCapabilities(ownershipStructs, sourceCode) {
    return ownershipStructs.map(struct => {
      const functions = this.extractCapabilityFunctions(struct.name, sourceCode);
      
      return {
        name: struct.name,
        functions,
        fields: struct.fields?.map(f => f.name) || [],
        isTransferable: sourceCode.includes(`transfer`) && sourceCode.includes(struct.name),
        isBurnable: sourceCode.includes(`burn`) && sourceCode.includes(struct.name)
      };
    });
  }
  
  /**
   * Extract functions that use a capability
   */
  extractCapabilityFunctions(capabilityName, sourceCode) {
    const funcPattern = new RegExp(`fun\\s+([a-zA-Z0-9_]+)\\s*\\([^)]*&(?:mut)?\\s*${capabilityName}[^)]*\\)`, 'g');
    const functions = [];
    let match;
    
    while ((match = funcPattern.exec(sourceCode)) !== null) {
      functions.push(match[1]);
    }
    
    return functions;
  }
  
  /**
   * Analyze ownership transfer capabilities
   */
  analyzeOwnershipTransfer(sourceCode, ast) {
    // Check for transfer ownership functions
    const hasTransferOwnership = sourceCode.includes('transfer_ownership') || 
                               sourceCode.match(/transfer\s*\(\s*\w+\s*,\s*\w+\s*\)/g) !== null;
    
    // Check for renounce ownership
    const hasRenounceOwnership = sourceCode.includes('renounce_ownership') || 
                               sourceCode.includes('burn_cap');
    
    // Check for two-step ownership transfer (safer)
    const hasTwoStepTransfer = sourceCode.includes('accept_ownership') || 
                             sourceCode.includes('claim_ownership');
    
    // Check for transfer limitations
    const hasTransferLimitations = sourceCode.match(/assert!\s*\(\s*[^,]+\s*==\s*[^,]+\s*\)\s*;.*transfer/s) !== null;
    
    return {
      hasTransferOwnership,
      hasRenounceOwnership,
      hasTwoStepTransfer,
      hasTransferLimitations,
      hasTimelock: sourceCode.includes('timelock') && sourceCode.match(/timelock.*transfer/s) !== null
    };
  }
  
  /**
   * Analyze multi-signature governance
   */
  analyzeMultiSig(sourceCode, ast) {
    const hasMultiSig = sourceCode.includes('multi_sig') || 
                      sourceCode.includes('MultiSig') ||
                      sourceCode.includes('multisig');
    
    if (!hasMultiSig) {
      return { hasMultiSig: false };
    }
    
    // Try to extract threshold
    const thresholdPattern = /threshold\s*(?::\s*u\d+)?\s*=\s*(\d+)/;
    const thresholdMatch = sourceCode.match(thresholdPattern);
    const threshold = thresholdMatch ? thresholdMatch[1] : null;
    
    // Check for timelock
    const hasTimelock = sourceCode.includes('timelock') && 
                      sourceCode.match(/multisig.*timelock/s) !== null;
    
    return {
      hasMultiSig: true,
      threshold,
      hasTimelock,
      hasQuorum: sourceCode.includes('quorum') || sourceCode.includes('threshold'),
      isConfigurableOnchain: sourceCode.includes('set_threshold') || 
                           sourceCode.includes('add_owner') || 
                           sourceCode.includes('remove_owner')
    };
  }
  
  /**
   * Identify the governance model
   */
  identifyGovernanceModel(sourceCode, ast) {
    // Check for various governance models
    const hasDAO = sourceCode.includes('DAO') || 
                 sourceCode.includes('dao') || 
                 sourceCode.includes('governance');
    
    const hasVoting = sourceCode.includes('vote') || 
                    sourceCode.includes('ballot') ||
                    sourceCode.includes('proposal');
    
    const hasStaking = sourceCode.includes('stake') || 
                     sourceCode.includes('staking');
    
    let governanceModel = 'single_owner'; // Default
    
    if (hasDAO && hasVoting) {
      governanceModel = 'dao_voting';
    } else if (hasDAO) {
      governanceModel = 'dao';
    } else if (this.analyzeMultiSig(sourceCode, ast).hasMultiSig) {
      governanceModel = 'multisig';
    }
    
    return {
      model: governanceModel,
      hasDAO,
      hasVoting,
      hasStaking,
      hasProposals: sourceCode.includes('proposal') || sourceCode.includes('propose'),
      hasTimelock: sourceCode.includes('timelock') && 
                 (sourceCode.includes('governance') || sourceCode.includes('dao'))
    };
  }
  
  /**
   * Identify access control patterns
   */
  identifyAccessControlPatterns(sourceCode) {
    const patterns = [];
    
    // Check for signer verification
    if (sourceCode.match(/assert!\s*\(\s*tx_context::sender\s*\(\s*ctx\s*\)\s*==/) !== null) {
      patterns.push('tx_sender_check');
    }
    
    // Check for capability-based authorization
    if (sourceCode.match(/&(?:mut)?\s*\w+Cap/) !== null || 
        sourceCode.match(/&(?:mut)?\s*\w+Admin/) !== null) {
      patterns.push('capability_based');
    }
    
    // Check for role-based access control
    if (sourceCode.includes('role') || sourceCode.includes('Role')) {
      patterns.push('role_based');
    }
    
    // Check for witness pattern
    if (sourceCode.includes('witness') || sourceCode.includes('Witness')) {
      patterns.push('witness_pattern');
    }
    
    return patterns;
  }
  
  /**
   * Identify treasury-related structs
   */
  identifyTreasuryStructs(ast) {
    return ast.types
      .filter(type => 
        type.name.includes('Treasury') || 
        type.name.includes('Fund') || 
        type.name.includes('DAO'))
      .map(struct => ({
        name: struct.name,
        fields: struct.fields?.map(f => ({ name: f.name, type: f.type })) || []
      }));
  }
  
  /**
   * Detect fee collection mechanisms
   */
  detectFeeCollection(sourceCode) {
    const hasFees = sourceCode.includes('fee') || 
                  sourceCode.includes('tax') ||
                  sourceCode.includes('royalty');
    
    if (!hasFees) {
      return { hasFees: false };
    }
    
    // Try to extract fee percentage
    const feePattern = /(?:fee|tax)\s*(?::\s*u\d+)?\s*=\s*(\d+)/;
    const feeMatch = sourceCode.match(feePattern);
    const feeAmount = feeMatch ? feeMatch[1] : null;
    
    return {
      hasFees: true,
      feeAmount,
      hasFeeRecipient: sourceCode.includes('fee_recipient') || sourceCode.includes('treasury'),
      hasFeeBurn: sourceCode.includes('fee') && sourceCode.includes('burn')
    };
  }
  
  /**
   * Analyze withdrawal mechanisms
   */
  analyzeWithdrawals(sourceCode, ast) {
    const hasWithdraw = sourceCode.includes('withdraw') || 
                      sourceCode.includes('claim') ||
                      sourceCode.includes('transfer_from_treasury');
    
    if (!hasWithdraw) {
      return { hasWithdraw: false };
    }
    
    // Check for access control on withdrawals
    const hasAccessControl = sourceCode.match(/withdraw.*&(?:mut)?\s*(?:Admin|Cap|Authority)/) !== null;
    
    // Check for limits on withdrawals
    const hasWithdrawalLimits = sourceCode.match(/withdraw.*assert!\s*\(\s*.+\s*<\s*.+\)/) !== null;
    
    return {
      hasWithdraw,
      hasAccessControl,
      hasWithdrawalLimits,
      hasTimelock: sourceCode.includes('timelock') && sourceCode.includes('withdraw'),
      hasBatchWithdraw: sourceCode.includes('batch') && sourceCode.includes('withdraw')
    };
  }
  
  /**
   * Analyze distribution mechanisms
   */
  analyzeDistribution(sourceCode, ast) {
    const hasDistribution = sourceCode.includes('distribute') || 
                         sourceCode.includes('dividend') ||
                         sourceCode.includes('reward');
    
    if (!hasDistribution) {
      return { hasDistribution: false };
    }
    
    return {
      hasDistribution,
      hasAutoDistribution: sourceCode.includes('auto') && 
                         (sourceCode.includes('distribute') || sourceCode.includes('dividend')),
      hasVestingSchedule: sourceCode.includes('vest') || sourceCode.includes('schedule'),
      hasClaimFunction: sourceCode.includes('claim')
    };
  }
  
  /**
   * Analyze fee structure in detail
   */
  analyzeFeeStructure(sourceCode) {
    const hasFees = sourceCode.includes('fee') || 
                  sourceCode.includes('tax') ||
                  sourceCode.includes('royalty');
    
    if (!hasFees) {
      return { hasFees: false };
    }
    
    // Check for fee caps
    const hasFeeLimit = sourceCode.match(/(?:max|maximum|limit).*(?:fee|tax)/i) !== null;
    
    // Try to extract fee limits
    const maxFeePattern = /(?:max|maximum|limit)\s*(?:fee|tax)\s*(?::\s*u\d+)?\s*=\s*(\d+)/i;
    const maxFeeMatch = sourceCode.match(maxFeePattern);
    const maxFee = maxFeeMatch ? maxFeeMatch[1] : null;
    
    // Check for variable fees
    const hasVariableFees = sourceCode.includes('set_fee') || 
                           sourceCode.includes('update_fee');
    
    return {
      hasFees,
      hasFeeLimit,
      maxFee,
      hasVariableFees,
      hasMultipleFeeTypes: 
        (sourceCode.match(/(?:buy|sell|transfer|liquidity).*fee/g) || []).length > 1,
      feeUpdateProtected: (sourceCode.includes('set_fee') || sourceCode.includes('update_fee')) && 
                        sourceCode.match(/(?:set|update)_fee.*&(?:mut)?\s*(?:Admin|Cap|Authority)/) !== null
    };
  }
  
  /**
   * Assess ownership-related security risks
   */
  assessOwnershipRisks(ownershipAnalysis, sourceCode) {
    const risks = [];
    
    // Centralized ownership
    if (ownershipAnalysis.governanceModel.model === 'single_owner' && 
        ownershipAnalysis.adminCapabilities.length > 0) {
      risks.push({
        id: "SUI-OWN-001",
        title: "Centralized Contract Ownership",
        severity: "Medium",
        description: "Contract has centralized ownership with significant admin capabilities",
        recommendation: "Consider implementing multi-signature or DAO governance"
      });
    }
    
    // Single-step ownership transfer
    if (ownershipAnalysis.ownershipTransfer.hasTransferOwnership && 
        !ownershipAnalysis.ownershipTransfer.hasTwoStepTransfer) {
      risks.push({
        id: "SUI-OWN-002",
        title: "Unsafe Ownership Transfer",
        severity: "Medium",
        description: "Ownership transfer is done in a single step, risking accidental transfers to invalid addresses",
        recommendation: "Implement a two-step ownership transfer pattern with claim/accept mechanism"
      });
    }
    
    // Missing ownership renounce
    if (!ownershipAnalysis.ownershipTransfer.hasRenounceOwnership) {
      risks.push({
        id: "SUI-OWN-003",
        title: "Cannot Renounce Ownership",
        severity: "Low",
        description: "Contract ownership cannot be permanently renounced",
        recommendation: "Add capability to renounce ownership for future immutability"
      });
    }
    
    // Missing timelock
    if (ownershipAnalysis.adminCapabilities.length > 0 && 
        !ownershipAnalysis.ownershipTransfer.hasTimelock) {
      risks.push({
        id: "SUI-OWN-004",
        title: "No Timelock on Ownership Actions",
        severity: "Medium",
        description: "Critical ownership actions have no timelock protection",
        recommendation: "Implement timelock mechanisms for critical ownership operations"
      });
    }
    
    return risks;
  }
  
  /**
   * Assess treasury-related security risks
   */
  assessTreasuryRisks(treasuryAnalysis, sourceCode) {
    const risks = [];
    
    // Unprotected treasury
    if (treasuryAnalysis.hasTreasury && 
        treasuryAnalysis.treasury.withdrawalMechanisms.hasWithdraw && 
        !treasuryAnalysis.treasury.withdrawalMechanisms.hasAccessControl) {
      risks.push({
        id: "SUI-TREAS-001",
        title: "Unprotected Treasury Withdrawals",
        severity: "Critical",
        description: "Treasury funds can be withdrawn without proper access controls",
        recommendation: "Add strict access controls to treasury withdrawal functions"
      });
    }
    
    // Uncapped fees
    if (treasuryAnalysis.feeAnalysis.hasFees && 
        !treasuryAnalysis.feeAnalysis.hasFeeLimit) {
      risks.push({
        id: "SUI-TREAS-002",
        title: "Uncapped Fee Structure",
        severity: "Medium",
        description: "Fees can be set without upper limits",
        recommendation: "Implement maximum caps on all fees"
      });
    }
    
    // Unprotected fee changes
    if (treasuryAnalysis.feeAnalysis.hasVariableFees && 
        !treasuryAnalysis.feeAnalysis.feeUpdateProtected) {
      risks.push({
        id: "SUI-TREAS-003",
        title: "Unprotected Fee Changes",
        severity: "High",
        description: "Fees can be modified without proper access controls",
        recommendation: "Add strict access controls to fee modification functions"
      });
    }
    
    // Missing withdrawal limits
    if (treasuryAnalysis.treasury.withdrawalMechanisms.hasWithdraw && 
        !treasuryAnalysis.treasury.withdrawalMechanisms.hasWithdrawalLimits) {
      risks.push({
        id: "SUI-TREAS-004",
        title: "No Withdrawal Limits",
        severity: "Medium",
        description: "No limits on treasury withdrawal amounts",
        recommendation: "Implement withdrawal limits and rate limiting"
      });
    }
    
    return risks;
  }
}

module.exports = new OwnershipAnalysisService();