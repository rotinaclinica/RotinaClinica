import Link from "next/link";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  return (
    <img
      src={variant === "light" ? "/images/logo-branco.png" : "/images/logo-azul.png"}
      alt="Rotina Clínica"
      className="h-7 sm:h-9 w-auto"
    />
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#0f2d4a] border-b border-white/10 shadow-lg">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex-shrink-0">
          <Logo variant="light" />
        </Link>

        <div className="hidden md:flex items-center gap-3 text-sm font-medium">
          <Link href="/produtos" className="text-[#9ec4de] hover:text-white transition-colors px-3 py-1.5">Ebooks e Cursos</Link>
          <Link href="/conheca" className="text-[#9ec4de] hover:text-white transition-colors px-3 py-1.5">Conheça o Rotina Clínica</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-white border border-white/30 rounded-lg hover:border-white hover:bg-white/10 transition-all"
          >
            Entrar
          </Link>
          <Link
            href="/registro"
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-[#0f2d4a] bg-[#3db8d4] rounded-lg hover:bg-[#5CC8E8] transition-all shadow-md"
          >
            Começar agora
          </Link>
        </div>
      </nav>
    </header>
  );
}
