const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// SSE endpoint for real-time events
router.get('/sse', eventController.sseConnection);

module.exports = router;