import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/app/components/ThemeProvider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: { default: "Rotina Clínica", template: "%s | Rotina Clínica" },
  description: "Cursos e materiais digitais para profissionais da saúde",
  metadataBase: new URL("https://www.rotinaclinica.com"),
  openGraph: {
    title: "Rotina Clínica",
    description: "Cursos e materiais digitais para profissionais da saúde",
    url: "https://www.rotinaclinica.com",
    siteName: "Rotina Clínica",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rotina Clínica",
    description: "Cursos e materiais digitais para profissionais da saúde",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={geist.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-[#0c1117] text-zinc-900 antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
