module.exports = {
  nodeEnv: 'test',
  sui: {
    network: 'testnet',
    // We're not configuring rpcUrl for tests to avoid SDK initialization
  },
  contract: {
    address: '0xtest_contract_address',
    snifferStorageId: '0xtest_storage_id',
    adminCapId: '0xtest_admin_cap_id'
  }
};