// Fonte única dos casos clínicos: usada pela plataforma (/dashboard/casos)
// e pelo tour público (/tour). Adicione casos novos só aqui.

// ── Adicione novas sequências aqui ──────────────────────────────────
// slug (opcional): link direto /dashboard/casos?caso=SLUG e selo "Novo" via lib/novidades.ts
export const SEQUENCIAS: { titulo: string; slug?: string; images: { src: string; alt: string }[] }[] = [
  {
    titulo: "Aumento Progressivo da Coxa",
    slug: "aumento-coxa",
    images: Array.from({ length: 5 }, (_, i) => ({
      src: `/imagens%20lipoma%20coxa/${i + 1}.png`,
      alt: `Caso clínico: aumento progressivo da coxa ${i + 1}`,
    })),
  },
  {
    titulo: "Dicas no Plantão",
    images: Array.from({ length: 10 }, (_, i) => ({
      src: `/imagens%20dicas%20plant%C3%A3o/${i + 1}.png`,
      alt: `Dica no plantão ${i + 1}`,
    })),
  },
  {
    titulo: "TV Instável",
    images: Array.from({ length: 12 }, (_, i) => ({
      src: `/imagens%20tv%20inst%C3%A1vel/${i + 1}.png`,
      alt: `TV instável ${i + 1}`,
    })),
  },
  {
    titulo: "Infecções de Pele e Partes Moles",
    images: Array.from({ length: 15 }, (_, i) => ({
      src: `/imagens%20infec%C3%A7%C3%B5es%20de%20pele%20e%20partes%20moles/${i + 1}.png`,
      alt: `Infecções de pele e partes moles ${i + 1}`,
    })),
  },
  {
    titulo: "Infecção Fúngica",
    images: Array.from({ length: 9 }, (_, i) => ({
      src: `/imagem%20infec%C3%A7%C3%A3o%20f%C3%BAngica/${i + 1}.png`,
      alt: `Infecção fúngica ${i + 1}`,
    })),
  },
  {
    titulo: "Piúria no Idoso",
    images: Array.from({ length: 10 }, (_, i) => ({
      src: `/imagens%20piuria%20idoso/${i + 1}.png`,
      alt: `Piúria no idoso ${i + 1}`,
    })),
  },
  {
    titulo: "Hemorroida Interna",
    images: Array.from({ length: 8 }, (_, i) => ({
      src: `/imagens%20hemorroida%20interna/${i + 1}.png`,
      alt: `Hemorroida interna ${i + 1}`,
    })),
  },
];

// vertical: Shorts do YouTube (9:16) — o player abre em pé
export const VIDEOS: { id: string; titulo: string; vertical?: boolean }[] = [
  { id: "5t4vXXZICXg", titulo: "Pneumonia adquirida na comunidade (PAC)" },
  { id: "CmWVOHlO2Ww", titulo: "Hipotireoidismo" },
  { id: "HYdR18O_QF8", titulo: "Uso de insulina" },
  { id: "QMDZdkN_uyw", titulo: "Nódulo tireoidiano" },
  { id: "BfoV7wLByHI", titulo: "IAM com supra de ST: por que repetir o ECG", vertical: true },
];
