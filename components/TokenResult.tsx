// components/TokenResult.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenData } from "@/lib/types";

interface TokenResultProps {
  data: TokenData;
}

export default function TokenResult({ data }: TokenResultProps) {
  return (
    <Card className="w-full max-w-lg card-retro rounded-lg p-4">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-teal-300">
          {data.name} ({data.symbol})
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-lg">
        <div className="grid grid-cols-2 gap-2">
          <span className="font-semibold text-purple-300">Price:</span>
          <span className="text-white">
            {data.price ? `$${data.price.toFixed(2)}` : "N/A"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <span className="font-semibold text-purple-300">Market Cap:</span>
          <span className="text-white">
            {data.marketCap ? `$${data.marketCap.toLocaleString()}` : "N/A"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <span className="font-semibold text-purple-300">Total Supply:</span>
          <span className="text-white">
            {data.supply ? data.supply.toLocaleString() : "N/A"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <span className="font-semibold text-purple-300">Holders:</span>
          <span className="text-white">
            {data.holders ? data.holders.toLocaleString() : "N/A"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <span className="font-semibold text-purple-300">Safety Score:</span>
          <span
            className={
              data.safetyScore === "Low Risk"
                ? "text-green-400 font-bold"
                : "text-red-400 font-bold"
            }
          >
            {data.safetyScore}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}