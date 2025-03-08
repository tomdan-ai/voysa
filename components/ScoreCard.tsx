import clsx from "clsx";
import type { FC } from "react";

type ScoreCardProps = {
  title: string;
  score: number;
  description: string;
  type: "fraud" | "cook" | (string & {});
};

const ScoreCard: FC<ScoreCardProps> = ({ title, score, description, type }) => {
  return (
    <div className="bg-white  rounded-lg shadow p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-4 md:flex-col xl:flex-row md:gap-4 xl:gap-0 md:justify-center xl:justify-between">
        <h3 className="text-lg sm:text-xl md:text-2xl md:text-center xl:text-left font-semibold">
          {title}
        </h3>
        <div
          className={clsx(
            "rounded-full flex items-center justify-center text-white font-bold",
            "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20",
            "text-lg sm:text-xl md:text-2xl",
            {
              "bg-red-500":
                (type === "fraud" && score > 70) ||
                (type !== "fraud" && type !== "cook" && score <= 40),
              "bg-green-500":
                (type === "fraud" && score <= 40) ||
                (type === "cook" && score > 70) ||
                (type !== "fraud" && type !== "cook" && score > 70),
              "bg-blue-500": type === "cook" && score > 40 && score <= 70,
              "bg-gray-500": type === "cook" && score <= 40,
              "bg-yellow-500":
                (type === "fraud" && score > 40 && score <= 70) ||
                (type !== "fraud" &&
                  type !== "cook" &&
                  score > 40 &&
                  score <= 70),
            }
          )}
        >
          {+score.toFixed(2)}%
        </div>
      </div>
      <p className="text-gray-600  text-sm sm:text-base md:text-center xl:text-left">
        {description}
      </p>
    </div>
  );
};

export default ScoreCard;
