"use client";

import { useState } from "react";

export default function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full py-2.5 rounded-xl border border-[#0f2d4a] text-[#0f2d4a] text-sm font-semibold hover:bg-[#0f2d4a] hover:text-white transition-all"
    >
      {copied ? "✓ Copiado!" : "Copiar código PIX"}
    </button>
  );
}
