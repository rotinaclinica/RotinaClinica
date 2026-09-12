import { NextRequest, NextResponse } from "next/server";
import { head } from "@vercel/blob";
import { sendDownloadHealthAlert } from "@/lib/email";
import fs from "fs";
import path from "path";

export const maxDuration = 60;

interface CheckResult {
  name: string;
  ok: boolean;
  error?: string;
}

const BLOB_EBOOKS: { name: string; url: string }[] = [
  {
    name: "Manual de Prescrições (pago)",
    url: "https://ou9gedwcm8mxxcyr.private.blob.vercel-storage.com/ebooks/manual-prescricoes.pdf",
  },
  {
    name: "Guia de Intubação (pago)",
    url: "https://ou9gedwcm8mxxcyr.private.blob.vercel-storage.com/ebooks/guia-intubacao.pdf",
  },
  {
    name: "Ebook Racional da Prescrição (gratuito)",
    url: "https://ou9gedwcm8mxxcyr.private.blob.vercel-storage.com/Ebook%20gratuito%20-%20O%20racional%20da%20prescri%C3%A7%C3%A3o%20m%C3%A9dica.pdf",
  },
  {
    name: "Amostra Manual de Prescrições (gratuito)",
    url: "https://ou9gedwcm8mxxcyr.private.blob.vercel-storage.com/Amostra%20-%20Manual%20pr%C3%A1tico%20de%20prescri%C3%A7%C3%B5es.pdf",
  },
];

const FS_EBOOKS = [
  "Abordagem da Constipação Intestinal.pdf",
  "Abordagem de Náuseas e Vômitos.pdf",
  "Dor e Analgesia.pdf",
  "Aula Dengue.pdf",
  "DRGE e suas complicações o essencial para o generalista.pdf",
  "Distúrbios do Potássio.pdf",
  "Distúrbios do Sódio.pdf",
  "Prescrição Racional.pdf",
  "Diarreia Crônica.pdf",
  "Enzimas Hepáticas, Icterícia e Cirrose Hepática.pdf",
  "Hepatites Virais.pdf",
  "Pancreatite Aguda e Crônica.pdf",
];

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET não configurado" }, { status: 500 });
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const results: CheckResult[] = [];

  // 1) Check Blob-hosted ebooks via head()
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    // Token ausente — registra como aviso mas NÃO dispara alerta
    // (os downloads funcionam normalmente, a env var pode não estar visível neste contexto)
    console.warn("[health-check] BLOB_READ_WRITE_TOKEN ausente neste contexto — pulando verificação de blobs");
  } else {
    for (const ebook of BLOB_EBOOKS) {
      try {
        const meta = await head(ebook.url, { token });
        if (!meta || meta.size === 0) {
          results.push({ name: ebook.name, ok: false, error: "Blob retornou tamanho 0" });
        } else {
          results.push({ name: ebook.name, ok: true });
        }
      } catch (err) {
        results.push({
          name: ebook.name,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  // 2) Check filesystem ebooks
  for (const file of FS_EBOOKS) {
    const filePath = path.join(process.cwd(), "public", "aulasconteudooffline", file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.size === 0) {
        results.push({ name: file, ok: false, error: "Arquivo com tamanho 0" });
      } else {
        results.push({ name: file, ok: true });
      }
    } catch {
      results.push({ name: file, ok: false, error: "Arquivo não encontrado no filesystem" });
    }
  }

  const failures = results.filter((r) => !r.ok);

  if (failures.length > 0) {
    console.error("[health-check] Falhas detectadas:", JSON.stringify(failures));
    try {
      await sendDownloadHealthAlert(failures);
    } catch (emailErr) {
      console.error("[health-check] Falha ao enviar email de alerta:", emailErr);
    }
  }

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    total: results.length,
    ok: results.filter((r) => r.ok).length,
    failures: failures.length,
    details: results,
  });
}
