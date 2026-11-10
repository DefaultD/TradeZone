"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/app/api/axiosInstance";
import AuthLayout from "@/components/AuthLayout";
import { Eye, EyeOff, Mail, User, Lock, Calendar, Phone } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);

      // 🚀 Envia dados para API
      const response = await axiosInstance.post("/auth/register", {
        name,
        email,
        password,
        phone,
        date_of_birth: birthDate ? new Date(birthDate).toISOString() : null,
        accepted_terms: acceptedTerms,
      });

      if (response.status === 201 || response.status === 200) {
        router.push("/login");
      }
    } catch (err: any) {
      console.error("Erro ao criar conta:", err);
      setError(
        err.response?.data?.message ||
          "Erro ao criar conta. Verifique os dados e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-xl border border-border/50 relative z-10">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">
          Tradezone
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Crie sua conta gratuitamente
        </p>

        <form className="space-y-4" onSubmit={handleRegister}>
          {/* Nome */}
          <div>
            <label className="text-sm text-muted-foreground">Nome Completo</label>
            <div className="mt-1 relative">
              <User className="absolute left-3 top-2.5 text-muted-foreground/70" size={18} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required
                className="w-full pl-10 rounded-lg border border-border bg-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-muted-foreground">E-mail</label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-2.5 text-muted-foreground/70" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full pl-10 rounded-lg border border-border bg-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label className="text-sm text-muted-foreground">Telefone</label>
            <div className="mt-1 relative">
              <Phone className="absolute left-3 top-2.5 text-muted-foreground/70" size={18} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                required
                className="w-full pl-10 rounded-lg border border-border bg-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Data de Nascimento */}
          <div>
            <label className="text-sm text-muted-foreground">Data de Nascimento</label>
            <div className="mt-1 relative">
              <Calendar className="absolute left-3 top-2.5 text-muted-foreground/70" size={18} />
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="w-full pl-10 rounded-lg border border-border bg-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="text-sm text-muted-foreground">Senha</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-2.5 text-muted-foreground/70" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                className="w-full pl-10 pr-10 rounded-lg border border-border bg-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground/70 hover:text-foreground transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirmar senha */}
          <div>
            <label className="text-sm text-muted-foreground">Confirmar Senha</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-2.5 text-muted-foreground/70" size={18} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita sua senha"
                required
                className="w-full pl-10 pr-10 rounded-lg border border-border bg-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground/70 hover:text-foreground transition"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Termos */}
          <div className="flex items-center text-sm mt-2">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="accent-primary cursor-pointer mr-2"
            />
            <span className="text-muted-foreground">
              Aceito os{" "}
              <a href="#" className="text-primary hover:underline">
                Termos de Uso
              </a>{" "}
              e{" "}
              <a href="#" className="text-primary hover:underline">
                Política de Privacidade
              </a>
            </span>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Botão criar conta */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Criando conta..." : "Criar Conta"}
          </button>

          {/* Separador */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Google */}
          <button
            type="button"
            className="w-full border border-border text-muted-foreground py-2 rounded-lg flex justify-center items-center hover:bg-muted/30 transition cursor-pointer"
          >
            Continuar com Google
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem conta?{" "}
          <a
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            Entrar
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
