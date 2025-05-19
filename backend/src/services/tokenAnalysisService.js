const tokenSupplyService = require('./tokenSupplyService');
const ownershipService = require('./ownershipService');
const upgradeService = require('./upgradeService');
const treasuryService = require('./treasuryService');

class TokenAnalysisService {
  /**
   * Perform comprehensive token analysis with in-depth security checks
   * @param {string} tokenAddress - The token address to analyze
   * @returns {Object} Complete analysis results
   */
  async analyzeToken(tokenAddress) {
    try {
      // Run all analyses in parallel for better performance
      const [
        supplyAnalysis,
        ownershipAnalysis,
        upgradeAnalysis,
        treasuryAnalysis
      ] = await Promise.all([
        tokenSupplyService.analyzeSupply(tokenAddress),
        ownershipService.analyzeOwnership(tokenAddress),
        upgradeService.analyzeUpgradeCapabilities(tokenAddress),
        treasuryService.analyzeTreasury(tokenAddress)
      ]);
      
      // Calculate security scores
      const securityScore = this.calculateSecurityScore(
        supplyAnalysis,
        ownershipAnalysis,
        upgradeAnalysis,
        treasuryAnalysis
      );
      
      // Generate risk assessment
      const riskAssessment = this.generateRiskAssessment(
        supplyAnalysis,
        ownershipAnalysis,
        upgradeAnalysis,
        treasuryAnalysis,
        securityScore
      );
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(
        supplyAnalysis,
        ownershipAnalysis,
        upgradeAnalysis,
        treasuryAnalysis,
        securityScore,
        riskAssessment
      );
      
      return {
        tokenAddress,
        timestamp: Date.now(),
        supply: supplyAnalysis,
        ownership: ownershipAnalysis,
        upgrade: upgradeAnalysis,
        treasury: treasuryAnalysis,
        securityScore,
        riskAssessment,
        recommendations
      };
    } catch (error) {
      console.error('Error performing token analysis:', error);
      throw new Error(`Failed to analyze token ${tokenAddress}: ${error.message}`);
    }
  }
  
  /**
   * Calculate security scores for each category and overall
   * @private
   */
  calculateSecurityScore(supply, ownership, upgrade, treasury) {
    // Supply score
    const supplyScore = supply.mintCapability.includes("Burned") ? 90 : 60;
    
    // Ownership score
    const ownershipScore = ownership.isRenounced ? 90 : 
      (ownership.isMultisig ? 75 : 50);
    
    // Upgrade score
    const upgradeScore = !upgrade.isUpgradeable ? 90 :
      (upgrade.timelock && upgrade.timelock !== "None" ? 70 : 50);
    
    // Treasury score
    const treasuryScore = treasury.lpTokenStatus.status === "Burned" ? 90 :
      (treasury.controls.includes("Multisig") || 
       treasury.controls.includes("DAO Governance") ? 75 : 60);
    
    // Overall score - weighted average
    const overall = Math.round(
      (supplyScore * 0.25) +
      (ownershipScore * 0.30) +
      (upgradeScore * 0.25) +
      (treasuryScore * 0.20)
    );
    
    return {
      overall,
      supply: supplyScore,
      ownership: ownershipScore,
      upgrade: upgradeScore,
      treasury: treasuryScore
    };
  }
  
  /**
   * Generate risk assessment based on analysis results
   * @private
   */
  generateRiskAssessment(supply, ownership, upgrade, treasury, score) {
    // Determine risk level
    let level;
    if (score.overall >= 80) {
      level = "Low";
    } else if (score.overall >= 60) {
      level = "Medium";
    } else {
      level = "High";
    }
    
    // Identify risk factors
    const factors = [];
    
    if (supply.mintCapability.includes("Owned")) {
      factors.push("Supply can be increased by the creator");
    }
    
    if (!ownership.isRenounced) {
      factors.push("Contract ownership not renounced");
    }
    
    if (ownership.concentration > 60) {
      factors.push("High token concentration in top wallets");
    }
    
    if (upgrade.isUpgradeable) {
      factors.push(`Contract is upgradeable via ${upgrade.mechanism} mechanism`);
      
      if (!upgrade.timelock || upgrade.timelock === "None") {
        factors.push("No timelock on contract upgrades");
      }
    }
    
    if (treasury.lpTokenStatus.status !== "Burned") {
      factors.push(`Only ${treasury.lpTokenStatus.percentage} of LP tokens secured`);
    }
    
    if (treasury.totalLiquidity < 10000) {
      factors.push("Low liquidity across all pools");
    }
    
    // Return assessment
    return {
      level,
      factors: factors.length > 0 ? factors : ["No significant risks detected"]
    };
  }
  
  /**
   * Generate recommendations based on analysis results
   * @private
   */
  generateRecommendations(supply, ownership, upgrade, treasury, score, risk) {
    const recommendations = [];
    
    // Overall recommendation
    if (score.overall >= 80) {
      recommendations.push("Token has good security practices implemented");
    } else if (score.overall >= 60) {
      recommendations.push("Exercise caution and conduct further research before investing");
    } else {
      recommendations.push("High risk token - careful consideration strongly advised");
    }
    
    // Supply recommendations
    if (supply.mintCapability.includes("Owned")) {
      recommendations.push("Monitor supply changes as the token supply can be increased");
    }
    
    // Ownership recommendations
    if (!ownership.isRenounced) {
      if (ownership.isMultisig) {
        recommendations.push("Contract controlled by a multisig which provides some security");
      } else {
        recommendations.push("Single owner can modify the contract - high dependency on trust");
      }
    }
    
    // Upgrade recommendations
    if (upgrade.isUpgradeable) {
      recommendations.push("Watch for contract upgrades that may change token behavior");
    }
    
    // Treasury recommendations
    if (treasury.lpTokenStatus.status !== "Burned") {
      recommendations.push("LP tokens not fully secured - monitor for potential liquidity removal");
    }
    
    return recommendations;
  }
}

module.exports = new TokenAnalysisService();