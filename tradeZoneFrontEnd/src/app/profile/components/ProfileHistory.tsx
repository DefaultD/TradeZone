import Image from "next/image";
import { DollarSign, Repeat2 } from "lucide-react";

interface HistoryItem {
  id: number;
  type: "venda" | "troca";
  title: string;
  date: string;
  price?: number;
  tradedFor?: string;
  partnerLabel: string;
  partnerName: string;
}

interface Props {
  history: HistoryItem[];
}

export default function ProfileHistory({ history }: Props) {
  return (
    <div className="space-y-4">

      <h2 className="text-sm font-semibold text-slate-200">
        Transações Recentes
      </h2>

      {history.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-slate-400 text-sm">
            Nenhuma transação ainda. As vendas e trocas completadas aparecerão aqui.
          </p>
        </div>
      ) : (
        history.map((h) => (
        <div
          key={h.id}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center"
        >

          {/* ESQUERDA */}
          <div className="flex gap-3 items-center">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white/10">
              <Image
                src="https://images.pexels.com/photos/1796794/pexels-photo-1796794.jpeg"
                alt={h.title}
                fill
                className="object-cover"
              />
            </div>

            <div>
              <p className="font-semibold">{h.title}</p>
              <p className="text-xs text-slate-400">{h.date}</p>

              {h.type === "venda" ? (
                <p className="text-xs mt-1">
                  Vendido por{" "}
                  <span className="font-semibold text-emerald-400">
                    R$ {h.price?.toLocaleString("pt-BR")}
                  </span>{" "}
                  — {h.partnerLabel}: <span>{h.partnerName}</span>
                </p>
              ) : (
                <p className="text-xs mt-1">
                  Trocado por{" "}
                  <span className="font-semibold text-sky-400">
                    {h.tradedFor}
                  </span>{" "}
                  — {h.partnerLabel}: <span>{h.partnerName}</span>
                </p>
              )}
            </div>
          </div>

          {/* ETIQUETA */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              h.type === "venda"
                ? "bg-red-600/20 text-red-300 flex items-center gap-1"
                : "bg-sky-600/20 text-sky-300 flex items-center gap-1"
            }`}
          >
            {h.type === "venda" ? (
              <>
                <DollarSign size={14} /> Venda
              </>
            ) : (
              <>
                <Repeat2 size={14} /> Troca
              </>
            )}
          </span>
        </div>
      ))
      )}
    </div>
  );
}
