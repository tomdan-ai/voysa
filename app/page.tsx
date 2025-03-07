// app/page.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import TokenResult from "@/components/TokenResult";
import { TokenData } from "@/lib/types";

export default function Home() {
  const [tokenType, setTokenType] = useState<string>("");
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTokenData(null);

    try {
      if (!tokenType.includes("::")) {
        throw new Error("Please enter a valid SUI token type (e.g., 0x2::sui::SUI)");
      }

      const response = await fetch(`/api/token/data?tokenType=${encodeURIComponent(tokenType)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch token data");

      setTokenData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-800">
      <h1 className="text-5xl font-bold mb-8 text-orange-300 drop-shadow-lg tracking-wider">
        SUI Token Checker 🔥
      </h1>
      <form onSubmit={handleSubmit} className="w-full max-w-lg flex gap-4 mb-8">
        <Input
          type="text"
          placeholder="Enter SUI token type (e.g., 0x2::sui::SUI)"
          value={tokenType}
          onChange={(e) => setTokenType(e.target.value)}
          className="flex-1 bg-gray-700 text-white placeholder-gray-400 border-2 border-teal-400 focus:border-orange-300 rounded-lg p-2"
        />
        <Button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-orange-500 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <LoaderCircle className="w-5 h-5 animate-spin" /> Yo, Checking...
            </>
          ) : (
            "Check It!"
          )}
        </Button>
      </form>

      {error && (
        <p className="text-red-400 bg-gray-900 p-2 rounded-lg mb-4">{error}</p>
      )}
      {tokenData && <TokenResult data={tokenData} />}
    </main>
  );
}