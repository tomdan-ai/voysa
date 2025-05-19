const suiService = require('./suiService');
const config = require('../config');

class OwnershipService {
  /**
   * Analyze token ownership structure
   * @param {string} tokenAddress - The token address to analyze
   * @returns {Object} Ownership analysis details
   */
  async analyzeOwnership(tokenAddress) {
    try {
      // Check if ownership is renounced
      const ownershipStatus = await this.checkOwnershipStatus(tokenAddress);
      
      // Get top token holders
      const topHolders = await this.getTopHolders(tokenAddress);
      
      // Check if owner is a multisig
      const multisigInfo = await this.checkMultisig(ownershipStatus.ownerAddress);
      
      // Calculate concentration metrics
      const concentration = this.calculateConcentration(topHolders);
      
      return {
        ownerType: ownershipStatus.isRenounced ? "Renounced" : 
          (multisigInfo.isMultisig ? "Multisig" : "Single Owner"),
        ownerAddress: ownershipStatus.ownerAddress,
        isRenounced: ownershipStatus.isRenounced,
        renounceTimestamp: ownershipStatus.renounceTimestamp,
        concentration,
        topHolders,
        isMultisig: multisigInfo.isMultisig,
        multisigDetails: multisigInfo.isMultisig ? multisigInfo.details : null,
        transferHistory: await this.getOwnershipTransferHistory(tokenAddress)
      };
    } catch (error) {
      console.error('Error analyzing token ownership:', error);
      throw new Error(`Failed to analyze ownership for ${tokenAddress}: ${error.message}`);
    }
  }
  
  /**
   * Check if token ownership is renounced
   * @private
   */
  async checkOwnershipStatus(tokenAddress) {
    // Address hash for deterministic test data
    const addressHash = tokenAddress
      .replace(/[^a-f0-9]/gi, '')
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    const isRenounced = addressHash % 5 !== 0;
    
    return {
      isRenounced,
      ownerAddress: isRenounced ? 
        "0x0000000000000000000000000000000000000000" : 
        `0x${(addressHash * 2).toString(16).padStart(8, '0')}...`,
      renounceTimestamp: isRenounced ? 
        Date.now() - ((addressHash % 90) * 24 * 60 * 60 * 1000) : null
    };
  }
  
  /**
   * Get top token holders
   * @private
   */
  async getTopHolders(tokenAddress) {
    // Address hash for deterministic test data
    const addressHash = tokenAddress
      .replace(/[^a-f0-9]/gi, '')
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    // Generate top holders
    const holdersCount = 5 + (addressHash % 5);
    const holders = [];
    
    let remainingPercentage = 100;
    
    for (let i = 0; i < holdersCount; i++) {
      // Last holder gets remaining percentage
      const percentage = i === holdersCount - 1 ? 
        remainingPercentage : 
        Math.min(remainingPercentage, (40 / (i + 1)) * (1 + (addressHash % 5) / 10));
      
      remainingPercentage -= percentage;
      
      holders.push({
        address: `0x${(addressHash * (i + 1)).toString(16).padStart(8, '0')}...`,
        percentage: `${percentage.toFixed(2)}%`,
        type: i === 0 ? 
          (addressHash % 2 === 0 ? "Creator" : "Investor") : 
          (i === 1 ? "Pool" : "Holder")
      });
    }
    
    return holders;
  }
  
  /**
   * Check if the owner is a multisig
   * @private
   */
  async checkMultisig(ownerAddress) {
    // Null address can't be a multisig
    if (ownerAddress === "0x0000000000000000000000000000000000000000") {
      return { isMultisig: false };
    }
    
    // Address hash for deterministic test data
    const addressHash = ownerAddress
      .replace(/[^a-f0-9]/gi, '')
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    const isMultisig = addressHash % 4 === 0;
    
    return {
      isMultisig,
      details: isMultisig ? {
        requiredSignatures: 2 + (addressHash % 3),
        totalSigners: 3 + (addressHash % 4),
        signers: Array(3 + (addressHash % 4)).fill().map((_, i) => 
          `0x${(addressHash * (i + 10)).toString(16).padStart(8, '0')}...`)
      } : null
    };
  }
  
  /**
   * Calculate ownership concentration metrics
   * @private
   */
  calculateConcentration(topHolders) {
    // Calculate what percentage is held by top 3 wallets
    const top3Percentage = topHolders.slice(0, 3)
      .reduce((sum, holder) => sum + parseFloat(holder.percentage), 0);
    
    return top3Percentage;
  }
  
  /**
   * Get ownership transfer history
   * @private
   */
  async getOwnershipTransferHistory(tokenAddress) {
    // Address hash for deterministic test data
    const addressHash = tokenAddress
      .replace(/[^a-f0-9]/gi, '')
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    const transferCount = addressHash % 4;
    
    // Generate transfer history
    return Array(transferCount).fill().map((_, i) => {
      const daysAgo = (transferCount - i) * 30 + (addressHash % 60);
      
      return {
        date: new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        from: i === 0 ? 
          "Deployer" : 
          `0x${(addressHash * (i * 3)).toString(16).padStart(8, '0')}...`,
        to: i === transferCount - 1 && 
          (addressHash % 5 !== 0) ? "0x0" : 
          `0x${(addressHash * (i * 3 + 1)).toString(16).padStart(8, '0')}...`,
        txHash: `0x${(addressHash * (i + 1)).toString(16).padStart(64, '0')}`
      };
    });
  }
}

module.exports = new OwnershipService();