"use client";

import type { TokenAnalysisResponse } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import DetailedFactors from "./DetailedFactors";
import HistoricalCharts from "./HistoricalCharts";
import SafetyChecks from "./SafteyChecks";
import ScoreCard from "./ScoreCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useEffect, useRef } from "react";

const TokenData = ({ token }: { token: string }) => {
  const {
    data: tokenData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["tokenData", token] as const,
    queryFn: async ({ queryKey }) => {
      if (!queryKey[1]) return null;
      const response = await fetch(
        `https://voysa-sniff.onrender.com/api/analyzer/token/${queryKey[1]}`
      );
      if (!response.ok) throw new Error("Failed to fetch token data");
      const { data } = (await response.json()) as TokenAnalysisResponse;
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    cardRef.current.scrollIntoView({
      behavior: "smooth",
    });
  }, [cardRef]);

  if (isLoading)
    return <div className="p-10 text-center ">Loading token analysis…</div>;
  if (error)
    return <div className="text-red-500 p-10">Error: {String(error)}</div>;
  if (!tokenData) return null;
  const isFraudHigherThanCook =
    tokenData.fraudLikelihood > tokenData.cookPotential;

  return (
    <Card ref={cardRef} className="app-card bg-white ">
      <CardHeader>
        <CardTitle className="text-3xl font-bold ">
          {tokenData.metadata.name} ({tokenData.metadata.symbol})
        </CardTitle>
        <CardDescription className="text-gray-500 ">
          Token Address: {tokenData.tokenAddress}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Alert */}
        <div
          className={clsx(
            "p-4 mb-8 rounded-lg text-center font-bold",
            isFraudHigherThanCook ? "bg-red-500" : "bg-green-500",
            "text-white"
          )}
        >
          {isFraudHigherThanCook
            ? `THIS TOKEN FRAUD IS ${+(
                tokenData.fraudLikelihood - tokenData.cookPotential
              ).toFixed(
                2
              )}% HIGHER THAN COOK SCORE - IT'S ONLY ${+tokenData.safetyScore.toFixed(
                2
              )}% SAFE`
            : `THIS TOKEN COOK POTENTIAL IS ${+(
                tokenData.cookPotential - tokenData.fraudLikelihood
              ).toFixed(
                2
              )}% HIGHER THAN FRAUD SCORE - IT'S ${+tokenData.safetyScore.toFixed(
                2
              )}% SAFE`}
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <ScoreCard
            title="Fraud Likelihood"
            score={tokenData.fraudLikelihood}
            description="Potential for scam or rug pull"
            type="fraud"
          />
          <ScoreCard
            title="Cook Potential"
            score={tokenData.cookPotential}
            description="Potential for price growth"
            type="cook"
          />
          <ScoreCard
            title="Safety Score"
            score={tokenData.safetyScore}
            description="Contract safety measures"
            type="safety"
          />
        </div>

        {/* Safety Checks */}
        <SafetyChecks checks={tokenData.safetyChecks} />

        {/* Detailed Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <DetailedFactors
            title="Fraud Factors"
            factors={tokenData.fraudFactors}
            type="fraud"
          />
          <DetailedFactors
            title="Cook Factors"
            factors={tokenData.cookFactors}
            type="cook"
          />
        </div>

        {/* Historical Charts */}
        <HistoricalCharts
          fraudData={tokenData.historicalData.fraud}
          cookData={tokenData.historicalData.cook}
        />

        {/* Token Metadata */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 ">Token Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-500 ">Name</p>
              <p className="font-medium ">{tokenData.metadata.name}</p>
            </div>
            <div>
              <p className="text-gray-500 ">Symbol</p>
              <p className="font-medium ">{tokenData.metadata.symbol}</p>
            </div>
            <div>
              <p className="text-gray-500 ">Total Supply</p>
              <p className="font-medium ">
                {tokenData.metadata.totalSupply.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500 ">Holders</p>
              <p className="font-medium ">
                {tokenData.metadata.holderCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenData;
