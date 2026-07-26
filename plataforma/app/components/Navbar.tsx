import Link from "next/link";

function StethoscopeIcon({ light = false, className = "" }: { light?: boolean; className?: string }) {
  const c1 = light ? "#3db8d4" : "#1a6aad";
  const c2 = light ? "#7dd8e8" : "#3db8d4";
  return (
    <svg
      viewBox="0 0 40 40"
      width="34"
      height="34"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* chest piece */}
      <circle cx="20" cy="29" r="6.5" stroke={c1} strokeWidth="2.4" />
      <circle cx="20" cy="29" r="2.8" fill={c2} />
      {/* tubing */}
      <path d="M20 22.5 L20 15" stroke={c1} strokeWidth="2.4" strokeLinecap="round" />
      {/* curves to earpieces */}
      <path d="M20 15 Q20 7 11 7" stroke={c1} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M20 15 Q20 7 29 7" stroke={c1} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* earpieces */}
      <circle cx="11" cy="7" r="2.4" fill={c2} />
      <circle cx="29" cy="7" r="2.4" fill={c2} />
    </svg>
  );
}

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const textColor = variant === "light" ? "text-white" : "text-[#0f2d4a]";
  const subColor = variant === "light" ? "text-[#3db8d4]" : "text-[#1a6aad]";
  return (
    <div className="flex items-center gap-2.5">
      <StethoscopeIcon light={variant === "light"} />
      <div className="flex flex-col leading-none">
        <span className={`font-extrabold text-[15px] tracking-widest uppercase ${textColor}`}>
          ROTINA
        </span>
        <span className={`font-semibold text-[11px] tracking-[0.35em] uppercase ${subColor}`}>
          CLÍNICA
        </span>
      </div>
    </div>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-zinc-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex-shrink-0">
          <Logo variant="dark" />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
          <Link href="/#produtos" className="hover:text-[#0f2d4a] transition-colors">
            Cursos
          </Link>
          <Link href="/sobre" className="hover:text-[#0f2d4a] transition-colors">
            Sobre
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-[#0f2d4a] border border-[#0f2d4a] rounded-lg hover:bg-[#0f2d4a] hover:text-white transition-all"
          >
            Entrar
          </Link>
          <Link
            href="/registro"
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-[#1a6aad] rounded-lg hover:bg-[#0f2d4a] transition-all"
          >
            Começar agora
          </Link>
        </div>
      </nav>
    </header>
  );
}
