"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
    ChevronDown,
    ChevronUp,
    Search,
    ShieldCheck,
    ShoppingCart,
    RotateCcw,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";

export default function ExplorarPage() {

    // URL base do S3
    const S3_URL = "https://SEU_BUCKET.s3.amazonaws.com/";

    const [openFilters, setOpenFilters] = useState(false);
    const [listings, setListings] = useState([]);

    const [filters, setFilters] = useState({
        search: "",
        game: "",
        rarity: "",
        condition: "",
        priceMin: "",
        priceMax: "",
    });

    async function loadListings() {
        const params = new URLSearchParams();

        if (filters.search) params.append("search", filters.search);
        if (filters.game) params.append("game", filters.game);
        if (filters.rarity) params.append("rarity", filters.rarity);
        if (filters.priceMin) params.append("min", filters.priceMin);
        if (filters.priceMax) params.append("max", filters.priceMax);
        if (filters.condition) params.append("condition", filters.condition);

        const data = await axiosInstance.get("/listings", { params });
        setListings(data.data);
    }

    useEffect(() => {
        loadListings();
    }, []);

    useEffect(() => {
        const delay = setTimeout(() => {
            loadListings();
        }, 400);

        return () => clearTimeout(delay);
    }, [filters]);

    return (
        <div className="min-h-screen w-full text-white relative overflow-hidden bg-[#0a0a0a]">

            {/* SHAPES */}
            <div className="pointer-events-none select-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-900/20 blur-[120px] rounded-full"></div>
                <div className="absolute top-40 -right-40 w-[450px] h-[450px] bg-red-700/10 blur-[130px] rounded-full"></div>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[380px] h-[380px] bg-red-800/10 blur-[150px] rounded-full"></div>
            </div>

            {/* HERO */}
            <div className="py-20 text-center bg-gradient-to-b from-[#120000] via-[#0a0a0a] to-[#0a0a0a] relative z-10">
                <h1 className="text-5xl font-extrabold">
                    Marketplace de <span className="text-red-500">Cartas</span>
                </h1>
                <p className="text-gray-300 mt-3">
                    Encontre as melhores cartas para sua coleção
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-4 relative z-10">

                {/* SEARCH */}
                <div className="flex items-center bg-white text-black rounded-xl px-4 py-3 shadow-lg">
                    <Search className="text-gray-600" />
                    <input
                        type="text"
                        placeholder="Buscar cartas por nome, coleção ou jogo"
                        className="w-full ml-3 outline-none bg-transparent"
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, search: e.target.value }))
                        }
                    />
                </div>

                {/* BOTÃO DO FILTRO */}
                <button
                    onClick={() => setOpenFilters(!openFilters)}
                    className="mt-4 w-full flex justify-between items-center bg-[#111] border border-[#333] px-4 py-3 rounded-xl text-gray-300 hover:bg-[#161616]"
                >
                    <span className="text-sm">Filtrar Resultados</span>
                    {openFilters ? <ChevronUp /> : <ChevronDown />}
                </button>

                {/* FILTROS */}
                {openFilters && (
                    <div className="mt-4 bg-[#111] border border-[#333] rounded-xl p-5 space-y-5">
                        {/* JOGO */}
                        <div>
                            <p className="text-sm text-gray-300 mb-2">Jogo</p>
                            <div className="flex gap-3 flex-wrap">
                                {["Magic", "Pokémon", "Yu-Gi-Oh!"].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                game: prev.game === item ? "" : item,
                                            }))
                                        }
                                        className={`px-4 py-2 rounded-lg border ${filters.game === item
                                            ? "bg-red-600 border-red-600 text-white"
                                            : "border-[#444] text-gray-300 hover:bg-[#222]"
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* RARIDADE */}
                        <div>
                            <p className="text-sm text-gray-300 mb-2">Raridade</p>
                            <div className="flex gap-3 flex-wrap">
                                {["Comum", "Incomum", "Rara", "Mítica"].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                rarity: prev.rarity === item ? "" : item,
                                            }))
                                        }
                                        className={`px-4 py-2 rounded-lg border ${filters.rarity === item
                                            ? "bg-red-600 border-red-600 text-white"
                                            : "border-[#444] text-gray-300 hover:bg-[#222]"
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* CONDIÇÃO */}
                        <div>
                            <p className="text-sm text-gray-300 mb-2">Condição</p>
                            <div className="flex gap-3 flex-wrap">
                                {["NM", "LP", "MP", "HP", "DMG"].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                condition: prev.condition === item ? "" : item,
                                            }))
                                        }
                                        className={`px-4 py-2 rounded-lg border ${filters.condition === item
                                            ? "bg-red-600 border-red-600 text-white"
                                            : "border-[#444] text-gray-300 hover:bg-[#222]"
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PREÇO */}
                        <div>
                            <p className="text-sm text-gray-300 mb-2">Faixa de Preço</p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="bg-[#222] border border-[#444] text-gray-200 px-3 py-2 rounded-lg w-24"
                                    onChange={(e) =>
                                        setFilters((prev) => ({ ...prev, priceMin: e.target.value }))
                                    }
                                />
                                <span className="text-gray-500">—</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="bg-[#222] border border-[#444] text-gray-200 px-3 py-2 rounded-lg w-24"
                                    onChange={(e) =>
                                        setFilters((prev) => ({ ...prev, priceMax: e.target.value }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* LISTA DE ANÚNCIOS */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">

                    {listings.map((item: any) => (
                        <div
                            key={item.id}
                            className="
            bg-[#121212] border border-[#1c1c1c] rounded-xl shadow-xl overflow-hidden 
            transition-all duration-300 
            hover:-translate-y-2 
            hover:shadow-[0_0_25px_rgba(255,0,0,0.35)] 
            hover:border-red-600
            hover:bg-[#1a0000]/40
            group
        "
                        >
                            {/* TAG DO JOGO */}
                            <div className="absolute mt-3 ml-3 bg-red-600 px-3 py-1 text-xs font-semibold rounded-full shadow-md z-20">
                                {item.game}
                            </div>

                            {/* IMAGEM DA CARTA */}
                            <div className="relative h-52 w-full">
                                <Image
                                    src={
                                        item.images?.[0] ||                // imagem do S3
                                        item.cards?.image_url ||          // fallback (scryfall)
                                        "/placeholder.png"                // fallback final
                                    }
                                    alt={item.cards?.name}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                            </div>

                            <div className="p-5">

                                {/* NOME DA CARTA + NOME DO USUÁRIO */}
                                <div className="flex justify-between items-center mb-3">
                                    <h2 className="text-lg font-semibold truncate max-w-[150px]">
                                        {item.cards?.name}
                                    </h2>

                                    <span className="text-xs text-gray-400 italic truncate max-w-[120px]">
                                        por {item.users?.profiles.name}
                                    </span>
                                </div>

                                {/* RARIDADE / CONDIÇÃO */}
                                <p className="text-sm text-gray-400">
                                    Raridade: <span className="text-red-400">{item.rarity}</span>
                                </p>
                                <p className="text-sm text-gray-400">
                                    Condição: {item.condition}
                                </p>

                                {/* PREÇO */}
                                <div className="mt-3 text-red-500 text-2xl font-bold">
                                    R$ {Number(item.price).toLocaleString("pt-BR")}
                                </div>

                                {/* PROTEGIDO */}
                                {item.protected && (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-300">
                                        <ShieldCheck size={14} className="text-yellow-300" />
                                        Protegido
                                    </div>
                                )}

                                {/* BOTÕES */}
                                <div className="mt-4 flex flex-col gap-3">
                                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 text-white font-semibold">
                                        <ShoppingCart size={16} /> Comprar Carta
                                    </button>

                                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-600 text-gray-500 cursor-not-allowed">
                                        <RotateCcw size={16} /> Propor Troca
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}


                </div>
            </div>
        </div>
    );
}
