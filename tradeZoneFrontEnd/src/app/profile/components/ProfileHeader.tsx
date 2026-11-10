"use client";

import Image from "next/image";
import { MessageCircle, Heart, Share2 } from "lucide-react";
import { ProfileData } from "@/types/profile";

export default function ProfileHeader({ data }: { data: ProfileData }) {
  const { name, avatar, banner, badges } = data;

  return (
    <div className="relative w-full h-60 md:h-64">

      {/* Banner */}
      <Image
        src={banner || "/defaults/default-banner.jpg"}
        alt="Banner"
        fill
        className="object-cover opacity-80"
      />

      {/* Gradiente por cima */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

      {/* Avatar + Nome + Badges */}
      <div className="absolute -bottom-12 left-6 md:left-10 flex items-end gap-4">

        {/* Avatar */}
        <div className="relative w-24 h-24 md:w-32 md:h-32">
          <div className="absolute inset-0 bg-red-600/60 blur-lg rounded-full" />

          <Image
            src={avatar || "/defaults/default-avatar.jpg"}
            fill
            className="rounded-full border-4 border-red-600 object-cover"
            alt="Avatar"
          />
        </div>

        <div className="space-y-2 pb-4 md:pb-0">
          <h1 className="text-xl md:text-2xl font-semibold">{name}</h1>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 text-xs uppercase">
            {badges.reliable_seller && (
              <span className="rounded-full bg-red-700/80 px-3 py-1">
                Vendedor Confiável
              </span>
            )}

            {badges.verified && (
              <span className="rounded-full bg-red-700/80 px-3 py-1">
                Verificado
              </span>
            )}

            {badges.top_trader && (
              <span className="rounded-full bg-red-700/80 px-3 py-1">
                Top Trader
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botões Desktop */}
      <div className="absolute bottom-4 right-4 md:right-10 hidden md:flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-500 px-4 py-2 text-sm">
          <MessageCircle size={16} />
          Enviar Mensagem
        </button>
        <button className="p-2 rounded-full bg-white/10 hover:bg-white/20">
          <Heart size={16} />
        </button>
        <button className="p-2 rounded-full bg-white/10 hover:bg-white/20">
          <Share2 size={16} />
        </button>
      </div>

      {/* Botões Mobile */}
      <div className="absolute left-6 right-6 -bottom-28 flex md:hidden items-center gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 rounded-full bg-red-600 hover:bg-red-500 px-4 py-2 text-sm">
          <MessageCircle size={16} />
          Mensagem
        </button>

        <button className="p-2 rounded-full bg-white/10 hover:bg-white/20">
          <Heart size={16} />
        </button>

        <button className="p-2 rounded-full bg-white/10 hover:bg-white/20">
          <Share2 size={16} />
        </button>
      </div>

    </div>
  );
}
