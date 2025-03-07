const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Sui blockchain configuration
  sui: {
    network: process.env.SUI_NETWORK || 'testnet',
    rpcUrl: process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443',
  },

  // Contract information
  contract: {
    address: process.env.CONTRACT_ADDRESS,
    snifferStorageId: process.env.SNIFFER_STORAGE_ID,
    adminCapId: process.env.ADMIN_CAP_ID,
  },
};

module.exports = config;