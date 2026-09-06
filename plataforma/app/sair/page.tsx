import Link from "next/link";
import { signOut } from "@/lib/auth";
import { Logo } from "@/app/components/Navbar";

export default function SairPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f2d4a] px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/"><Logo variant="light" /></Link>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-white/10 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0f2d4a] flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>

          <h1 className="text-2xl font-extrabold text-[#0f2d4a] mb-2">Encerrar sessão</h1>
          <p className="text-zinc-500 text-sm leading-relaxed mb-8">
            Tem certeza que deseja sair da sua conta?<br />
            Você precisará fazer login novamente para acessar a plataforma.
          </p>

          <div className="flex flex-col gap-3">
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}>
              <button
                type="submit"
                className="w-full bg-[#0f2d4a] hover:bg-[#1a4060] text-white py-3.5 rounded-xl font-bold text-sm transition-colors"
              >
                Sim, encerrar sessão
              </button>
            </form>

            <Link
              href="/dashboard"
              className="w-full border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-600 py-3.5 rounded-xl font-semibold text-sm transition-colors text-center"
            >
              Cancelar
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-white/90 mt-6">
          © {new Date().getFullYear()} Rotina Clínica<br />
          Rotina Clinica Educação Médica Ltda. · CNPJ 65.937.147/0001-58
        </p>
      </div>
    </div>
  );
}
