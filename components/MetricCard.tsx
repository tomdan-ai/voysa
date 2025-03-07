import type { LucideIcon } from "lucide-react";
import type { FC } from "react";

type MetricCardProps = {
  icon: LucideIcon;
  value: string | number;
  label: string;
};

const MetricCard: FC<MetricCardProps> = ({ icon: Icon, value, label }) => {
  return (
    <div className="flex group hover:bg-primary hover:scale-105 transition-all duration-300 flex-col items-center bg-white shadow-md rounded-2xl border-solid border-slate-300/60 border p-6">
      <Icon className="size-10 group-hover:text-white" />
      <span className="text-3xl font-semibold group-hover:text-gray-100 text-gray-900 mt-2">{value}</span>
      <span className="text-gray-500 group-hover:text-white text-sm mt-1">{label}</span>
    </div>
  );
};

export default MetricCard;
