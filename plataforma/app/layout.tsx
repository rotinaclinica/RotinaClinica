import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import ThemeProvider from "@/app/components/ThemeProvider";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap", weight: ["500", "600", "700", "800"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap", weight: ["400", "500", "600", "700"] });

const DESCRICAO =
  "Mais de 250 condutas clínicas, modelos de evolução, calculadoras, casos e cursos para médicos e estudantes no plantão, PS, UPA e UBS.";

export const metadata: Metadata = {
  title: { default: "Rotina Clínica", template: "%s | Rotina Clínica" },
  description: DESCRICAO,
  metadataBase: new URL("https://www.rotinaclinica.com"),
  // Na tela inicial do iPhone abre sem a barra do navegador, como aplicativo
  appleWebApp: { capable: true, title: "Rotina Clínica", statusBarStyle: "default" },
  // Padrão das páginas sem prévia própria (sem url: cada página informa a sua via lib/seo.ts)
  openGraph: {
    title: "Rotina Clínica · Condutas prontas para o plantão",
    description: DESCRICAO,
    siteName: "Rotina Clínica",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rotina Clínica · Condutas prontas para o plantão",
    description: DESCRICAO,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-[#0c1117] text-zinc-900 antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-47N3599NCW" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
          gtag('js',new Date());gtag('config','G-47N3599NCW');
        `}</Script>
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','1052043933951264');
          fbq('track','PageView');
        `}</Script>
        <Script id="utm-capture" strategy="afterInteractive">{`
          (function(){
            try {
              if(document.cookie.indexOf('rc_utm=')!==-1) return;
              var p=new URLSearchParams(location.search);
              var s=p.get('utm_source')||'';
              var m=p.get('utm_medium')||'';
              var c=p.get('utm_campaign')||'';
              var ct=p.get('utm_content')||'';
              var r=document.referrer||'';
              if(!s&&r){
                try{var h=new URL(r).hostname.replace('www.','');
                  if(h.includes('google'))s='google';
                  else if(h.includes('instagram')||h.includes('l.instagram'))s='instagram';
                  else if(h.includes('youtube'))s='youtube';
                  else if(h.includes('facebook')||h.includes('l.facebook'))s='facebook';
                  else if(h.includes('tiktok'))s='tiktok';
                  else if(h.includes('twitter')||h.includes('t.co'))s='twitter';
                  else if(!h.includes('rotinaclinica'))s=h;
                }catch(e){}
                if(s&&!m)m='organic';
              }
              if(!s)s='direto';
              if(!m)m='none';
              var v=encodeURIComponent(s)+'|'+encodeURIComponent(m)+'|'+encodeURIComponent(c)+'|'+encodeURIComponent(r)+'|'+encodeURIComponent(ct);
              document.cookie='rc_utm='+v+';path=/;max-age=7776000;SameSite=Lax';
            }catch(e){}
          })();
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
