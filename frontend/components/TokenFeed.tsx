import React, { useState, useEffect } from 'react';
import TokenCard from './TokenCard';

interface Token {
  id: string;
  tokenId: string;
  name: string;
  symbol: string;
  category: string;
  contractAddress: string;
  description: string;
  launchTimestamp: number;
  websiteUrl: string;
}

export default function TokenFeed() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        const url = filter 
          ? `http://localhost:5000/api/tokens?category=${filter}` 
          : 'http://localhost:5000/api/tokens';
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tokens');
        }
        
        const data = await response.json();
        setTokens(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load tokens. Please try again later.');
        setLoading(false);
        console.error('Error fetching tokens:', err);
      }
    };

    fetchTokens();
  }, [filter]);

  // Set up SSE for real-time updates
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:5000/api/events/sse');
    
    eventSource.onmessage = (event) => {
      try {
        const eventData = JSON.parse(event.data);
        
        if (eventData.type === 'new_token') {
          // Add new token to the list if it matches the current filter
          const newToken = eventData.data;
          
          if (!filter || newToken.category === filter) {
            setTokens(prevTokens => [newToken, ...prevTokens]);
          }
        }
      } catch (err) {
        console.error('Error processing SSE event:', err);
      }
    };
    
    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [filter]);

  const handleFilterChange = (category: string) => {
    setFilter(category);
  };

  if (loading) return <div className="flex justify-center p-8">Loading tokens...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => handleFilterChange('')}
          className={`px-4 py-2 rounded-full ${filter === '' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
        <button 
          onClick={() => handleFilterChange('DeFi')}
          className={`px-4 py-2 rounded-full ${filter === 'DeFi' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          DeFi
        </button>
        <button 
          onClick={() => handleFilterChange('Gaming')}
          className={`px-4 py-2 rounded-full ${filter === 'Gaming' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Gaming
        </button>
        <button 
          onClick={() => handleFilterChange('NFT')}
          className={`px-4 py-2 rounded-full ${filter === 'NFT' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          NFTs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens.length > 0 ? (
          tokens.map((token) => (
            <TokenCard key={token.tokenId} token={token} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No tokens found</p>
        )}
      </div>
    </div>
  );
}