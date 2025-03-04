#!/bin/bash
# filepath: /home/kingtom/Documents/blockchain/voysa/scripts/contracts.sh

set -e

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directories
CONTRACT_DIR="$(cd "$(dirname "$0")/.." && pwd)/contracts"
BUILD_DIR="$(cd "$(dirname "$0")/.." && pwd)/build"

# Function to display usage information
show_help() {
  echo -e "${BLUE}Voysa Smart Contract Management Script${NC}"
  echo
  echo "Usage: $0 [command]"
  echo
  echo "Commands:"
  echo "  compile        Compile all smart contracts"
  echo "  deploy [env]   Deploy contracts to specified environment (default: development)"
  echo "  test           Run contract tests"
  echo "  verify [addr]  Verify contract on block explorer"
  echo "  clean          Remove build artifacts"
  echo "  help           Show this help message"
}

# Function to compile contracts
compile_contracts() {
  echo -e "${BLUE}Compiling smart contracts...${NC}"
  # Replace with your actual compilation command, e.g.:
  # npx hardhat compile
  # or
  # npx truffle compile
  
  echo -e "${GREEN}Contracts compiled successfully!${NC}"
}

# Function to deploy contracts
deploy_contracts() {
  local env=${1:-development}
  echo -e "${BLUE}Deploying contracts to ${env}...${NC}"
  # Replace with your actual deployment command, e.g.:
  # npx hardhat run scripts/deploy.js --network $env
  # or
  # npx truffle migrate --network $env
  
  echo -e "${GREEN}Deployment completed!${NC}"
}

# Function to run tests
run_tests() {
  echo -e "${BLUE}Running contract tests...${NC}"
  # Replace with your actual test command, e.g.:
  # npx hardhat test
  # or
  # npx truffle test
  
  echo -e "${GREEN}Tests completed!${NC}"
}

# Function to verify contracts
verify_contract() {
  local contract_address=$1
  
  if [ -z "$contract_address" ]; then
    echo -e "${RED}Error: Contract address required for verification${NC}"
    exit 1
  fi
  
  echo -e "${BLUE}Verifying contract at address ${contract_address}...${NC}"
  # Replace with your actual verification command, e.g.:
  # npx hardhat verify --network mainnet $contract_address
  
  echo -e "${GREEN}Verification completed!${NC}"
}

# Function to clean build artifacts
clean_build() {
  echo -e "${BLUE}Cleaning build artifacts...${NC}"
  rm -rf "${BUILD_DIR}"
  mkdir -p "${BUILD_DIR}"
  echo -e "${GREEN}Build directory cleaned!${NC}"
}

# Main execution
case "$1" in
  compile)
    compile_contracts
    ;;
  deploy)
    deploy_contracts "$2"
    ;;
  test)
    run_tests
    ;;
  verify)
    verify_contract "$2"
    ;;
  clean)
    clean_build
    ;;
  help|*)
    show_help
    ;;
esac