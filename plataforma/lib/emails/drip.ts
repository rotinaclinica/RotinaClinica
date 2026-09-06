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

export function dripHtml0(name: string) {
  const safe = name ? `, <strong>${escapeHtml(name)}</strong>` : "";
  return base(`
    <p style="margin:0 0 12px;color:#0f2d4a;font-size:17px;font-weight:600">Bem-vindo à plataforma do Rotina Clínica!</p>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7">
      Olá${safe}! Seu cadastro foi criado com sucesso.
    </p>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7">
      A plataforma foi desenvolvida para estar presente em cada etapa da sua jornada — na faculdade, no internato, nos plantões e nos atendimentos da UBS — com modelos de evolução e condutas prontas, calculadoras clínicas, discussão de casos novos toda semana, o curso Destravando o Plantão, conteúdos exclusivos dos nossos parceiros e ebooks disponíveis para uso offline.
    </p>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7">
      Tudo isso por <strong>R$ 33,30/mês</strong> no plano anual.
    </p>
    ${btn(`${APP_URL}/checkout?plano=anual`, "Quero assinar agora →")}
    <p style="margin:20px 0 0;color:#94a3b8;font-size:13px;text-align:center">
      Se tiver qualquer dúvida, é só responder este email.<br>Bons plantões, Equipe Rotina Clínica
    </p>
  `);
}

export function dripHtml2(name: string) {
  const safe = name ? `, <strong>${escapeHtml(name)}</strong>` : "";
  const items = [
    "Modelos de evolução e condutas prontas para os cenários mais comuns do plantão",
    "Calculadoras e escores clínicos organizados para uso rápido",
    "Curso Destravando o Plantão — atendimento das 10 queixas mais prevalentes do paciente adulto!",
    "Conteúdos exclusivos dos nossos parceiros",
    "Ebooks disponíveis para uso offline",
    "Casos clínicos novos discutidos toda semana",
    "Acesso imediato em qualquer dispositivo",
  ].map(i => `<p style="margin:0 0 8px;color:#475569;font-size:15px">✅ ${escapeHtml(i)}</p>`).join("");

  return base(`
    <p style="margin:0 0 12px;color:#0f2d4a;font-size:17px;font-weight:600">Você ainda não explorou o que preparamos para você</p>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7">
      Olá${safe}! Você se cadastrou há dois dias na plataforma do Rotina Clínica — e queremos te mostrar o que está esperando por você:
    </p>
    ${items}
    <p style="margin:20px 0 24px;color:#475569;font-size:15px;line-height:1.7">
      Da faculdade ao internato, dos plantões à UBS — a plataforma do Rotina Clínica foi feita para estar onde você estiver.<br><br>
      Tudo isso por menos de <strong>R$ 1,10 por dia</strong>.
    </p>
    ${btn(`${APP_URL}/checkout?plano=anual`, "Acessar a plataforma →")}
    <p style="margin:20px 0 0;color:#94a3b8;font-size:13px;text-align:center">
      Atenciosamente, Equipe Rotina Clínica
    </p>
  `);
}

export function dripHtml7(name: string) {
  const safe = name ? `, <strong>${escapeHtml(name)}</strong>` : "";
  return base(`
    <p style="margin:0 0 12px;color:#0f2d4a;font-size:17px;font-weight:600">Última mensagem — queremos que você faça parte</p>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7">
      Olá${safe}! Faz uma semana desde que você criou sua conta na plataforma do Rotina Clínica, e ainda não tivemos o prazer de te ver como assinante.
    </p>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7">
      A plataforma foi criada para estar presente em cada momento da sua rotina médica — na faculdade, no internato, nos plantões e nos atendimentos da UBS — com modelos de evolução e condutas prontas, calculadoras clínicas, o curso Destravando o Plantão, conteúdos exclusivos dos nossos parceiros e ebooks para uso offline.
    </p>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7">
      Se tiver alguma dúvida ou quiser conhecer melhor antes de assinar, basta responder este email. Estamos aqui.
    </p>
    ${btn(`${APP_URL}/assinatura`, "Conhecer a plataforma →")}
    <p style="margin:20px 0 0;color:#94a3b8;font-size:13px;text-align:center">
      Esta é nossa última mensagem automática. A partir de agora, só entraremos em contato se você quiser.<br><br>
      Bons plantões, Equipe Rotina Clínica
    </p>
  `);
}
