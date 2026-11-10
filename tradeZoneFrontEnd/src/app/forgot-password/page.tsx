"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Send } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import axiosInstance from "@/app/api/axiosInstance";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      alert("E-mail de redefinição enviado!");
    } catch (err) {
      alert("Erro ao enviar e-mail. Verifique o endereço informado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-12 w-full max-w-5xl px-6">
        {/* Coluna Esquerda */}
        <div className="flex flex-col text-center md:text-left">
          <h1 className="text-4xl font-bold text-primary">Tradezone</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Recupere sua senha
          </p>
        </div>

        {/* Coluna Direita (Formulário) */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-card p-6 rounded-2xl shadow-md flex flex-col gap-4"
        >
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Esqueceu sua senha?
            </h2>
            <p className="text-sm text-muted-foreground">
              Digite seu e-mail cadastrado e enviaremos um link para redefinir
              sua senha.
            </p>
          </div>

          <div className="flex items-center border rounded-lg px-3 py-2 bg-input">
            <Mail size={18} className="text-muted-foreground mr-2" />
            <input
              type="email"
              required
              placeholder="Digite seu e-mail cadastrado"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-primary-foreground font-semibold py-2 rounded-lg transition cursor-pointer disabled:opacity-70"
          >
            <Send size={18} />
            {loading ? "Enviando..." : "Enviar e-mail de redefinição"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="border border-primary text-primary font-semibold py-2 rounded-lg hover:bg-primary/10 transition cursor-pointer"
          >
            Cancelar
          </button>

          <p className="text-sm text-center text-muted-foreground mt-2">
            Lembrou sua senha?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-primary font-semibold cursor-pointer hover:underline"
            >
              Fazer login
            </span>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
