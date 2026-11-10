"use client";

import { useState } from "react";
import axiosInstance from "@/app/api/axiosInstance";
import { Trash2 } from "lucide-react";

interface DeleteListingModalProps {
  open: boolean;
  listingId: number;
  onClose: () => void;
  onDeleted?: () => void; // callback para refetch na página pai
}

export default function DeleteListingModal({
  open,
  listingId,
  onClose,
  onDeleted,
}: DeleteListingModalProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);

      await axiosInstance.delete(`/listings/${listingId}`);

      onDeleted?.();
      onClose();
    } catch (err) {
      console.error("Erro ao deletar anúncio:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card rounded-2xl p-8 w-full max-w-md shadow-xl border border-border">
        
        {/* ICON */}
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-destructive/10">
          <Trash2 size={34} className="text-destructive" />
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-semibold text-center mb-2">
          Deletar Anúncio
        </h2>

        {/* DESCRIPTION */}
        <p className="text-center text-muted-foreground mb-6">
          Você tem certeza que gostaria de deletar este anúncio? Esta ação não poderá ser desfeita.
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
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-destructive text-white hover:bg-destructive/90 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Deletando..." : (
              <>
                <span className="text-lg">🗑</span> Confirmar exclusão
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
