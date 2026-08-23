export interface AirtraqVideo {
  id: string;       // slug único
  titulo: string;
  descricao?: string;
  duracao?: string;
  youtubeId?: string; // preenchido quando o vídeo for publicado no YouTube
}

export const AIRTRAQ_TITULO = "Airtraq Safetech Medical";

export const AIRTRAQ_DESCRICAO =
  "Airtraq: Um nível acima na abordagem para intubação de pacientes com via aérea difícil. Sua lâmina canulada exclusiva permite intubar sem posição olfativa, enquanto o canal guia conduz o tubo até as cordas vocais, trazendo mais controle, praticidade, rapidez e segurança.";

export const AIRTRAQ_VIDEOS: AirtraqVideo[] = [
  {
    id: "depoimento",
    titulo: "Depoimento de uso do Airtraq",
    youtubeId: "_NhVL7zJd9k",
  },
  {
    id: "intubacao-segura",
    titulo: "Intubação segura é com Airtraq",
    youtubeId: "rEzrZ1AT73I",
  },
  {
    id: "efetividade",
    titulo: "Intube com efetividade com o Airtraq",
    youtubeId: "6V-QF7wkwic",
  },
];
