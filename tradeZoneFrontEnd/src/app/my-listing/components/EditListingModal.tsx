"use client";

import { useState, useEffect, DragEvent } from "react";
import axiosInstance from "@/app/api/axiosInstance";
import Image from "next/image";
import { X } from "lucide-react";

// =========================
// TYPES
// =========================

export interface ListingImage {
    id: number;
    url: string;
    fs_key?: string;
}

export interface ListingData {
    id: number;
    condition: string;
    rarity: string;
    description: string;
    price: number;
    cards: { id: number; name: string };
    images: ListingImage[];
}

interface EditListingModalProps {
    listing: ListingData | null;
    open: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

export default function EditListingModal({
    listing,
    open,
    onClose,
    onUpdated,
}: EditListingModalProps) {
    if (!open || !listing) return null;

    const [form, setForm] = useState({
        condition: "",
        rarity: "",
        description: "",
        price: 0,
    });

    const [images, setImages] = useState<ListingImage[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [deleteQueue, setDeleteQueue] = useState<number[]>([]);
    const [errors, setErrors] = useState<{ description?: string; price?: string }>(
        {}
    );

    const MAX_IMAGES = 3;

    const totalImages = images.length + newFiles.length;
    const canAddImage = totalImages < MAX_IMAGES;

    const [isDragging, setIsDragging] = useState(false);

    // Load modal state
    useEffect(() => {
        if (listing) {
            setForm({
                condition: listing.condition,
                rarity: listing.rarity,
                description: listing.description,
                price: listing.price,
            });
            setImages(listing.images || []);
            setDeleteQueue([]);
            setNewFiles([]);
        }
    }, [listing]);

    const handleChange = (
        key: keyof typeof form,
        value: string | number
    ) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    // =========================
    // DRAG AND DROP
    // =========================
    const onDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (!canAddImage) return;

        const files = Array.from(e.dataTransfer.files);
        const allowed = MAX_IMAGES - totalImages;

        setNewFiles((prev) => [...prev, ...files.slice(0, allowed)]);
    };

    // =========================
    // VALIDATION
    // =========================
    const validate = () => {
        const err: any = {};

        if (!form.description.trim()) err.description = "A descrição é obrigatória.";
        if (form.price <= 0) err.price = "O preço deve ser maior que zero.";

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    // =========================
    // SUBMIT
    // =========================
    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            await axiosInstance.put(`/listings/${listing.id}`, {
                ...form,
                delete_images: deleteQueue,
            });

            if (newFiles.length > 0) {
                const fd = new FormData();
                newFiles.forEach((f) => fd.append("files", f));

                await axiosInstance.post(`/listings/${listing.id}/upload`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            onUpdated();
            onClose();
        } catch (err) {
            console.error("Erro ao atualizar:", err);
        }
    };

    const removeOldImage = (img: ListingImage) => {
        setDeleteQueue((prev) => [...prev, img.id]);
        setImages((prev) => prev.filter((i) => i.id !== img.id));
    };

    const removeNewFile = (i: number) => {
        setNewFiles((prev) => prev.filter((_, idx) => idx !== i));
    };

    // =========================
    // RENDER
    // =========================

    return (
        <>
            {/* BACKDROP */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"></div>

            {/* MODAL */}
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div className="bg-background text-foreground rounded-xl shadow-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">

                    {/* HEADER */}
                    <div className="flex justify-between items-center mb-5">
                        <h1 className="text-2xl font-semibold">Editar Anúncio</h1>
                        <button onClick={onClose} className="text-xl hover:opacity-100 opacity-60">×</button>
                    </div>

                    {/* FORM */}
                    <div className="space-y-5">

                        {/* Nome */}
                        <div>
                            <label className="text-sm font-medium">Nome da Carta</label>
                            <input
                                disabled
                                value={listing.cards.name}
                                className="w-full mt-1 bg-muted p-2 rounded-md border border-border"
                            />
                        </div>

                        {/* Preço */}
                        <div>
                            <label className="text-sm font-medium">Preço (R$)</label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={(e) => handleChange("price", Number(e.target.value))}
                                className={`w-full mt-1 p-2 rounded-md bg-muted border ${errors.price ? "border-red-500" : "border-border"
                                    }`}
                            />
                            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                        </div>

                        {/* Condição + Raridade */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Condição</label>
                                <select
                                    value={form.condition}
                                    onChange={(e) => handleChange("condition", e.target.value)}
                                    className="w-full mt-1 p-2 bg-muted rounded-md border border-border"
                                >
                                    <option value="NM">Near Mint (NM)</option>
                                    <option value="LP">Lightly Played (LP)</option>
                                    <option value="MP">Moderately Played (MP)</option>
                                    <option value="HP">Heavily Played (HP)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Raridade</label>
                                <select
                                    value={form.rarity}
                                    onChange={(e) => handleChange("rarity", e.target.value)}
                                    className="w-full mt-1 p-2 bg-muted rounded-md border border-border"
                                >
                                    <option value="COMMON">Comum</option>
                                    <option value="UNCOMMON">Incomum</option>
                                    <option value="RARE">Rara</option>
                                    <option value="MYTHIC">Mítica</option>
                                </select>
                            </div>
                        </div>

                        {/* Descrição */}
                        <div>
                            <label className="text-sm font-medium">Descrição</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                className={`w-full mt-1 p-2 rounded-md bg-muted min-h-[120px] border ${errors.description ? "border-red-500" : "border-border"
                                    }`}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                            )}
                        </div>

                        {/* Imagens atuais */}
                        <div>
                            <label className="text-sm font-medium">Imagens atuais</label>

                            <div className="mt-3 flex gap-3 overflow-x-auto bg-muted/40 p-3 rounded-lg scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">

                                {images.map((img) => (
                                    <div key={img.id} className="relative group">
                                        <Image
                                            src={img.url}
                                            width={120}
                                            height={120}
                                            className="rounded-md object-cover border border-border"
                                            alt="Imagem"
                                        />

                                        <button
                                            onClick={() => removeOldImage(img)}
                                            className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}

                                {/* Botão adicionar */}
                                {canAddImage && (
                                    <div
                                        className={`relative w-[120px] h-[120px] border border-dashed border-border rounded-md flex flex-col items-center justify-center cursor-pointer ${isDragging ? "bg-primary/10 border-primary" : "bg-muted"
                                            }`}
                                        onDrop={onDrop}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setIsDragging(true);
                                        }}
                                        onDragLeave={() => setIsDragging(false)}
                                    >
                                        <span className="text-xl opacity-70">+</span>
                                        <span className="opacity-70 text-xs">Adicionar</span>

                                        <input
                                            type="file"
                                            multiple
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files ?? []);
                                                const allowed = MAX_IMAGES - totalImages;
                                                setNewFiles((prev) => [...prev, ...files.slice(0, allowed)]);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Novas imagens */}
                        {newFiles.length > 0 && (
                            <div>
                                <p className="text-sm font-medium mb-2">Novas imagens:</p>
                                <div className="flex gap-3 flex-wrap">
                                    {newFiles.map((file, idx) => (
                                        <div key={idx} className="relative">
                                            <Image
                                                src={URL.createObjectURL(file)}
                                                width={100}
                                                height={100}
                                                className="rounded-md border border-border object-cover"
                                                alt="Preview"
                                            />

                                            <button
                                                onClick={() => removeNewFile(idx)}
                                                className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-1 rounded"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-end gap-3 mt-8">
                        <button onClick={onClose} className="px-4 py-2 rounded-md border border-border hover:bg-muted">
                            Cancelar
                        </button>

                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
