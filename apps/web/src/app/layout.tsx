import type { Metadata } from "next";
import { Shell } from "../components/layout/Shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weekly Goals",
  description: "Planejamento e acompanhamento semanal de metas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}

