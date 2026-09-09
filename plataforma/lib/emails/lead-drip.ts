import { escapeHtml } from "@/lib/escape";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.rotinaclinica.com";

function base(content: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f5f9;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dde6ef">
        <tr><td style="background:#0f2d4a;padding:28px 32px">
          <p style="margin:0;color:#fff;font-size:20px;font-weight:700">Rotina Clínica</p>
        </td></tr>
        <tr><td style="padding:32px">
          ${content}
        </td></tr>
        <tr><td style="padding:16px 32px 28px;border-top:1px solid #f1f5f9">
          <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center">
            Rotina Clinica Educação Médica Ltda. · CNPJ 65.937.147/0001-58<br>
            contato@rotinaclinica.com
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string) {
  return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0">
    <a href="${href}" style="display:inline-block;background:#3db8d4;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px">${label}</a>
  </td></tr></table>`;
}

export function leadDripHtml2(name: string) {
  const safe = name ? `, <strong>${escapeHtml(name)}</strong>` : "";
  const items = [
    "Prescrições e condutas prontas para os cenários mais comuns do plantão",
    "Calculadoras e escores clínicos organizados para uso rápido",
    "Curso Destravando o Plantão — as 10 queixas mais prevalentes do paciente adulto",
    "Casos clínicos novos discutidos toda semana",
    "Ebooks e modelos de evolução disponíveis offline",
    "Acesso imediato em qualquer dispositivo",
  ].map(i => `<p style="margin:0 0 8px;color:#475569;font-size:15px">✅ ${escapeHtml(i)}</p>`).join("");

  return base(`
    <p style="margin:0 0 12px;color:#0f2d4a;font-size:17px;font-weight:600">Você já conhece a qualidade — veja o que mais te espera</p>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7">
      Olá${safe}! Você baixou um dos nossos ebooks gratuitos há dois dias. Esperamos que o conteúdo tenha sido útil para a sua prática.
    </p>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7">
      O que você baixou é só uma amostra do que a plataforma do Rotina Clínica oferece. Para quem está no plantão ou na UBS, o acesso completo inclui:
    </p>
    ${items}
    <p style="margin:20px 0 24px;color:#475569;font-size:15px;line-height:1.7">
      Tudo isso por menos de <strong>R$ 1,10 por dia</strong> no plano anual. Crie sua conta e comece agora.
    </p>
    ${btn(`${APP_URL}/registro?plano=anual`, "Criar conta e assinar →")}
    <p style="margin:20px 0 0;color:#94a3b8;font-size:13px;text-align:center">
      Qualquer dúvida, é só responder este email.<br>Bons plantões, Equipe Rotina Clínica
    </p>
  `);
}

export function leadDripHtml7(name: string) {
  const safe = name ? `, <strong>${escapeHtml(name)}</strong>` : "";
  return base(`
    <p style="margin:0 0 12px;color:#0f2d4a;font-size:17px;font-weight:600">A plataforma vai muito além do que você baixou</p>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7">
      Olá${safe}! Faz uma semana desde que você baixou nosso ebook. Se o conteúdo foi útil, imagine ter acesso a tudo isso de forma organizada, atualizada e sempre no seu bolso.
    </p>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7">
      A plataforma do Rotina Clínica foi criada para estar presente em cada momento da sua rotina — na faculdade, no internato, nos plantões e na UBS — com prescrições prontas, calculadoras clínicas, discussão de casos toda semana, o curso Destravando o Plantão e muito mais.
    </p>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7">
      Se quiser conhecer melhor antes de assinar, basta responder este email. Estamos aqui.
    </p>
    ${btn(`${APP_URL}/assinatura`, "Conhecer os planos →")}
    <p style="margin:20px 0 0;color:#94a3b8;font-size:13px;text-align:center">
      Esta é nossa última mensagem automática. A partir de agora, só entraremos em contato se você quiser.<br><br>
      Bons plantões, Equipe Rotina Clínica
    </p>
  `);
}
