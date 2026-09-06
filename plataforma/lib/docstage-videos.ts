// Server-only: never import from client components.
// YouTube IDs served exclusively via /api/docstage/[moduloId]/[aulaId]/embed (auth required).
export const DOCSTAGE_YOUTUBE_IDS: Record<string, Record<number, string>> = {
  "financas-medicos": {
    1: "dr7harWMkyE",
    2: "1WncqvbNe4I",
    3: "QPQwWxKq7aE",
    4: "_-UOGN5FlSg",
  },
  "alem-do-plantao": {
    1: "MQ29_THeDrY",
    2: "Ll73r33iEJI",
    3: "zhOC5TuBHKg",
  },
};
