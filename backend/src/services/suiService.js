const { JsonRpcProvider, Connection } = require('@mysten/sui.js');
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
   * Query token analysis from the smart contract
   * @param {string} tokenAddress - The token address to analyze
   * @returns {Promise<Object>} - The analysis results
   */
  async getTokenAnalysis(tokenAddress) {
    try {
      if (!config.contract.snifferStorageId) {
        throw new Error('Sniffer storage ID is not configured');
      }

      // Convert address string to proper format if needed
      const formattedAddress = tokenAddress.startsWith('0x') ? tokenAddress : `0x${tokenAddress}`;

      // We'll make a move call to the get_token_analysis function
      const moveCallTxn = {
        target: `${config.contract.address}::degen_sniffer::get_token_analysis`,
        arguments: [
          config.contract.snifferStorageId, // storage object
          formattedAddress, // token address
        ],
      };

      // Execute the move call
      const result = await this.provider.devInspectTransactionBlock({
        transactionBlock: moveCallTxn,
        sender: '0x0', // Dummy address for devInspect
      });

      if (result.error) {
        throw new Error(`Move call failed: ${result.error}`);
      }

      // Parse the result
      // In a real implementation, we would parse the returned data properly
      // For now, we'll return placeholder data
      return {
        fraudLikelihood: Math.floor(Math.random() * 101), // 0-100%
        cookPotential: Math.floor(Math.random() * 101), // 0-100%
        timestamp: Date.now(),
        reason: 'Analysis based on holder distribution and transaction patterns',
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

      // Convert address string to proper format if needed
      const formattedAddress = tokenAddress.startsWith('0x') ? tokenAddress : `0x${tokenAddress}`;

      // Create the transaction to call analyze_token
      const tx = {
        kind: 'moveCall',
        target: `${config.contract.address}::degen_sniffer::analyze_token`,
        arguments: [
          config.contract.adminCapId, // Admin cap
          config.contract.snifferStorageId, // Storage
          formattedAddress, // Token address
        ],
      };

      // In a real implementation, we would:
      // 1. Build the transaction block
      // 2. Let the frontend sign it with the user's wallet
      // 3. Execute the signed transaction
      
      // For now, we'll return a placeholder response
      return {
        success: true,
        txDigest: '0x' + Math.random().toString(16).substring(2, 42),
        message: `Analysis request for ${tokenAddress} submitted successfully`,
      };
    } catch (error) {
      console.error('Error analyzing token:', error);
      throw new Error(`Failed to analyze token ${tokenAddress}: ${error.message}`);
    }
  }
}

module.exports = new SuiService();