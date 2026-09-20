"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccountSection({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [ack, setAck] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const CONFIRM_PHRASE = "APAGAR MINHA CONTA";
  const canSubmit =
    ack &&
    confirmText.trim().toUpperCase() === CONFIRM_PHRASE &&
    password.length > 0 &&
    !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/me", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, reason: reason.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao apagar a conta.");
        setLoading(false);
        return;
      }
      router.push("/conta-apagada");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <section className="bg-white dark:bg-[#131c2e] border border-red-200 dark:border-red-900/40 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">
          Zona de risco
        </h2>
        <p className="text-sm text-zinc-600 dark:text-[#8ea6b8] mb-4">
          Apagar sua conta remove seus dados pessoais permanentemente (LGPD Art. 18, VI).
          Registros de pagamento ficam anonimizados por 5 anos por obrigação fiscal.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm font-semibold text-red-600 hover:text-red-700 underline underline-offset-2"
        >
          Quero apagar minha conta
        </button>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-[#131c2e] border-2 border-red-300 dark:border-red-800 rounded-2xl p-6">
      <h2 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-4">
        Confirmar exclusão de conta
      </h2>

      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4 space-y-2 mb-5">
        <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 list-disc list-inside">
          <li>Sua assinatura ativa será <strong>cancelada imediatamente</strong>.</li>
          <li>Seus dados pessoais (nome, CPF, telefone, CEP) serão <strong>apagados</strong>.</li>
          <li>Registros de pagamento serão <strong>anonimizados</strong> mas mantidos por 5 anos.</li>
          <li>Você será desconectado de todos os dispositivos.</li>
          <li><strong>Não é possível reverter.</strong></li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-[#c8dce8] mb-1.5">
            Conta que será apagada
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-500 bg-zinc-100 dark:bg-[#1a2d45]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-[#c8dce8] mb-1.5">
            Confirme sua senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-[#e8edf5] bg-white dark:bg-[#1a2d45] focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-[#c8dce8] mb-1.5">
            Motivo (opcional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Se quiser contar, a gente agradece o retorno..."
            className="w-full border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-[#e8edf5] bg-white dark:bg-[#1a2d45]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-[#c8dce8] mb-1.5">
            Digite <span className="font-mono text-red-600">{CONFIRM_PHRASE}</span> para confirmar
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_PHRASE}
            className="w-full border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-[#e8edf5] bg-white dark:bg-[#1a2d45] font-mono uppercase"
          />
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-sm text-zinc-700 dark:text-[#c8dce8]">
            Entendi que esta ação é irreversível.
          </span>
        </label>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => { setOpen(false); setPassword(""); setReason(""); setConfirmText(""); setAck(false); setError(""); }}
            className="flex-1 sm:flex-none border border-zinc-300 dark:border-white/10 text-zinc-700 dark:text-[#c8dce8] px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            {loading ? "Apagando..." : "Apagar minha conta"}
          </button>
        </div>
      </form>
    </section>
  );
}
