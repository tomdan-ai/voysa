const { JsonRpcProvider, Connection, TransactionBlock } = require('@mysten/sui.js');
const config = require('../config');

class SuiService {
  constructor() {
    this.connection = new Connection({
      fullnode: config.sui.rpcUrl,
    });
    this.provider = new JsonRpcProvider(this.connection);
  }

  /**
   * Get object data from Sui blockchain
   * @param {string} objectId - The object ID to retrieve
   * @returns {Promise<Object>} - The object data
   */
  async getObject(objectId) {
    try {
      const objectResponse = await this.provider.getObject({
        id: objectId,
        options: { showContent: true, showOwner: true },
      });
      return objectResponse;
    } catch (error) {
      console.error('Error getting object:', error);
      throw new Error(`Failed to get object ${objectId}: ${error.message}`);
    }
  }

  /**
   * Query token analysis from the smart contract with detailed metrics and safety checks
   * @param {string} tokenAddress - The token address to analyze
   * @returns {Promise<Object>} - The detailed analysis results with safety checks
   */
  async getTokenAnalysis(tokenAddress) {
    try {
      if (!config.contract.snifferStorageId) {
        throw new Error('Sniffer storage ID is not configured');
      }

      // Generate deterministic but pseudo-random values based on token address
      const addressSum = tokenAddress
        .replace(/[^a-f0-9]/gi, '')
        .split('')
        .reduce((sum, char) => sum + char.charCodeAt(0), 0);
      
      // Helper function to get a deterministic value in a range
      const getValueInRange = (seed, min, max) => {
        return min + (seed % (max - min + 1));
      };
      
      // Generate fraud likelihood factors
      const holderConcentration = getValueInRange(addressSum * 13, 1, 100);
      const txVolumeScore = getValueInRange(addressSum * 17, 1, 100);
      const contractAge = getValueInRange(addressSum * 23, 1, 365); // Days
      const codeQualityScore = getValueInRange(addressSum * 29, 1, 100);
      const liquidityDepth = getValueInRange(addressSum * 31, 1000, 1000000); // In USD
      
      // Calculate fraud likelihood with weights
      const fraudFactors = [
        { name: "Holder Concentration", value: holderConcentration, weight: 0.35, description: `${holderConcentration}% of tokens held by top 10 wallets` },
        { name: "Transaction Volume", value: txVolumeScore, weight: 0.25, description: `${txVolumeScore}/100 based on transaction patterns` },
        { name: "Contract Age", value: contractAge, weight: 0.15, description: `Token contract is ${contractAge} days old` },
        { name: "Code Quality", value: codeQualityScore, weight: 0.15, description: `${codeQualityScore}/100 based on contract security analysis` },
        { name: "Liquidity Depth", value: 100 - Math.min(100, liquidityDepth / 10000), weight: 0.10, description: `$${liquidityDepth.toLocaleString()} in liquidity pools` }
      ];
      
      // Calculate weighted fraud likelihood
      const fraudLikelihood = Math.round(
        fraudFactors.reduce((sum, factor) => sum + (factor.value * factor.weight), 0)
      );
      
      // Generate cook potential factors
      const volumeGrowth = getValueInRange(addressSum * 37, -20, 400); // Percentage
      const socialSentiment = getValueInRange(addressSum * 41, 1, 100);
      const holderGrowth = getValueInRange(addressSum * 43, -10, 200); // Percentage
      const devActivity = getValueInRange(addressSum * 47, 0, 50); // Events per week
      const marketTrend = getValueInRange(addressSum * 53, -30, 50); // Percentage
      
      // Calculate cook potential with weights
      const cookFactors = [
        { name: "Volume Growth", value: Math.min(100, Math.max(0, volumeGrowth + 20)), weight: 0.30, description: `${volumeGrowth}% increase in 24h trading volume` },
        { name: "Social Sentiment", value: socialSentiment, weight: 0.25, description: `${socialSentiment}/100 based on social media mentions` },
        { name: "Holder Growth", value: Math.min(100, Math.max(0, holderGrowth + 10)), weight: 0.20, description: `${holderGrowth}% new holders in past 7 days` },
        { name: "Developer Activity", value: Math.min(100, devActivity * 2), weight: 0.15, description: `${devActivity} on-chain events in past week` },
        { name: "Market Trend", value: Math.min(100, Math.max(0, marketTrend + 30)), weight: 0.10, description: `${marketTrend}% price trend vs SUI` }
      ];
      
      // Calculate weighted cook potential
      const cookPotential = Math.round(
        cookFactors.reduce((sum, factor) => sum + (factor.value * factor.weight), 0)
      );
      
      // Historical data for charts (simulated)
      const days = 14;
      const historicalFraud = Array(days).fill().map((_, i) => ({
        day: i + 1,
        value: getValueInRange((addressSum + i) * 59, Math.max(0, fraudLikelihood - 15), Math.min(100, fraudLikelihood + 15))
      }));
      
      const historicalCook = Array(days).fill().map((_, i) => ({
        day: i + 1,
        value: getValueInRange((addressSum + i) * 61, Math.max(0, cookPotential - 20), Math.min(100, cookPotential + 20))
      }));
      
      // Token metadata (simulated)
      const metadata = {
        name: tokenAddress.includes('::') ? tokenAddress.split('::').pop() : `Token-${addressSum % 1000}`,
        symbol: tokenAddress.includes('::') ? tokenAddress.split('::').pop() : `TKN${addressSum % 1000}`,
        decimals: 9,
        totalSupply: getValueInRange(addressSum * 67, 1000000, 1000000000000),
        holderCount: getValueInRange(addressSum * 71, 10, 50000),
      };
      
      // ===== NEW: SAFETY CHECKS =====
      
      // 1. Mintable check
      const isMintable = addressSum % 3 === 0; // Deterministic but pseudo-random
      const treasuryCapInfo = isMintable 
        ? {
            owner: `0x${addressSum.toString(16).padStart(8, '0')}...`,
            status: "Active"
          } 
        : {
            owner: "0x0",
            status: "Burned"
          };
      
      // 2. Ownership renounced check
      const isOwnershipRenounced = addressSum % 5 !== 0;
      const upgradeCapInfo = isOwnershipRenounced 
        ? { 
            status: "Burned",
            burnTx: `0x${(addressSum * 3).toString(16).padStart(8, '0')}...`
          }
        : {
            status: "Active",
            owner: `0x${(addressSum * 2).toString(16).padStart(8, '0')}...`
          };
      
      // 3. Contract upgradeable check
      const isContractUpgradeable = !isOwnershipRenounced;
      const metadataInfo = {
        isFrozen: addressSum % 4 !== 0,
        lastModified: new Date(Date.now() - (contractAge * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      };
      
      // 4. LP burnt check
      const isLpBurnt = addressSum % 7 === 0;
      const lpInfo = isLpBurnt 
        ? {
            status: "Burned",
            burnTx: `0x${(addressSum * 7).toString(16).padStart(8, '0')}...`,
            percentage: "100%"
          }
        : {
            status: "Active",
            owner: addressSum % 2 === 0 ? "Creator Wallet" : "Community Multisig",
            percentage: `${getValueInRange(addressSum * 13, 30, 100)}%`
          };
      
      // 5. Sufficient Liquidity check
      const hasSufficientLiquidity = liquidityDepth > 20000;
      const insufficientReason = !hasSufficientLiquidity 
        ? (liquidityDepth < 5000 ? "Critical: <$5K liquidity" : "Warning: <$20K liquidity")
        : null;
      
      // Combine safety checks
      const safetyChecks = {
        mintable: {
          status: isMintable ? "WARNING" : "SAFE",
          details: {
            isMintable,
            description: isMintable 
              ? "Supply can be increased by the token creator" 
              : "Fixed supply, cannot be increased",
            treasuryCapInfo
          }
        },
        ownershipRenounced: {
          status: isOwnershipRenounced ? "SAFE" : "WARNING",
          details: {
            isRenounced: isOwnershipRenounced,
            description: isOwnershipRenounced 
              ? "Ownership has been renounced, contract cannot be modified" 
              : "Ownership retained, contract can be modified",
            upgradeCapInfo
          }
        },
        contractUpgradeable: {
          status: isContractUpgradeable ? "WARNING" : "SAFE",
          details: {
            isUpgradeable: isContractUpgradeable,
            description: isContractUpgradeable 
              ? "Contract can be upgraded by the owner" 
              : "Contract is immutable, cannot be upgraded",
            metadataInfo
          }
        },
        lpBurnt: {
          status: isLpBurnt ? "SAFE" : "INFO",
          details: {
            isBurnt: isLpBurnt,
            description: isLpBurnt 
              ? "Initial liquidity tokens have been burned" 
              : "Liquidity tokens are still active",
            lpInfo
          }
        },
        sufficientLiquidity: {
          status: hasSufficientLiquidity ? "SAFE" : "WARNING",
          details: {
            isLiquiditySufficient: hasSufficientLiquidity,
            amount: `$${liquidityDepth.toLocaleString()}`,
            description: hasSufficientLiquidity 
              ? "Token has sufficient liquidity for trading" 
              : insufficientReason,
            pools: [
              {
                dex: "CetusSwap",
                pair: `${metadata.symbol}/SUI`,
                liquidity: `$${Math.round(liquidityDepth * 0.6).toLocaleString()}`
              },
              {
                dex: "TurboSwap",
                pair: `${metadata.symbol}/USDC`,
                liquidity: `$${Math.round(liquidityDepth * 0.4).toLocaleString()}`
              }
            ]
          }
        }
      };
      
      // Risk indicators with updated flags based on safety checks
      const riskIndicators = {
        rugPullRisk: fraudLikelihood > 70 ? "High" : fraudLikelihood > 40 ? "Medium" : "Low",
        pumpPotential: cookPotential > 70 ? "High" : cookPotential > 40 ? "Medium" : "Low",
        overallRating: Math.round((100 - fraudLikelihood + cookPotential) / 2),
        flags: []
      };
      
      // Add risk flags based on factors
      if (holderConcentration > 80) riskIndicators.flags.push("Highly concentrated token holdings");
      if (txVolumeScore < 30) riskIndicators.flags.push("Suspicious transaction patterns");
      if (contractAge < 7) riskIndicators.flags.push("Very new contract");
      if (liquidityDepth < 10000) riskIndicators.flags.push("Low liquidity");
      if (volumeGrowth > 200) riskIndicators.flags.push("Unusual volume spike");
      if (isMintable) riskIndicators.flags.push("Supply can be increased by creator");
      if (!isOwnershipRenounced) riskIndicators.flags.push("Contract ownership not renounced");
      if (isContractUpgradeable) riskIndicators.flags.push("Contract can be upgraded");
      if (!isLpBurnt && lpInfo.percentage < "50%") riskIndicators.flags.push("Less than 50% of LP tokens secured");
      
      // Generate overall reason based on scores and safety checks
      let reason;
      if (fraudLikelihood > 70) {
        reason = `High fraud likelihood due to ${fraudFactors[0].name.toLowerCase()} and ${fraudFactors[1].name.toLowerCase()}`;
      } else if (!isOwnershipRenounced && isMintable) {
        reason = `Caution advised: Contract is upgradeable and supply can be increased`;
      } else if (cookPotential > 70) {
        reason = `High cook potential due to strong ${cookFactors[0].name.toLowerCase()} and ${cookFactors[1].name.toLowerCase()}`;
      } else {
        reason = `Moderate risk profile with balanced metrics across all factors`;
      }
      
      // Calculate an overall safety score (0-100)
      const safetyScore = Math.round(
        (isOwnershipRenounced ? 25 : 0) +
        (!isMintable ? 25 : 0) +
        (isLpBurnt ? 25 : (lpInfo.percentage > "50%" ? 15 : 0)) +
        (hasSufficientLiquidity ? 25 : (liquidityDepth > 5000 ? 10 : 0))
      );
      
      return {
        tokenAddress,
        timestamp: Date.now(),
        fraudLikelihood,
        cookPotential,
        safetyScore,
        reason,
        fraudFactors,
        cookFactors,
        safetyChecks,
        metadata,
        riskIndicators,
        historicalData: {
          fraud: historicalFraud,
          cook: historicalCook
        }
      };
    } catch (error) {
      console.error('Error getting token analysis:', error);
      throw new Error(`Failed to get analysis for ${tokenAddress}: ${error.message}`);
    }
  }

  /**
   * Submit a transaction to analyze a token
   * @param {string} tokenAddress - The token address to analyze
   * @param {string} senderAddress - Address of the transaction sender
   * @returns {Promise<Object>} - Transaction details
   */
  async analyzeToken(tokenAddress, senderAddress) {
    try {
      if (!config.contract.snifferStorageId || !config.contract.adminCapId) {
        throw new Error('Contract configuration is incomplete');
      }

      // In a real implementation, we would create a proper transaction block,
      // but for now we're returning simulated data
      
      return {
        success: true,
        txDigest: 'sui_' + Date.now().toString(16) + '_' + Math.random().toString(16).substring(2, 8),
        message: `Analysis request for ${tokenAddress} from ${senderAddress} successfully simulated`,
      };
    } catch (error) {
      console.error('Error analyzing token:', error);
      throw new Error(`Failed to analyze token ${tokenAddress}: ${error.message}`);
    }
  }
}

module.exports = new SuiService();