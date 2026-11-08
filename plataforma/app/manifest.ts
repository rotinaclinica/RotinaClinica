import type { MetadataRoute } from "next";

// Permite instalar a plataforma na tela inicial do celular (abre como aplicativo).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rotina Clínica",
    short_name: "Rotina Clínica",
    description: "Condutas, modelos de evolução e calculadoras para o plantão.",
    id: "/dashboard",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#012a44",
    theme_color: "#0f2d4a",
    lang: "pt-BR",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
