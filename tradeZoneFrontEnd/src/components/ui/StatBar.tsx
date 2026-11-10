import { ReactNode } from "react";

interface StatBarProps {
  label: string;
  percent: number;
  valueLabel: string;
  icon?: ReactNode;
}

export default function StatBar({ label, percent, valueLabel, icon }: StatBarProps) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <div className="flex items-center gap-2 text-slate-300">
          {icon}
          {label}
        </div>
        <span>{valueLabel}</span>
      </div>

      <div className="h-2 bg-black/40 rounded-full overflow-hidden">
        <div className="h-full bg-red-600 rounded-full" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}
