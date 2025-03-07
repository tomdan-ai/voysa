// app/api/token/data/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenType = searchParams.get("tokenType");

  if (!tokenType || !tokenType.includes("::")) {
    return NextResponse.json({ error: "Invalid SUI token type" }, { status: 400 });
  }

  // Extract mock name and symbol from token type
  const parts = tokenType.split("::");
  const name = parts[parts.length - 1] || "Unknown";
  const symbol = name.slice(0, 4).toUpperCase();

  // Mock data
  const price = (Math.random() * 9 + 1).toFixed(2); // $1 to $10
  const supply = Math.floor(Math.random() * 999000000 + 1000000); // 1M to 1B
  const marketCap = price && supply ? (parseFloat(price) * supply).toFixed(2) : null;
  const holders = Math.floor(Math.random() * 990 + 10); // 10 to 1000
  const safetyScore = Math.random() > 0.5 ? "Low Risk" : "High Risk";

  const mockData = {
    name,
    symbol,
    price: parseFloat(price),
    marketCap: marketCap ? parseFloat(marketCap) : null,
    supply,
    holders,
    safetyScore,
  };

  return NextResponse.json(mockData);
}