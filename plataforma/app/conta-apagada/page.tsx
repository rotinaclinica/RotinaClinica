export const metadata = { title: "Conta apagada · Rotina Clínica" };

import Link from "next/link";

export default function ContaApagadaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white dark:bg-[#0a1728]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
            Sua conta foi apagada
          </h1>
          <p className="text-sm text-zinc-600 dark:text-[#8ea6b8] mt-3 leading-relaxed">
            Seus dados pessoais foram removidos do nosso sistema. Registros financeiros
            foram anonimizados e mantidos pelo prazo legal de 5 anos, conforme obrigação
            fiscal.
          </p>
          <p className="text-sm text-zinc-600 dark:text-[#8ea6b8] mt-3">
            Sentimos muito por te ver ir. Se um dia quiser voltar, é só criar uma conta nova.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block bg-[#1a6aad] hover:bg-[#0f2d4a] text-white px-6 py-2.5 rounded-xl font-bold text-sm"
        >
          Voltar ao site
        </Link>
      </div>
    </div>
  );
}
