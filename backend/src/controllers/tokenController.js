const { Token } = require('../models');
const blockchainService = require('../services/blockchainService');

// Get all tokens with optional category filter
exports.getAllTokens = async (req, res) => {
  try {
    const { category } = req.query;
    
    const whereClause = category ? { category } : {};
    
    const tokens = await Token.findAll({
      where: whereClause,
      order: [['launchTimestamp', 'DESC']]
    });
    
    res.json(tokens);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
};

// Get a token by ID
exports.getTokenById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const token = await Token.findOne({
      where: { tokenId: id }
    });
    
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }
    
    res.json(token);
  } catch (error) {
    console.error(`Error fetching token ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch token' });
  }
};

// Emit a token launch event on the blockchain
exports.emitTokenLaunch = async (req, res) => {
  try {
    const { name, symbol, category } = req.body;
    
    if (!name || !symbol || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // For now, we'll handle this with a mock implementation
    console.log(`Emitting token launch: ${name} (${symbol}) - ${category}`);
    
    // Create the token in the database
    const token = await Token.create({
      tokenId: `token-${Date.now()}`,
      name,
      symbol,
      category,
      contractAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
      description: `${name} is a new token on the Sui blockchain.`,
      launchTimestamp: Date.now(),
      websiteUrl: '',
    });
    
    // In a real implementation, we would call the blockchain service
    // to emit an event on the blockchain
    
    res.status(201).json({ 
      success: true,
      message: 'Token launch simulated successfully',
      token
    });
  } catch (error) {
    console.error('Error emitting token launch:', error);
    res.status(500).json({ error: 'Failed to emit token launch' });
  }
};