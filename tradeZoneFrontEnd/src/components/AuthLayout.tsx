"use client";

import { ReactNode, useEffect, useState } from "react";
import { Moon, Sun, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState("dark");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) {
      setTheme(stored);
      document.documentElement.dataset.theme = stored;
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem("theme", newTheme);
  };

  const goBack = () => router.push('/');

  return (
    <main className="relative flex h-screen items-center justify-center bg-background text-foreground overflow-hidden transition-colors duration-300">
      {/* 🔴 Efeito de luz vermelha pulsante */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <div className="relative w-[500px] h-[500px] rounded-full bg-red-900 opacity-40 blur-[180px] animate-pulse-glow" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-red-700 opacity-20 blur-[200px] animate-pulse-glow-slow" />
      </div>

      {/* Botão Voltar */}
      <button
        onClick={goBack}
        className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/40 hover:bg-muted/60 cursor-pointer z-10"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      {/* Botão alternar tema */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-muted/40 hover:bg-muted/60 cursor-pointer z-10"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Conteúdo da página */}
      <div className="relative z-10">{children}</div>
    </main>
  );
}
