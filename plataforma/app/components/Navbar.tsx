import Link from "next/link";

function StethoscopeIcon({ light = false, size = 44 }: { light?: boolean; size?: number }) {
  const gradId = light ? "rcg-l" : "rcg-d";
  const tipColor = "#5CC8E8";
  const midColor = "#2575C0";
  const botColor = light ? "#2060AA" : "#1555A5";

  return (
    <svg viewBox="0 0 100 112" width={size} height={size} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="50" y1="8" x2="50" y2="104" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={tipColor} />
          <stop offset="48%" stopColor={midColor} />
          <stop offset="100%" stopColor={botColor} />
        </linearGradient>
      </defs>

      {/* Left ear arm — curves up-left */}
      <path
        d="M49 40 C44 33 34 23 22 14"
        stroke={`url(#${gradId})`} strokeWidth="5" strokeLinecap="round" fill="none"
      />
      {/* Left earpiece tip circle */}
      <circle cx="19" cy="12" r="5" fill={tipColor} />

      {/* Right ear arm — mirror */}
      <path
        d="M51 40 C56 33 66 23 78 14"
        stroke={`url(#${gradId})`} strokeWidth="5" strokeLinecap="round" fill="none"
      />
      {/* Right earpiece tip circle */}
      <circle cx="81" cy="12" r="5" fill={tipColor} />

      {/* Yoke connector bar */}
      <rect x="38" y="36" width="24" height="9" rx="4.5" fill={midColor} />

      {/* Main tube from yoke down to oval */}
      <path
        d="M50 45 L50 57"
        stroke={`url(#${gradId})`} strokeWidth="5" strokeLinecap="round"
      />

      {/* Oval chest ring */}
      <ellipse
        cx="50" cy="72" rx="26" ry="15"
        stroke={`url(#${gradId})`} strokeWidth="5" fill="none"
      />

      {/* Exit tube to diaphragm */}
      <path
        d="M50 87 L50 93"
        stroke={botColor} strokeWidth="5" strokeLinecap="round"
      />

      {/* Diaphragm outer ring */}
      <circle cx="50" cy="100" r="8" stroke={botColor} strokeWidth="4" fill="none" />
      {/* Diaphragm center dot */}
      <circle cx="50" cy="100" r="3" fill={botColor} />
    </svg>
  );
}

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const textColor = variant === "light" ? "#ffffff" : "#0d2137";
  return (
    <div className="flex items-center gap-3">
      <StethoscopeIcon light={variant === "light"} size={42} />
      <span
        style={{ color: textColor, fontWeight: 800, fontSize: "1.25rem", letterSpacing: "0.04em", lineHeight: 1 }}
        className="uppercase tracking-wide whitespace-nowrap"
      >
        ROTINA CLÍNICA
      </span>
    </div>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#0f2d4a] border-b border-white/10 shadow-lg">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex-shrink-0">
          <Logo variant="light" />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#9ec4de]">
          <Link href="/#produtos" className="hover:text-white transition-colors">Cursos</Link>
          <Link href="/sobre" className="hover:text-white transition-colors">Sobre</Link>
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
