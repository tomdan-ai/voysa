const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./models');
const tokenRoutes = require('./routes/tokenRoutes');
const eventRoutes = require('./routes/eventRoutes');
const blockchainService = require('./services/blockchainService');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Voysa Backend is running!');
});

// API Routes
app.use('/api/tokens', tokenRoutes);
app.use('/api/events', eventRoutes);

// Database sync and server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // In production, you might want to use {force: false}
    await db.sequelize.sync({ force: true });
    console.log('Database synchronized');
    
    // Add sample data for testing
    await seedSampleData();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

// Function to seed sample data for development
const seedSampleData = async () => {
  try {
    const sampleTokens = [
      {
        tokenId: 'token-001',
        name: 'SuiSwap',
        symbol: 'SSWP',
        category: 'DeFi',
        contractAddress: '0x123456789abcdef123456789abcdef123456789a',
        description: 'A decentralized exchange on Sui blockchain.',
        launchTimestamp: Date.now() - 3600000, // 1 hour ago
        websiteUrl: 'https://suiswap.io'
      },
      {
        tokenId: 'token-002',
        name: 'MoveX Gaming',
        symbol: 'MVX',
        category: 'Gaming',
        contractAddress: '0x234567890abcdef234567890abcdef234567890b',
        description: 'Gaming platform built on the Sui blockchain.',
        launchTimestamp: Date.now() - 7200000, // 2 hours ago
        websiteUrl: 'https://movex.games'
      },
      {
        tokenId: 'token-003',
        name: 'SuiNFT Marketplace',
        symbol: 'SNFT',
        category: 'NFT',
        contractAddress: '0x345678901abcdef345678901abcdef345678901c',
        description: 'NFT marketplace for digital collectibles on Sui.',
        launchTimestamp: Date.now() - 10800000, // 3 hours ago
        websiteUrl: 'https://suinft.market'
      }
    ];

    await db.Token.bulkCreate(sampleTokens);
    console.log('Sample data seeded successfully');
  } catch (error) {
    console.error('Error seeding sample data:', error);
  }
};

// Start the server
startServer();