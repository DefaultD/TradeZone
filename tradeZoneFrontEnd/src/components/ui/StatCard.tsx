import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  suffix?: string;
  icon?: ReactNode;
}

export default function StatCard({ label, value, suffix, icon }: StatCardProps) {
  return (
    <div className="bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-white/10">
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-lg font-semibold">
          {value}
          {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
        </p>
      </div>
      <div className="text-red-500">{icon}</div>
    </div>
  );
}
