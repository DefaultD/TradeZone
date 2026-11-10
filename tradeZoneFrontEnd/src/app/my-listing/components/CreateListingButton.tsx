"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateListingButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/meus-anuncios/novo")}
      className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg"
    >
      <Plus size={18} /> Criar Novo Anúncio
    </button>
  );
}
