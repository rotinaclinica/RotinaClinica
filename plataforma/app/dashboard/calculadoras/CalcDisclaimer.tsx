export default function CalcDisclaimer() {
  return (
    <div className="rounded-xl border border-[#3db8d4]/20 bg-[#3db8d4]/5 dark:bg-[#3db8d4]/5 px-4 py-3.5 flex gap-3">
      <svg className="shrink-0 mt-0.5 text-[#3db8d4]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p className="text-[11px] text-zinc-500 dark:text-[#7a9aae] leading-relaxed">
        <span className="font-bold text-zinc-600 dark:text-[#9abcce]">Lembrar: score sugere a conduta.</span>{" "}
        Cabe ao médico assistente entender o contexto do paciente e se atentar para alterações clínicas que não são avaliadas nessas ferramentas.
        Exemplos: presença de hipoxemia, paciente incapaz de ingerir medicação pela via oral, &ldquo;insuficiência familiar&rdquo;, dentre outras situações.
      </p>
    </div>
  );
}
