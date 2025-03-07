import React from 'react';

interface Token {
  tokenId: string;
  name: string;
  symbol: string;
  category: string;
  contractAddress: string;
  description: string;
  launchTimestamp: number;
  websiteUrl: string;
}

interface TokenCardProps {
  token: Token;
}

export default function TokenCard({ token }: TokenCardProps) {
  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Truncate long text
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold">{token.name}</h3>
          <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
            ${token.symbol}
          </span>
        </div>
        <span className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
          {token.category}
        </span>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
        {token.description || 'No description available'}
      </p>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        <div className="flex justify-between mb-1">
          <span>Contract:</span>
          <code className="font-mono">{truncateAddress(token.contractAddress)}</code>
        </div>
        <div className="flex justify-between">
          <span>Launched:</span>
          <span>{formatDate(token.launchTimestamp)}</span>
        </div>
      </div>
      
      {token.websiteUrl && (
        <a 
          href={token.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center mt-4 text-blue-600 dark:text-blue-400 text-sm hover:underline"
        >
          Visit Website
        </a>
      )}
    </div>
  );
}