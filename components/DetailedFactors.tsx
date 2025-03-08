import clsx from "clsx";
import type { FraudFactor, CookFactor } from "@/lib/types";

interface DetailedFactorsProps {
  title: string;
  factors: FraudFactor[] | CookFactor[];
  type: "fraud" | "cook";
}

export default function DetailedFactors({
  title,
  factors,
  type,
}: DetailedFactorsProps) {
  return (
    <div className="bg-white  rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 ">{title}</h2>
      <div className="space-y-4">
        {factors.map((factor, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="font-medium text-gray-700 ">{factor.name}</span>
              <span className="text-gray-700 ">
                {+factor.value.toFixed(2)}% (Weight:{" "}
                {+(factor.weight * 100).toFixed(2)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={clsx(
                  "h-2.5 rounded-full",
                  type === "fraud" ? "bg-red-500" : "bg-blue-500"
                )}
                style={{ width: `${Math.min(100, factor.value)}%` }}
              ></div>
            </div>
            <p className="text-sm mt-1 text-gray-600 ">{factor.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
