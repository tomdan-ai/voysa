const blockchainService = require('../services/blockchainService');
const { Token } = require('../models');

// Handle SSE connections
exports.sseConnection = (req, res) => {
  console.log('New SSE connection established');
  
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send initial message
  res.write(`data: ${JSON.stringify({ type: 'connection', message: 'Connected to Voysa events' })}\n\n`);
  
  // Subscribe to token events
  const unsubscribe = blockchainService.subscribeToTokenEvents(async (tokenData) => {
    try {
      console.log('Processing token event:', tokenData);
      
      // Save token to database if it doesn't exist
      const [token, created] = await Token.findOrCreate({
        where: { tokenId: tokenData.tokenId },
        defaults: tokenData
      });
      
      // Send event to client
      const eventData = {
        type: 'token',
        action: created ? 'created' : 'updated',
        data: token
      };
      
      res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    } catch (error) {
      console.error('Error processing token event:', error);
    }
  });
  
  // Handle disconnection
  req.on('close', () => {
    console.log('SSE connection closed');
    unsubscribe();
  });
};