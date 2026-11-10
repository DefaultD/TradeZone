"use client";

import Image from "next/image";
import { Pencil, Pause, Trash2, Play } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useState, useCallback, useEffect } from "react";
import PauseOrActivateModal from "./PauseOrActivateModal";
import DeleteListingModal from "./DeleteListingModal";

interface ListingCardProps {
  listing: any;
  onDelete?: (id: number) => void;
  onEdit?: (listing: any) => void;
  onUpdated?: () => void; // refetch da página pai
}

export default function ListingCard({
  listing,
  onDelete,
  onEdit,
  onUpdated,
}: ListingCardProps) {
  const card = listing.cards || {};
  const isActive = listing.status === "active";
  const isPaused = listing.status === "paused";
  const images = listing.images || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"pause" | "activate">("pause");
  const [deleteModal, setDeleteModal] = useState(false);

  const [imageError, setImageError] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const fallbackImage = card.image_url ?? null;

  // Format date/time
  const createdAt = new Date(listing.created_at);
  const formattedDate = createdAt.toLocaleDateString("pt-BR");
  const formattedTime = createdAt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-2xl overflow-hidden bg-card shadow-lg transition-all border border-border hover:shadow-xl">

      {/* IMAGEM / CARROSSEL */}
      <div className="relative h-48 w-full">

        {images.length > 0 ? (
          <div className="relative h-full w-full">
            <div className="overflow-hidden h-full" ref={emblaRef}>
              <div className="flex h-full">
                {images.map((img: any, index: number) => (
                  <div
                    key={img.id}
                    className={`relative min-w-full h-48 transition-opacity duration-500 ${selectedIndex === index ? "opacity-100" : "opacity-0"
                      }`}
                  >
                    <Image
                      src={img.url}
                      alt="Listing Image"
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={scrollPrev}
                  className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full backdrop-blur-sm"
                >
                  ‹
                </button>

                <button
                  onClick={scrollNext}
                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full backdrop-blur-sm"
                >
                  ›
                </button>
              </>
            )}
          </div>
        ) : fallbackImage ? (
          <Image
            src={fallbackImage}
            alt={card.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground">Sem imagem</span>
          </div>
        )}

        {/* BADGE */}
        <span
          className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${isActive
            ? "bg-green-600 text-white"
            : isPaused
              ? "bg-yellow-500 text-white"
              : "bg-gray-500 text-white"
            }`}
        >
          {isActive ? "Ativo" : isPaused ? "Pausado" : "Vendido"}
        </span>
      </div>

      {/* CONTEÚDO */}
      <div className="p-4">

        {/* TÍTULO + DATA */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-foreground truncate">
            {card.name ?? "Carta desconhecida"}
          </h3>

          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {formattedDate} • {formattedTime}
          </span>
        </div>

        {/* EDIÇÃO */}
        <p className="text-sm text-muted-foreground">
          {card.set_name ?? "Edição não informada"}
        </p>

        {/* TAGS */}
        <div className="flex flex-wrap gap-2 my-2">
          {listing.condition && (
            <span className="px-2 py-1 rounded-full text-xs bg-muted text-foreground/80">
              {listing.condition}
            </span>
          )}
          {listing.rarity && (
            <span className="px-2 py-1 rounded-full text-xs bg-muted text-foreground/80">
              {listing.rarity}
            </span>
          )}
        </div>

        {/* PREÇO */}
        <p className="text-primary font-bold text-xl">
          R$ {listing.price?.toLocaleString("pt-BR")}
        </p>

        {/* BOTÕES */}
        <div className="flex gap-2 mt-3">

          <button
            onClick={() => onEdit?.(listing)}
            className="flex-1 py-2 rounded-xl bg-muted hover:bg-muted/70 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Pencil size={16} /> Editar
          </button>

          {isActive ? (
            <button
              onClick={() => {
                setModalMode("pause");
                setModalOpen(true);
              }}
              className="flex-1 py-2 rounded-xl bg-muted hover:bg-muted/70 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Pause size={16} /> Pausar
            </button>
          ) : (
            <button
              onClick={() => {
                setModalMode("activate");
                setModalOpen(true);
              }}
              className="flex-1 py-2 rounded-xl bg-muted hover:bg-muted/70 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play size={16} /> Ativar
            </button>
          )}

          <button
            onClick={() => setDeleteModal(true)}
            className="p-2 rounded-xl bg-destructive/80 hover:bg-destructive text-white"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <DeleteListingModal
        open={deleteModal}
        listingId={listing.id}
        onClose={() => setDeleteModal(false)}
        onDeleted={() => onUpdated?.()}
      />

      {/* MODAL */}
      <PauseOrActivateModal
        open={modalOpen}
        listingId={listing.id}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onUpdated={() => onUpdated?.()}
      />
    </div>
  );
}
