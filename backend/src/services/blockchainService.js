const EventEmitter = require('events');

class BlockchainService {
  constructor() {
    this.eventEmitter = new EventEmitter();
    this.contractAddress = process.env.CONTRACT_ADDRESS || '0x6b853ba0dde9b4471abf5302bcbbd5679c15ea31859494f94b3c4336880e664a';
    this.registryId = process.env.REGISTRY_ID || '0x0c4bc0f7e3ce32cb265270308ec6125a5e2b3659614fde4545914e3a9a6e227f';
    this.listeners = [];
    
    console.log(`Initialized BlockchainService with contract: ${this.contractAddress}`);
    console.log(`Registry ID: ${this.registryId}`);
    
    // Start simulating events for development
    this.simulateEvents();
  }
  
  // Subscribe to token events
  subscribeToTokenEvents(callback) {
    console.log('Adding event listener for token events');
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
      console.log('Removed event listener');
    };
  }
  
  // Simulate blockchain events for development
  simulateEvents() {
    console.log('Starting event simulation for development');
    
    // Emit a random token event every 15-30 seconds
    setInterval(() => {
      if (this.listeners.length > 0) {
        const tokenEvent = this.generateMockTokenEvent();
        console.log('Simulating token event:', tokenEvent);
        this.listeners.forEach(listener => listener(tokenEvent));
      }
    }, Math.random() * 15000 + 15000);
  }
  
  // Generate a mock token event
  generateMockTokenEvent() {
    const categories = ['DeFi', 'Gaming', 'NFT', 'Infrastructure', 'Social'];
    const names = [
      'Sui Finance', 'MoveX', 'SuiSwap', 'BlockRush', 'CryptoKitties',
      'DeFi Kingdom', 'SuiLend', 'MoveMarket', 'SuiNFT', 'CryptoBlades'
    ];
    const suffixes = ['Protocol', 'Token', 'Finance', 'Network', 'DAO', 'App'];
    
    const randomName = `${names[Math.floor(Math.random() * names.length)]} ${
      suffixes[Math.floor(Math.random() * suffixes.length)]
    }`;
    
    const symbol = randomName
      .split(' ')
      .map((word) => word[0])
      .join('');
    
    return {
      tokenId: `token-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: randomName,
      symbol: symbol,
      category: categories[Math.floor(Math.random() * categories.length)],
      contractAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
      description: `${randomName} is a new token on the Sui blockchain.`,
      launchTimestamp: Date.now(),
      websiteUrl: `https://www.${randomName.toLowerCase().replace(/\s/g, '')}.io`,
    };
  }
}

module.exports = new BlockchainService();