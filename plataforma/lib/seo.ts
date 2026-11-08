import type { Metadata } from "next";

const SITE = "https://www.rotinaclinica.com";

/**
 * Título, descrição e endereço próprios na prévia de links (WhatsApp, Telegram,
 * Instagram, Facebook). Sem isso, toda página herda os dados da página inicial.
 * Imagem padrão: app/opengraph-image.jpg (1200x630).
 */
export function shareMeta(
  path: string,
  title: string,
  description: string,
  image = "/opengraph-image.jpg"
): Pick<Metadata, "openGraph" | "twitter"> {
  // A página que define openGraph não herda a imagem da raiz: informa sempre
  const images = [{ url: image, width: 1200, height: 630, alt: title }];
  return {
    openGraph: {
      title,
      description,
      url: `${SITE}${path}`,
      siteName: "Rotina Clínica",
      locale: "pt_BR",
      type: "website",
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}
