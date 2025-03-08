import type { ReactNode } from "react";
export interface FraudFactor {
  name: string;
  value: number;
  weight: number;
  description: string;
}

export interface CookFactor {
  name: string;
  value: number;
  weight: number;
  description: string;
}

export interface SafetyCheckDetails {
  isMintable?: boolean;
  description: string;
  treasuryCapInfo?: {
    owner: string;
    status: string;
  };
  isRenounced?: boolean;
  upgradeCapInfo?: {
    status: string;
    burnTx?: string;
  };
  isUpgradeable?: boolean;
  metadataInfo?: {
    isFrozen: boolean;
    lastModified: string;
  };
  isBurnt?: boolean;
  lpInfo?: {
    status: string;
    owner: string;
    percentage: string;
  };
  isLiquiditySufficient?: boolean;
  amount?: string;
  pools?: {
    dex: string;
    pair: string;
    liquidity: string;
  }[];
}

export interface SafetyChecks {
  mintable: {
    status: string;
    details: SafetyCheckDetails;
  };
  ownershipRenounced: {
    status: string;
    details: SafetyCheckDetails;
  };
  contractUpgradeable: {
    status: string;
    details: SafetyCheckDetails;
  };
  lpBurnt: {
    status: string;
    details: SafetyCheckDetails;
  };
  sufficientLiquidity: {
    status: string;
    details: SafetyCheckDetails;
  };
}

export interface Metadata {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  holderCount: number;
}

export interface RiskIndicators {
  rugPullRisk: string;
  pumpPotential: string;
  overallRating: number;
  flags: unknown[];
}

export interface HistoricalData {
  fraud: { day: number; value: number }[];
  cook: { day: number; value: number }[];
}

export interface TokenAnalysis {
  tokenAddress: string;
  timestamp: number;
  fraudLikelihood: number;
  cookPotential: number;
  safetyScore: number;
  reason: string;
  fraudFactors: FraudFactor[];
  cookFactors: CookFactor[];
  safetyChecks: SafetyChecks;
  metadata: Metadata;
  riskIndicators: RiskIndicators;
  historicalData: HistoricalData;
}

export interface TokenAnalysisResponse {
  success: boolean;
  data: TokenAnalysis;
}

export type LayoutProps = Readonly<{
  children: ReactNode;
}>;
