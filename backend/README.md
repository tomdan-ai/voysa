# SuiDegenSniffer Backend

Backend service for the SuiDegenSniffer application that analyzes tokens on the Sui blockchain.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your contract information:
   - Contract Address
   - Sniffer Storage Object ID
   - Admin Cap Object ID

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

- `GET /api/analyzer/token/:tokenAddress` - Get analysis for a token
- `POST /api/analyzer/analyze` - Submit a token for analysis

## Configuration

Edit the `.env` file to configure:
- Sui network (testnet/mainnet)
- RPC URL
- Contract details
- Server port