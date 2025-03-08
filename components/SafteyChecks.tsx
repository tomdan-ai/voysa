import clsx from "clsx";
import type { SafetyChecks as TSafetyChecks } from "@/lib/types";
import type { FC } from "react";

type SafetyChecksProps = {
  checks: TSafetyChecks;
};

const SafetyChecks: FC<SafetyChecksProps> = ({ checks }) => {
  return (
    <div className="bg-white  rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 ">Safety Checks</h2>
      <div className="space-y-4">
        {Object.entries(checks).map(([key, check]) => (
          <div key={key} className="border-b dark:border-gray-700 pb-4 last:border-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg capitalize text-gray-700 ">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </h3>
              <span
                className={clsx(
                  "px-3 py-1 rounded text-white text-sm font-medium",
                  {
                    "bg-green-500": check.status === "SAFE",
                    "bg-yellow-500": check.status === "WARNING",
                    "bg-blue-500": check.status === "INFO",
                    "bg-gray-500": !["SAFE", "WARNING", "INFO"].includes(check.status),
                  }
                )}
              >
                {check.status}
              </span>
            </div>
            <p className="text-gray-700  mb-2">
              {check.details.description}
            </p>

            {/* Additional details specific to each check */}
            {key === "mintable" && (
              <div className="text-sm text-gray-600 ">
                Treasury Cap: {check.details.treasuryCapInfo.status}
              </div>
            )}

            {key === "ownershipRenounced" && (
              <div className="text-sm text-gray-600 ">
                Upgrade Cap: {check.details.upgradeCapInfo.status}
              </div>
            )}

            {key === "lpBurnt" && check.details.lpInfo.status === "Active" && (
              <div className="text-sm text-gray-600 ">
                LP Ownership: {check.details.lpInfo.owner} (
                {check.details.lpInfo.percentage})
              </div>
            )}

            {key === "sufficientLiquidity" && (
              <div className="text-sm text-gray-600 ">
                Total Liquidity: {check.details.amount}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SafetyChecks;
