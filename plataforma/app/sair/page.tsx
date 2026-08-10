import Link from "next/link";
import { signOut } from "@/lib/auth";
import { Logo } from "@/app/components/Navbar";

export default function SairPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f7ff] px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/"><Logo variant="dark" /></Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>

          <h1 className="text-xl font-extrabold text-[#0f2d4a] mb-2">Sair da conta</h1>
          <p className="text-zinc-500 text-sm mb-7">
            Tem certeza que deseja encerrar sua sessão?
          </p>

          <div className="flex flex-col gap-3">
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}>
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm transition-colors"
              >
                Sim, sair
              </button>
            </form>

            <Link
              href="/dashboard"
              className="w-full bg-[#0f2d4a]/6 hover:bg-[#0f2d4a]/10 text-[#0f2d4a] py-3 rounded-xl font-semibold text-sm transition-colors text-center"
            >
              Voltar ao início
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-6">
          © {new Date().getFullYear()} Rotina Clínica
        </p>
      </div>
    </div>
  );
}
