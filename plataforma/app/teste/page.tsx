import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { auth } from "@/lib/auth";
import { canAccessPaidContent, getActiveTrialEnd, trialEligibility, TRIAL_DAYS } from "@/lib/subscription";
import { redirect } from "next/navigation";
import { activateTrialAction } from "./actions";

export const metadata = {
  title: "Teste grátis por 7 dias · Rotina Clínica",
  description: "Experimente grátis por 7 dias as Condutas Clínicas, os Modelos de evolução e as Calculadoras do Rotina Clínica.",
};

const FEATURES = [
  { emoji: "📋", title: "Condutas Clínicas", desc: "Mais de 250 temas de emergência, PS/UPA e atenção primária. Busque pela queixa, diagnóstico ou medicamento." },
  { emoji: "📝", title: "Modelos de evolução", desc: "Evoluções prontas para copiar e adaptar, ganhando tempo no atendimento." },
  { emoji: "🧮", title: "Calculadoras e escores", desc: "Os cálculos e escores do dia a dia, prontos para usar à beira do leito." },
];

export default async function TestePage() {
  const session = await auth();
  const userId = session?.user?.id;

  let state: "anon" | "eligible" | "used" = "anon";
  if (userId) {
    if (await canAccessPaidContent(userId)) redirect("/dashboard");
    if (await getActiveTrialEnd(userId)) redirect("/dashboard");
    const elig = await trialEligibility(userId);
    state = elig.ok ? "eligible" : "used";
  }

  return (
    <main className="min-h-screen bg-[#f7fafc]">
      <Navbar />

      <section className="bg-[#0f2d4a] py-14 sm:py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-[#3db8d4]/20 text-[#3db8d4] text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 border border-[#3db8d4]/30">
            {TRIAL_DAYS} dias grátis
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
            Teste a plataforma que veio para ser{" "}
            <span className="text-[#3db8d4]">sua aliada na prática clínica</span>
          </h1>
          <p className="text-[#a9bccd] text-base sm:text-lg max-w-2xl mx-auto">
            Durante {TRIAL_DAYS} dias, use no plantão e na UBS as ferramentas que mais fazem diferença no atendimento.
          </p>
        </div>
      </section>

      <section className="px-6 -mt-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#c9d6e3] shadow-[0_4px_20px_rgba(15,45,74,0.08)] p-6 sm:p-8">
          <p className="text-xs font-bold tracking-widest uppercase text-[#1a6aad] mb-4">Liberado no teste</p>
          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4">
                <span className="text-2xl leading-none mt-0.5">{f.emoji}</span>
                <div>
                  <p className="font-bold text-[#0f2d4a]">{f.title}</p>
                  <p className="text-sm text-[#2b3a4a] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[#e3ebf2]">
            {state === "anon" && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/registro?teste=1" className="flex-1 text-center bg-[#3db8d4] hover:bg-[#2fa6c2] text-[#0a1626] font-bold py-3.5 rounded-xl transition-colors">
                  Criar conta e começar o teste
                </Link>
                <Link href="/login?teste=1" className="flex-1 text-center border border-[#c9d6e3] text-[#0f2d4a] font-semibold py-3.5 rounded-xl hover:bg-[#f0f5f9] transition-colors">
                  Já tenho conta
                </Link>
              </div>
            )}

            {state === "eligible" && (
              <form action={activateTrialAction}>
                <button type="submit" className="w-full bg-[#3db8d4] hover:bg-[#2fa6c2] text-[#0a1626] font-bold py-3.5 rounded-xl transition-colors">
                  Ativar meus {TRIAL_DAYS} dias grátis
                </button>
              </form>
            )}

            {state === "used" && (
              <div className="text-center">
                <p className="text-[#0f2d4a] font-semibold mb-1">O teste grátis já foi utilizado nesta conta.</p>
                <p className="text-sm text-[#2b3a4a] mb-4">Assine para ter acesso completo, com renovação automática no cartão.</p>
                <Link href="/checkout?plano=mensal" className="inline-block bg-[#3db8d4] hover:bg-[#2fa6c2] text-[#0a1626] font-bold px-6 py-3 rounded-xl transition-colors">
                  Assinar agora →
                </Link>
              </div>
            )}

            <p className="text-xs text-[#4d6175] text-center mt-4">
              Ao fim dos {TRIAL_DAYS} dias, o acesso é pausado e você decide se quer assinar.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-[#2b3a4a]">
            Quer acesso completo desde já, com cursos, casos clínicos, desafios e materiais?{" "}
            <Link href="/assinatura#planos" className="font-semibold text-[#1a6aad] hover:underline">Conheça os planos</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
