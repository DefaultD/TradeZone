import { ReactNode } from "react";

interface StatLineProps {
  label: string;
  value: string;
  icon?: ReactNode;
}

export default function StatLine({ label, value, icon }: StatLineProps) {
  return (
    <div className="flex justify-between items-center text-xs mb-2">
      <div className="flex items-center gap-2 text-slate-300">
        {icon}
        {label}
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
