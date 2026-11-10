"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sun, Moon, User, LogOut } from "lucide-react";
import axiosInstance from "@/app/api/axiosInstance";

export default function Navbar() {
  const [myProfile, setMyProfile] = useState<{ id: number; name: string } | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Ocultar Navbar nas páginas de login e cadastro
  const hideNavbar = ["/login", "/register", "/signup", "/forgot-password"].includes(
    pathname.toLowerCase()
  );

  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await axiosInstance(`/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.data) return;

        const data = await res.data;
        console.log(data)
        setMyProfile(data);
      } catch (err) {
        console.error("Erro ao obter perfil:", err);
      }
    };

    fetchProfile();
  }, [isLoggedIn]);


  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    setTheme(savedTheme);
    document.documentElement.dataset.theme = savedTheme;
  }, []);

  // ✅ Atualiza estado quando o localStorage muda (login/logout)
  useEffect(() => {
    const checkLogin = () => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
    };

    checkLogin();
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, [pathname]);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("storage")); // 🔥 força update do navbar
    router.push("/login");
  };

  if (hideNavbar) return null;

  return (
    <nav className="flex items-center justify-between px-8 py-3 border-b border-[var(--sidebar-border)] bg-[var(--background)] text-[var(--foreground)] relative">
      <div className="text-2xl font-bold text-[var(--sidebar-primary)]">
        Tradezone
      </div>

      <div className="flex items-center gap-6">
        <Link href="/explore" className="hover:text-[var(--sidebar-primary)] transition">
          Explorar
        </Link>

        {/* 🔒 Só mostra esses se o usuário estiver logado */}
        {isLoggedIn && (
          <>
            <Link href="/my-listing" className="hover:text-[var(--sidebar-primary)] transition">
              Meus Anúncios
            </Link>
            <Link href="/saldo" className="hover:text-[var(--sidebar-primary)] transition">
              Meus Pedidos
            </Link>
            <Link
              href={myProfile ? `/profile/${myProfile.id}` : "/profile"}
              className="hover:text-[var(--sidebar-primary)] transition"
            >
              Perfil
            </Link>

          </>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-[var(--sidebar-border)] hover:bg-[var(--card-foreground)] transition"
          aria-label="Alternar tema"
        >
          {theme === "dark" ? (
            <Sun className="text-[var(--sidebar-primary)]" size={18} />
          ) : (
            <Moon className="text-[var(--sidebar-primary)]" size={18} />
          )}
        </button>

        {/* 🔥 Menu do usuário */}
        {isLoggedIn ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg border border-[var(--sidebar-border)] hover:bg-[var(--card-foreground)] transition cursor-pointer"
            >
              <User className="text-[var(--sidebar-primary)]" size={18} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-[var(--card)] border border-[var(--sidebar-border)] rounded-lg shadow-lg z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 flex items-center gap-2 text-[var(--foreground)] hover:bg-[var(--card-foreground)] transition cursor-pointer"
                >
                  <LogOut size={16} className="text-[var(--sidebar-primary)]" />
                  Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="border border-[var(--sidebar-primary)] text-[var(--sidebar-primary)] px-4 py-1.5 rounded-md font-semibold hover:bg-[var(--sidebar-primary)] hover:text-white transition"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="bg-[var(--sidebar-primary)] text-white px-4 py-1.5 rounded-md font-semibold hover:opacity-90 transition"
            >
              Cadastrar
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
