"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, MessageCircle } from "lucide-react";

interface Review {
  id: number;
  user: string;
  avatar?: string;
  rating: number;
  date: string;
  text: string;
}

interface Props {
  userId: number;
  reviews: Review[];
  summary: {
    rating: number;
    rating_count: number;
    breakdown: Record<number, number>;
  };
}

export default function ProfileReviews({ userId, reviews, summary }: Props) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  return (
    <div className="space-y-8">
      
      {/* ⭐ RESUMO */}
      <div className="grid md:grid-cols-[1fr_1.5fr] gap-8">

        {/* nota média */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold">
            {summary.rating.toFixed(1)}
            <span className="text-lg text-slate-400">/5</span>
          </p>

          <div className="flex justify-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(summary.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-600"
                }`}
              />
            ))}
          </div>

          <p className="text-xs mt-2 text-slate-400">
            {summary.rating_count} avaliações
          </p>
        </div>

        {/* barras laterais */}
        <div className="space-y-1.5">
          {[5,4,3,2,1].map((n) => {
            const count = summary.breakdown[n] ?? 0;
            const percent = (count / summary.rating_count) * 100;

            return (
              <div key={n} className="flex items-center gap-2 text-xs">
                <div className="w-10 flex items-center gap-1">
                  <span>{n}</span>
                  <Star className="h-3 w-3" />
                </div>

                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <span className="w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* LISTA DE REVIEWS */}
      <div className="space-y-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={r.avatar || "https://placehold.co/80x80"}
                    alt={r.user}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>

                <div>
                  <p className="font-medium">{r.user}</p>

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < r.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <span className="text-xs text-slate-400">{r.date}</span>
            </div>

            <p className="text-sm text-slate-200">{r.text}</p>
          </div>
        ))}
      </div>

      {/* FORM AVALIAÇÃO */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <h3 className="text-sm font-semibold">Deixar Avaliação</h3>
        <p className="text-xs text-slate-400 mb-3 mt-1">
          Somente usuários que já negociaram podem deixar avaliações.
        </p>

        <div className="flex gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => {
            const v = i + 1;

            return (
              <button key={v} onClick={() => setRating(v)}>
                <Star
                  className={`h-5 w-5 ${
                    v <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-600"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <textarea
          className="w-full bg-black/40 p-3 rounded-xl border border-white/10 text-sm outline-none focus:border-red-500"
          placeholder="Escreva sua avaliação..."
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-full flex items-center gap-2 text-sm">
          <MessageCircle size={16} />
          Enviar Avaliação
        </button>
      </div>
    </div>
  );
}
