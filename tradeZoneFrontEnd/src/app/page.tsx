"use client";

import { useEffect, useState } from "react";
import axiosInstance from "./api/axiosInstance";
import { redirect } from "next/navigation";

export default function Home() {


  
  const [status, setStatus] = useState("Verificando servidor...");
  
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axiosInstance.get("/health");
        setStatus(`Servidor OK ✅ (${response.data.status})`);
      } catch (error) {
        console.error("Erro ao verificar servidor:", error);
        setStatus("❌ Servidor indisponível");
      }
    };
    
    checkHealth();
  }, []);
  redirect("/explore");

  const teste = async () => {
    const response = await axiosInstance.get("/profile/getProfile?user_id=7")
    console.log(response)
  }

  return (
    <main className="flex flex-col gap-4 h-[calc(100vh-64px)] items-center justify-center overflow-hidden">
      <h1 className="text-4xl font-bold text-primary">
        Tailwind 4 funcionando no Tradezone ✅
      </h1>

      <button onClick={teste}>olaa</button>

      <p>{status}</p>
    </main>
  );
}
