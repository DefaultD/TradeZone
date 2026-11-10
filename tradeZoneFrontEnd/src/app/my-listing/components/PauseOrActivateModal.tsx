"use client";

import { useState } from "react";
import axiosInstance from "@/app/api/axiosInstance";
import { Pause, Play } from "lucide-react";

interface ModalProps {
  open: boolean;
  listingId: number;
  mode: "pause" | "activate"; // 🔥 define a ação
  onClose: () => void;
  onUpdated?: () => void; // callback para refetch no pai
}

export default function PauseOrActivateModal({
  open,
  listingId,
  mode,
  onClose,
  onUpdated,
}: ModalProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  // 🔥 Textos e configs dinâmicos
  const isPause = mode === "pause";
  const icon = isPause ? <Pause size={34} className="text-primary" /> : <Play size={34} className="text-primary" />;
  const title = isPause ? "Pausar Anúncio" : "Ativar Anúncio";
  const desc = isPause
    ? "Tem certeza que deseja pausar este anúncio? Ele ficará invisível no marketplace até ser reativado."
    : "Tem certeza que deseja ativar este anúncio? Ele voltará a aparecer para todos os usuários.";
  const buttonText = isPause ? "Confirmar pausa" : "Confirmar ativação";
  const loadingText = isPause ? "Pausando..." : "Ativando...";

  const endpoint = isPause
    ? `/listings/${listingId}/pause`
    : `/listings/${listingId}/activate`;

  const handleAction = async () => {
    try {
      setLoading(true);

      await axiosInstance.patch(endpoint);

      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(`Erro ao ${isPause ? "pausar" : "ativar"} anúncio:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card rounded-2xl p-8 w-full max-w-md shadow-xl border border-border">

        {/* ICON */}
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-semibold text-center mb-2">
          {title}
        </h2>

        {/* DESCRIPTION */}
        <p className="text-center text-muted-foreground mb-6">
          {desc}
        </p>

        {/* BUTTONS */}
        <div className="flex items-center justify-between gap-3">

          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-border hover:bg-muted transition font-medium"
          >
            Cancelar
          </button>

          <button
            onClick={handleAction}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? loadingText : (
              <>
                <span className="text-lg">✔</span> {buttonText}
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
