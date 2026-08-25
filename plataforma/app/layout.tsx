import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
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
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','1052043933951264');
          fbq('track','PageView');
        `}</Script>
        <noscript>
          <img height="1" width="1" style={{display:"none"}}
            src="https://www.facebook.com/tr?id=1052043933951264&ev=PageView&noscript=1" alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
