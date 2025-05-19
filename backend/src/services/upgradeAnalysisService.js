class UpgradeAnalysisService {
  /**
   * Perform detailed analysis of contract upgrade capabilities
   * @param {string} sourceCode - Move source code
   * @param {Object} ast - AST representation
   * @returns {Object} Upgrade analysis results
   */
  analyzeUpgradeCapabilities(sourceCode, ast) {
    // Detect upgrade capabilities
    const hasUpgradeCapability = sourceCode.includes('upgrade') || 
                              sourceCode.includes('::package::');
    
    const upgradeAnalysis = {
      isUpgradeable: hasUpgradeCapability,
      upgradeModel: this.identifyUpgradeModel(sourceCode),
      upgradeAccess: this.analyzeUpgradeAccess(sourceCode, ast),
      upgradeRestrictions: this.analyzeUpgradeRestrictions(sourceCode)
    };
    
    // Analyze Sui-specific upgrade patterns
    if (sourceCode.includes('sui::package') || sourceCode.includes('UpgradeCap')) {
      upgradeAnalysis.suiUpgrade = this.analyzeSuiUpgradeCapability(sourceCode, ast);
    }
    
    // Risk assessment
    upgradeAnalysis.riskAssessment = this.assessUpgradeRisks(upgradeAnalysis, sourceCode);
    
    return upgradeAnalysis;
  }
  
  /**
   * Identify the upgrade model used
   */
  identifyUpgradeModel(sourceCode) {
    // Check for various upgrade patterns
    const supportsSuiUpgrades = sourceCode.includes('sui::package');
    const usesUpgradeCap = sourceCode.includes('UpgradeCap');
    const usesProxyPattern = sourceCode.includes('proxy') || sourceCode.includes('Proxy');
    const usesModuleUpgrade = sourceCode.includes('upgrade_module') || 
                            sourceCode.includes('publish_upgrade');
    
    // Determine the model
    let model = 'not_upgradeable';
    
    if (supportsSuiUpgrades && usesUpgradeCap) {
      model = 'sui_package_upgrade';
    } else if (usesProxyPattern) {
      model = 'proxy_pattern';
    } else if (usesModuleUpgrade) {
      model = 'module_upgrade';
    } else if (sourceCode.includes('upgrade')) {
      model = 'custom_upgrade';
    }
    
    return {
      model,
      supportsSuiUpgrades,
      usesUpgradeCap,
      usesProxyPattern,
      usesModuleUpgrade
    };
  }
  
  /**
   * Analyze who can access upgrade functionality
   */
  analyzeUpgradeAccess(sourceCode, ast) {
    // Default - no upgrade access
    if (!sourceCode.includes('upgrade')) {
      return {
        hasUpgradeAccess: false
      };
    }
    
    // Check for various access patterns
    const adminUpgrade = sourceCode.match(/upgrade.*&(?:mut)?\s*(?:Admin|Cap|Authority)/) !== null;
    const govUpgrade = sourceCode.match(/upgrade.*&(?:mut)?\s*(?:Governance|DAO)/) !== null;
    const multiSigUpgrade = sourceCode.includes('multi_sig') && 
                          sourceCode.match(/multi_sig.*upgrade/s) !== null;
    
    let accessModel = 'unknown';
    
    if (adminUpgrade && !govUpgrade && !multiSigUpgrade) {
      accessModel = 'admin_only';
    } else if (govUpgrade) {
      accessModel = 'governance';
    } else if (multiSigUpgrade) {
      accessModel = 'multi_sig';
    }
    
    return {
      hasUpgradeAccess: true,
      accessModel,
      adminUpgrade,
      govUpgrade,
      multiSigUpgrade,
      hasPublicUpgrade: sourceCode.match(/public\s+(?:entry\s+)?fun\s+.*upgrade/) !== null && 
                      !adminUpgrade && !govUpgrade && !multiSigUpgrade
    };
  }
  
  /**
   * Analyze upgrade restrictions
   */
  analyzeUpgradeRestrictions(sourceCode) {
    // Check for restrictions on upgrades
    const hasUpgradePolicy = sourceCode.includes('upgrade_policy');
    const hasVersionChecks = sourceCode.match(/version.*>=/) !== null;
    const hasUpgradeFreeze = sourceCode.includes('freeze_upgrade') || 
                          sourceCode.includes('disable_upgrade');
    
    let policyType = 'none';
    
    if (sourceCode.match(/compatible/i) && sourceCode.includes('upgrade_policy')) {
      policyType = 'compatible';
    } else if (sourceCode.match(/immutable/i) && sourceCode.includes('upgrade_policy')) {
      policyType = 'immutable';
    } else if (hasUpgradePolicy) {
      policyType = 'custom';
    }
    
    return {
      hasUpgradePolicy,
      policyType,
      hasVersionChecks,
      hasUpgradeFreeze,
      hasTimelock: sourceCode.includes('timelock') && sourceCode.includes('upgrade'),
      hasEmergencyUpgrade: sourceCode.includes('emergency') && sourceCode.includes('upgrade')
    };
  }
  
  /**
   * Analyze Sui-specific upgrade capabilities
   */
  analyzeSuiUpgradeCapability(sourceCode, ast) {
    // Detect Sui package upgrade patterns
    const hasAuthorizeUpgrade = sourceCode.includes('authorize_upgrade');
    const hasCommitUpgrade = sourceCode.includes('commit_upgrade');
    
    // Check for proper upgrade policy usage
    const usesCompatiblePolicy = sourceCode.includes('compatible') && 
                               sourceCode.includes('upgrade_policy');
    
    const usesSemver = sourceCode.includes('version') && 
                     (sourceCode.match(/\d+\.\d+\.\d+/) !== null);
    
    // Check for proper authorization checks
    const hasProperAuth = sourceCode.match(/authorize_upgrade.*package::upgrade_policy\(cap\)/) !== null;
    
    return {
      hasAuthorizeUpgrade,
      hasCommitUpgrade,
      usesCompatiblePolicy,
      usesSemver,
      hasProperAuth,
      canFreezeUpgrade: sourceCode.includes('authorize_upgrade') && 
                     sourceCode.includes('policy') &&
                     sourceCode.includes('freeze')
    };
  }
  
  /**
   * Assess upgrade-related security risks
   */
  assessUpgradeRisks(upgradeAnalysis, sourceCode) {
    const risks = [];
    
    // If not upgradeable, no risks to assess
    if (!upgradeAnalysis.isUpgradeable) {
      return risks;
    }
    
    // Unrestricted upgrade access
    if (upgradeAnalysis.upgradeAccess.hasPublicUpgrade) {
      risks.push({
        id: "SUI-UPG-001",
        title: "Public Upgrade Access",
        severity: "Critical",
        description: "Anyone can upgrade the contract without restrictions",
        recommendation: "Implement strict access controls for upgrade functions"
      });
    }
    
    // Centralized upgrade control
    if (upgradeAnalysis.upgradeAccess.accessModel === 'admin_only') {
      risks.push({
        id: "SUI-UPG-002",
        title: "Centralized Upgrade Control",
        severity: "Medium",
        description: "Upgrades are controlled by a single admin role",
        recommendation: "Consider using multi-signature or governance for upgrades"
      });
    }
    
    // Missing upgrade policy
    if (upgradeAnalysis.isUpgradeable && !upgradeAnalysis.upgradeRestrictions.hasUpgradePolicy) {
      risks.push({
        id: "SUI-UPG-003",
        title: "Missing Upgrade Policy",
        severity: "Medium",
        description: "No formal policy restricting upgrade scope",
        recommendation: "Implement upgrade policy using package::upgrade_policy"
      });
    }
    
    // No timelock on upgrades
    if (upgradeAnalysis.isUpgradeable && !upgradeAnalysis.upgradeRestrictions.hasTimelock) {
      risks.push({
        id: "SUI-UPG-004",
        title: "No Upgrade Timelock",
        severity: "Medium",
        description: "Upgrades can be implemented without delay",
        recommendation: "Add timelock mechanism for upgrades to allow users time to exit"
      });
    }
    
    // Missing version checks
    if (upgradeAnalysis.upgradeModel.model === 'sui_package_upgrade' && 
        !upgradeAnalysis.upgradeRestrictions.hasVersionChecks) {
      risks.push({
        id: "SUI-UPG-005",
        title: "Missing Version Checks",
        severity: "Low",
        description: "No semantic versioning or version validation for upgrades",
        recommendation: "Implement semantic versioning with proper compatibility checking"
      });
    }
    
    return risks;
  }
}

module.exports = new UpgradeAnalysisService();