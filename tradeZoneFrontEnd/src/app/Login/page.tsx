"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/app/api/axiosInstance";
import AuthLayout from "@/components/AuthLayout"; // ajuste o path se estiver diferente

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      const { accessToken, refreshToken, user } = response.data;

      if (!accessToken || !refreshToken || !user?.id) {
        throw new Error("Resposta inválida do servidor");
      }

      if (rememberMe) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
      } else {
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("refreshToken", refreshToken);
      }

      localStorage.setItem("user_id", user.id.toString());
      localStorage.setItem("user_email", user.email);

      router.push("/");
    } catch (err: any) {
      console.error("Erro no login:", err);
      setError(
        err.response?.data?.message ||
        "Erro ao fazer login. Verifique suas credenciais."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-xl border border-border/50 relative z-10">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">
          Tradezone
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Entre na sua conta
        </p>

        <form className="space-y-4" onSubmit={login}>
          <div>
            <label className="text-sm text-muted-foreground">E-mail</label>
            <div className="mt-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Senha</label>
            <div className="mt-1">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-primary cursor-pointer"
              />
              Lembrar-me
            </label>
            <a
              onClick={() => router.push("/forgot-password")}
              className="text-primary hover:underline cursor-pointer ml-3" // 👈 margem adicionada
            >
              Esqueceu a senha?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full border border-border text-muted-foreground py-2 rounded-lg flex justify-center items-center hover:bg-muted/30 transition cursor-pointer"
          >
            Continuar com Google
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Não tem conta?{" "}
          <a
            href="/register"
            className="text-primary font-semibold hover:underline"
          >
            Cadastre-se
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
