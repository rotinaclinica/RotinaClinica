import Link from "next/link";

// Faixa fixa durante o teste grátis: dias restantes + caminho para assinar no cartão
export default function TrialBanner({ endsAt }: { endsAt: string }) {
  const ms = new Date(endsAt).getTime() - Date.now();
  const dias = Math.max(1, Math.ceil(ms / 86_400_000));
  const texto = dias === 1 ? "Último dia do seu teste grátis" : `Teste grátis: faltam ${dias} dias`;

  return (
    <div className="mx-4 mt-4 lg:mx-6 lg:mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#3db8d4]/40 bg-[#e8f6fa] dark:bg-[#0f2a3a] px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#0f2d4a] dark:text-white">⏳ {texto}</p>
          <p className="text-xs text-[#0f2d4a]/80 dark:text-[#a9bccd] mt-0.5">
            Condutas, modelos de evolução e calculadoras liberadas! Assine para ter tudo, sem interrupção.
          </p>
        </div>
        <Link
          href="/checkout?plano=mensal"
          className="shrink-0 text-center text-sm font-bold bg-[#3db8d4] hover:bg-[#2fa6c2] text-[#0a1626] px-4 py-2 rounded-lg transition-colors"
        >
          Assinar no cartão →
        </Link>
      </div>
    </div>
  );
}
