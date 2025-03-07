// lib/types.ts
export interface TokenData {
  name: string;
  symbol: string;
  price: number | null;
  marketCap: number | null;
  supply: number | null;
  holders: number | null;
  safetyScore: string;
}