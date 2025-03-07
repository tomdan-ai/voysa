import type { ReactNode } from "react";

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

export type LayoutProps = Readonly<{
  children: ReactNode;
}>;
