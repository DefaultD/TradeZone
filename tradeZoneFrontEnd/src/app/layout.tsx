import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Tradezone",
  description: "Plataforma de trocas de cartas colecionáveis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
