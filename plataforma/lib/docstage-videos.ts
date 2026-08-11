// Server-only: never import from client components.
// YouTube IDs served exclusively via /api/docstage/[moduloId]/[aulaId]/embed (auth required).
export const DOCSTAGE_YOUTUBE_IDS: Record<string, Record<number, string>> = {
  "alem-do-plantao": {
    1: "MQ29_THeDrY",
    2: "Ll73r33iEJI",
    3: "zhOC5TuBHKg",
  },
};
