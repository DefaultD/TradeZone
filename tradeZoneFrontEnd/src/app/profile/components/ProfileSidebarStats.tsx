import StatBar from "@/components/ui/StatBar";
import StatLine from "@/components/ui/StatLine";
import { TrendingUp, Clock3, Ban } from "lucide-react";

interface SidebarStats {
  response_rate: number;
  response_time: string;
  cancellations: number;
  reliability: number;
}

export default function ProfileSidebarStats({
  stats,
}: {
  stats: SidebarStats;
}) {
  return (
    <aside className="space-y-6">
      <div className="bg-white/5 rounded-2xl p-4">
        <h2 className="text-sm font-semibold uppercase text-slate-300 mb-4">
          Estatísticas
        </h2>

        <StatBar
          label="Taxa de Resposta"
          percent={stats.response_rate}
          valueLabel={`${stats.response_rate}%`}
          icon={<TrendingUp />}
        />

        <StatLine
          label="Tempo de Resposta"
          value={stats.response_time}
          icon={<Clock3 />}
        />

        <StatLine
          label="Cancelamentos"
          value={String(stats.cancellations)}
          icon={<Ban />}
        />

        <StatBar
          label="Confiabilidade"
          percent={stats.reliability}
          valueLabel={`${stats.reliability}%`}
          icon={<TrendingUp />}
        />
      </div>
    </aside>
  );
}
