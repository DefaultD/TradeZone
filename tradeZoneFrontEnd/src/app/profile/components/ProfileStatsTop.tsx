import StatCard from "@/components/ui/StatCard";
import { Star, DollarSign, Repeat2, CalendarDays } from "lucide-react";

interface StatsProps {
  stats: {
    rating: number;        // média
    rating_count: number;  // quantidade
    listings: number;
    trades: number;
  };
  memberSince: string;
}

export default function ProfileStatsTop({ stats, memberSince }: StatsProps) {
  function formatDate(dateString?: string) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">

      {/* ⭐ Avaliação (usa rating) */}
      <StatCard
        label="Avaliação"
        value={Number(stats.rating).toFixed(1)}
        suffix="/5"
        icon={<Star className="text-black dark:text-white" />}
      />

      {/* 💲 Anúncios */}
      <StatCard
        label="Anúncios"
        value={stats.listings.toString()}
        icon={<DollarSign className="text-black dark:text-white" />}
      />

      {/* 🔁 Trocas */}
      <StatCard
        label="Trocas"
        value={stats.trades.toString()}
        icon={<Repeat2 className="text-black dark:text-white" />}
      />

      {/* 📅 Membro desde */}
      <StatCard
        label="Membro desde"
        value={formatDate(memberSince)}
        icon={<CalendarDays className="text-black dark:text-white" />}
      />

    </div>
  );
}
