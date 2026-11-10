"use client";

import Image from "next/image";

interface Listing {
  id: number;
  title: string;
  price: number;
  rarity: string;
  condition: string;
  language: string;
  game: string;
  thumbnail?: string | null; // URL do S3
}

export default function ProfileListings({ listings }: { listings: Listing[] }) {
  if (!listings || listings.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        Nenhum anúncio disponível.
      </p>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map((l) => {
        // 🔥 URL DA IMAGEM (fallback automático)
        const imageSrc =
          l.thumbnail && l.thumbnail.length > 5
            ? l.thumbnail
            : "/defaults/default-card.png";

        return (
          <div
            key={l.id}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
          >
            {/* Imagem da carta */}
            <div className="relative w-full h-40 rounded-md overflow-hidden bg-black/20">
              <Image
                src={imageSrc}
                alt={l.title}
                fill
                sizes="100%"
                priority={false}
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/defaults/default-card.png";
                }}
              />
            </div>

            {/* Conteúdo */}
            <div className="mt-3 space-y-1">
              <p className="font-semibold truncate">{l.title}</p>
              <p className="text-red-400 font-bold">
                R$ {l.price.toLocaleString("pt-BR")}
              </p>

              {/* Badges estilizados */}
              <div className="flex gap-2 flex-wrap mt-2">
                <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 border border-white/20">
                  {l.rarity}
                </span>

                <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 border border-white/20">
                  {l.condition}
                </span>

                <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 border border-white/20">
                  {l.language}
                </span>

                <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 border border-white/20">
                  {l.game}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
