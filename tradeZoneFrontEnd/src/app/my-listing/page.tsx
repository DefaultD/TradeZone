"use client";

import { useState, useMemo } from "react";
import { useMyListings } from "./hooks/useMyListings";
import ListingCard from "./components/ListingCard";
import ListingFilters from "./components/ListingFilters";
import CreateListingModal from "./components/CreateListingModal";
import EditListingModal from "./components/EditListingModal";

const STATUS_MAP: Record<string, string> = {
  Ativos: "active",
  Pausados: "paused",
  Vendidos: "sold",
};

export default function MeusAnunciosPage() {
  const [editingListing, setEditingListing] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { listings, loading, error, refetch } = useMyListings();
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const handleEdit = (listing: any) => {
    setEditingListing(listing);
    setOpenEditModal(true);
  };
  // normaliza para facilitar filtros e busca
  const normalized = useMemo(() => {
    return (listings ?? []).map((l: any) => {
      const card = l.cards ?? null;
      return {
        ...l,
        _displayName: card?.name ?? l.title ?? "Anúncio",
        _displaySet: card?.set_name ?? "",
        _displayRarity: card?.rarity ?? l.rarity ?? "",
        _displayImage: card?.image_url ?? l.image_url ?? null,
        _status: (l.status || "").toLowerCase(), // "active" | "paused" | "sold"
        _priceNumber:
          typeof l.price === "number"
            ? l.price
            : parseFloat(String(l.price).replace(",", ".")) || 0,
      };
    });
  }, [listings]);

  const filtered = useMemo(() => {
    const statusToMatch =
      filter === "Todos" ? null : (STATUS_MAP[filter] || "").toLowerCase();

    return normalized
      .filter((item: any) =>
        statusToMatch ? item._status === statusToMatch : true
      )
      .filter((item: any) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          item._displayName.toLowerCase().includes(q) ||
          item._displaySet.toLowerCase().includes(q) ||
          (item.description ?? "").toLowerCase().includes(q)
        );
      });
  }, [normalized, filter, search]);

  return (
    <main className="min-h-screen h-auto bg-background text-foreground px-10 py-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">
            Meus <span className="text-primary">Anúncios</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Gerencie suas cartas publicadas e crie novos anúncios.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg transition"
        >
          + Criar Novo Anúncio
        </button>
      </div>

      <ListingFilters
        activeFilter={filter}
        onFilterChange={setFilter}
        onSearch={setSearch}
      />

      {loading ? (
        <p className="text-muted-foreground">Carregando anúncios...</p>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">Nenhum anúncio encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing: any) => (
            <ListingCard key={listing.id} listing={listing} onEdit={handleEdit} onUpdated={refetch} />
          ))}
        </div>
      )}

      {/* 🔥 Modal de criação (fica fora do fluxo principal) */}
      <CreateListingModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          refetch(); // atualiza lista após criar
          setIsModalOpen(false);
        }}
      />
      {openEditModal && (
        <EditListingModal
          listing={editingListing}
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          onUpdated={() => refetch()} // ou reload
        />
      )}
    </main>
  );

}
