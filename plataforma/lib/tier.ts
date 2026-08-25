export interface Tier {
  nome: string;
  emoji: string;
  badge: string;
  meses: number;
}

export const TIERS: Tier[] = [
  { meses: 0,  nome: "Iniciante",    emoji: "🩺", badge: "bg-[#1a6aad] text-white"  },
  { meses: 3,  nome: "Dedicado",     emoji: "⭐", badge: "bg-amber-500 text-white"  },
  { meses: 6,  nome: "Experiente",   emoji: "📚", badge: "bg-teal-600 text-white"   },
  { meses: 12, nome: "Veterano",     emoji: "💎", badge: "bg-purple-600 text-white" },
  { meses: 24, nome: "Elite Rotina", emoji: "🏆", badge: "bg-rose-700 text-white"   },
];

export function calcularTier(since: Date): Tier {
  const meses = Math.floor((Date.now() - since.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  return [...TIERS].reverse().find((t) => meses >= t.meses) ?? TIERS[0];
}

export function formatarSince(since: Date): string {
  return since.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}
