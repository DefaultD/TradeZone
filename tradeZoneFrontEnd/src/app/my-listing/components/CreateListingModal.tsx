"use client";

import { useState, useRef } from "react";
import { X, Upload } from "lucide-react";
import axiosInstance from "@/app/api/axiosInstance";

interface CreateListingModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateListingModal({
  open,
  onClose,
  onCreated,
}: CreateListingModalProps) {
  if (!open) return null;

  const [form, setForm] = useState({
    title: "",
    condition: "",
    rarity: "",
    price: "",
    description: "",
  });

  const [cards, setCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /** ENUMS reais */
  const conditionsMap: Record<string, string> = {
    "Near Mint": "NM",
    "Lightly Played": "LP",
    "Moderately Played": "MP",
    "Heavily Played": "HP",
  };

  const raritiesMap: Record<string, string> = {
    Comum: "COMMON",
    Incomum: "UNCOMMON",
    Rara: "RARE",
    Mítica: "MYTHIC",
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /** Buscar cartas */
  const handleCardSearch = async (value: string) => {
    setForm((prev) => ({ ...prev, title: value }));
    if (value.length < 2) return setCards([]);

    try {
      const { data } = await axiosInstance.get(`/cards/search?q=${value}`);
      setCards(data);
    } catch {
      setCards([]);
    }
  };

  /** Upload local */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const selected = Array.from(files).slice(0, 3 - images.length);
    setImages((prev) => [...prev, ...selected]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /** SUBMIT */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedCard) {
      setError("Selecione uma carta válida.");
      return;
    }

    if (!form.condition || !form.rarity) {
      setError("Selecione condição e raridade.");
      return;
    }

    if (Number(form.price) <= 0) {
      setError("Preço inválido.");
      return;
    }

    try {
      setLoading(true);

      /** upload das imagens */
      const uploadedKeys: string[] = [];

      for (const img of images) {
        const fd = new FormData();
        fd.append("file", img);

        const { data } = await axiosInstance.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedKeys.push(data.fs_key);
      }

      /** criar listing */
      await axiosInstance.post("/listings", {
        card_id: selectedCard.id,
        condition: conditionsMap[form.condition],
        rarity: raritiesMap[form.rarity],
        price: Number(form.price),
        description: form.description,
        images: uploadedKeys,
      });

      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Erro ao criar anúncio.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    selectedCard &&
    form.condition &&
    form.rarity &&
    form.price &&
    Number(form.price) > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card text-foreground rounded-2xl p-6 w-[95%] sm:w-[500px] max-h-[90vh] overflow-y-auto shadow-xl border border-border">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Criar Novo Anúncio</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Buscar carta */}
          <div className="relative">
            <label className="block text-sm mb-1 font-medium">Nome da Carta *</label>

            <input
              type="text"
              placeholder="Digite para buscar..."
              value={form.title}
              onChange={(e) => handleCardSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
            />

            {cards.length > 0 && (
              <ul className="absolute z-50 w-full bg-popover border border-border rounded-lg mt-1 max-h-56 overflow-y-auto shadow-lg">
                {cards.map((card) => (
                  <li
                    key={card.id}
                    onClick={() => {
                      setSelectedCard(card);
                      handleChange("title", card.name);
                      setCards([]);
                    }}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                  >
                    {card.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Condição */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1 font-medium">Condição *</label>
              <select
                value={form.condition}
                onChange={(e) => handleChange("condition", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border"
              >
                <option value="">Selecione...</option>
                {Object.keys(conditionsMap).map((label) => (
                  <option key={label}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium">Raridade *</label>
              <select
                value={form.rarity}
                onChange={(e) => handleChange("rarity", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border"
              >
                <option value="">Selecione...</option>
                {Object.keys(raritiesMap).map((label) => (
                  <option key={label}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preço */}
          <div>
            <label className="block text-sm mb-1 font-medium">Preço (R$) *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-card border border-border"
              placeholder="0.00"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm mb-1 font-medium">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-card border border-border"
            />
          </div>

          {/* Imagens */}
          <div>
            <label className="block text-sm mb-1 font-medium">Imagens (máx. 3)</label>

            <button
              type="button"
              disabled={images.length >= 3}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 border border-border rounded-lg bg-card hover:bg-muted transition"
            >
              <Upload size={16} /> Selecionar Imagens
            </button>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
            />

            {images.length > 0 && (
              <div className="flex gap-3 mt-2 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(img)}
                      className="w-20 h-20 rounded-lg object-cover border border-border"
                    />
                    <button
                      onClick={() =>
                        setImages((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="absolute top-0 right-0 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Botões */}
          <div className="flex justify-end mt-4 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-muted rounded-lg"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="px-4 py-2 rounded-lg bg-primary text-white"
            >
              {loading ? "Publicando..." : "Publicar Anúncio"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
