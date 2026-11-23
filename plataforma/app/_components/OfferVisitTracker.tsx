"use client";

import { useEffect } from "react";

/**
 * Conta visitas a páginas de oferta (ex.: /black-week) e ao checkout aberto
 * por essas ofertas, com ou sem login. Usa o mesmo id aleatório do navegador
 * do AnonCheckoutTracker (rc_vid, sem dado pessoal) para contar pessoas.
 *
 * A origem vem da URL desta visita (utm_*), e não do cookie rc_utm, que guarda
 * só o primeiro acesso: queremos saber de onde veio o clique NA OFERTA
 * (post, story, e-mail, anúncio). Sem UTM, cai no domínio de quem indicou.
 */
export default function OfferVisitTracker({ slug, step }: { slug: string; step?: "checkout" }) {
  useEffect(() => {
    let visitorId: string | null = null;
    try {
      visitorId = localStorage.getItem("rc_vid");
      if (!visitorId) {
        visitorId = crypto.randomUUID().replace(/-/g, "");
        localStorage.setItem("rc_vid", visitorId);
      }
    } catch {
      visitorId = null;
    }
    if (!visitorId) return;

    const p = new URLSearchParams(location.search);
    let origem = [p.get("utm_source"), p.get("utm_medium"), p.get("utm_campaign"), p.get("utm_content")]
      .map((v) => v ?? "")
      .join(".")
      .replace(/\.+$/, "");
    if (!origem) {
      try {
        const host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
        origem = host && !host.includes("rotinaclinica") ? `ref.${host}` : "";
      } catch {
        origem = "";
      }
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: `/oferta/${slug}${step ? `/${step}` : ""}`,
        visitorId,
        origem: origem || "direto",
      }),
      keepalive: true,
    }).catch(() => {});
  }, [slug, step]);

  return null;
}
