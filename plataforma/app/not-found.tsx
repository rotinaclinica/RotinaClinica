import Link from "next/link";

export const metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-9xl font-black text-white/10 mb-2 leading-none">404</p>
        <h1 className="text-2xl font-bold text-white mb-3">Página não encontrada</h1>
        <p className="text-[#6a8fa5] text-sm mb-8 leading-relaxed">
          O endereço que você acessou não existe ou foi removido.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#3db8d4] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#2da8c4] transition-colors"
        >
          Voltar para o início
        </Link>
      </div>
    </main>
  );
}
