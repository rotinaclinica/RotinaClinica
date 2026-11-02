import Link from "next/link";

type Progress = { conduta: boolean; evolucao: boolean; calculadora: boolean; dias: number; diaDoTeste: number };

const META_DIAS = 3;

// Checklist do teste grátis: leva o usuário a experimentar as 3 seções e a voltar
// em dias diferentes (quem usa 3+ dias é quem assina).
export default function TrialChecklist({ progress }: { progress: Progress }) {
  const { diaDoTeste } = progress;
  const dias = Math.min(progress.dias, META_DIAS);
  const passos = [
    { feito: progress.conduta, titulo: "Busque a conduta de um paciente", href: "/dashboard/prescricoes" },
    { feito: progress.evolucao, titulo: "Abra um modelo de evolução", href: "/dashboard/evolucoes" },
    { feito: progress.calculadora, titulo: "Use uma calculadora ou escore", href: "/dashboard/calculadoras" },
    { feito: dias >= META_DIAS, titulo: `Use a plataforma em ${META_DIAS} dias diferentes (${dias}/${META_DIAS})`, href: null },
  ];
  const feitos = passos.filter((p) => p.feito).length;
  const completo = feitos === passos.length;

  return (
    <section className="mb-8 rounded-2xl border border-[#3db8d4]/40 bg-white dark:bg-[#172741] p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="text-base font-extrabold text-[#0f2d4a] dark:text-white">
          {completo ? "Você aproveitou bem o seu teste! 🎉" : "Aproveite seu teste em 4 passos"}
        </h2>
        <span className="shrink-0 text-xs font-bold text-[#1a6aad] dark:text-[#3db8d4]">Dia {diaDoTeste} de 7</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-white/10 overflow-hidden mb-4" aria-hidden>
        <div className="h-full bg-[#3db8d4] transition-all" style={{ width: `${(feitos / passos.length) * 100}%` }} />
      </div>

      {completo ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-[#0f2d4a] dark:text-[#a9bccd]">
            Continue com acesso a tudo, sem interrupção no meio de um plantão.
          </p>
          <Link
            href="/checkout?plano=mensal"
            className="shrink-0 text-center text-sm font-bold bg-[#3db8d4] hover:bg-[#2fa6c2] text-[#0a1626] px-4 py-2 rounded-lg transition-colors"
          >
            Assinar no cartão →
          </Link>
        </div>
      ) : (
        <ol className="space-y-2">
          {passos.map((p) => {
            const conteudo = (
              <>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    p.feito ? "bg-emerald-500 text-white" : "border-2 border-zinc-300 dark:border-white/20"
                  }`}
                  aria-hidden
                >
                  {p.feito ? "✓" : ""}
                </span>
                <span className={`text-sm ${p.feito ? "text-zinc-400 dark:text-[#a9bccd] line-through" : "text-[#0f2d4a] dark:text-[#e8edf5] font-semibold"}`}>
                  {p.titulo}
                </span>
                {!p.feito && p.href && <span className="ml-auto text-sm font-bold text-[#1a6aad] dark:text-[#3db8d4]">→</span>}
              </>
            );
            return (
              <li key={p.titulo}>
                {p.href && !p.feito ? (
                  <Link href={p.href} className="flex items-center gap-3 rounded-lg px-2 py-1.5 -mx-2 hover:bg-[#e8f6fa] dark:hover:bg-white/5 transition-colors">
                    {conteudo}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-2 py-1.5 -mx-2">{conteudo}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {!completo && dias < META_DIAS && (
        <p className="mt-3 text-xs text-[#0f2d4a]/80 dark:text-[#a9bccd]">
          💡 Salve o site na tela inicial do celular: no próximo plantão ele abre como um aplicativo.
        </p>
      )}
    </section>
  );
}
