import Link from "next/link";

export const metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-8xl font-black text-zinc-200 mb-4">404</p>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Página não encontrada</h1>
        <p className="text-zinc-500 text-sm mb-8">
          O endereço que você acessou não existe ou foi removido.
        </p>
        <Link
          href="/"
          className="inline-block bg-violet-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-violet-700 transition-colors"
        >
          Voltar para o início
        </Link>
      </div>
    </main>
  );
}
