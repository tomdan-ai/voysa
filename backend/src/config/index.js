const dotenv = require('dotenv');
dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  // Group all Sui-related config under a 'sui' object
  sui: {
    network: process.env.SUI_NETWORK || 'testnet',
    rpcUrl: process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443',
  },
  
  contract: {
    address: process.env.CONTRACT_ADDRESS,
    snifferStorageId: process.env.SNIFFER_STORAGE_ID,
    adminCapId: process.env.ADMIN_CAP_ID
  }
};

// Load test config when in test environment
if (process.env.NODE_ENV === 'test') {
  try {
    const testConfig = require('./test');
    // Merge configuration
    Object.assign(config, testConfig);
  } catch (error) {
    console.warn('Test configuration not found, using default config');
  }
}

module.exports = config;