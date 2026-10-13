import { escapeHtml } from "@/lib/escape";

// Emails de onboarding (novos assinantes) e de recuperação de checkout
// abandonado. Disparados pelo cron /api/cron/drip-emails.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.rotinaclinica.com";

function base(title: string, content: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f5f9;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dde6ef">
        <tr><td style="background:#0f2d4a;padding:28px 32px">
          <p style="margin:0 0 4px;color:#3db8d4;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase">Rotina Clínica</p>
          <p style="margin:0;color:#fff;font-size:20px;font-weight:700">${title}</p>
        </td></tr>
        <tr><td style="padding:32px">
          ${content}
          <p style="margin:28px 0 0;color:#0f2d4a;font-size:14px;line-height:1.6">
            Um abraço,<br><strong>Lucas e Yan</strong> · Rotina Clínica
          </p>
          <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;text-align:center;line-height:1.6">
            Dúvidas? É só responder este email ou escrever para contato@rotinaclinica.com
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const hello = (name: string) =>
  `<p style="margin:0 0 14px;color:#0f2d4a;font-size:16px">Olá${name ? `, <strong>${escapeHtml(name)}</strong>` : ""}!</p>`;

const p = (html: string) =>
  `<p style="margin:0 0 16px;color:#4a6a80;font-size:15px;line-height:1.65">${html}</p>`;

function btn(href: string, label: string) {
  return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 20px">
    <a href="${href}" style="display:inline-block;background:#3db8d4;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px">${label}</a>
  </td></tr></table>`;
}

function item(emoji: string, title: string, desc: string, href: string) {
  return `<tr><td style="padding:10px 0;border-bottom:1px solid #eef3f7">
    <a href="${href}" style="text-decoration:none">
      <p style="margin:0;color:#0f2d4a;font-size:15px;font-weight:700">${emoji} ${title}</p>
      <p style="margin:4px 0 0;color:#64748b;font-size:13px;line-height:1.5">${desc}</p>
    </a>
  </td></tr>`;
}

const list = (rows: string) =>
  `<table width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 22px">${rows}</table>`;

// ── Onboarding ──────────────────────────────────────────────────────────────

// D1: os 3 atalhos que resolvem o plantão
export function onboardingD1(name: string) {
  return base("Seu primeiro plantão com o Rotina Clínica", `
    ${hello(name)}
    ${p("Seja muito bem-vindo(a)! Para tirar proveito desde o primeiro plantão, comece por estes três atalhos:")}
    ${list(
      item("📋", "Condutas Clínicas", "Mais de 250 temas: busque pela queixa, diagnóstico ou medicamento e tenha a conduta em segundos.", `${APP_URL}/dashboard/prescricoes`) +
      item("🧮", "Calculadoras e escores", "Os cálculos e escores do dia a dia, prontos para usar à beira do leito.", `${APP_URL}/dashboard/calculadoras`) +
      item("📝", "Modelos de evolução", "Evoluções prontas para copiar e adaptar, ganhando tempo no atendimento.", `${APP_URL}/dashboard/evolucoes`)
    )}
    ${p("💡 <strong>Dica:</strong> adicione o site à tela inicial do celular. Assim a plataforma do Rotina Clínica fica a um toque, como um aplicativo.")}
    ${btn(`${APP_URL}/dashboard`, "Acessar a plataforma →")}
  `);
}

// D3: quem ainda não entrou recebe um empurrão; quem entrou, o resto do arsenal
export function onboardingD3(name: string, jaAcessou: boolean) {
  if (!jaAcessou) {
    return base("Seu acesso está pronto esperando por você", `
      ${hello(name)}
      ${p("Vimos que você ainda não entrou na plataforma desde a assinatura. Está tudo liberado: condutas, calculadoras, modelos de evolução, cursos e muito mais.")}
      ${p("Leva menos de um minuto: entre com o mesmo email da compra e faça uma busca pela queixa do seu próximo paciente.")}
      ${btn(`${APP_URL}/dashboard`, "Fazer meu primeiro acesso →")}
      ${p("Se algo impediu o acesso (senha, login, pagamento), responda este email que resolvemos para você.")}
    `);
  }
  return base("Você ainda não viu tudo o que tem aqui", `
    ${hello(name)}
    ${p("Além das condutas e calculadoras, sua assinatura inclui:")}
    ${list(
      item("🎓", "Cursos e videoaulas", "Aulas práticas para o dia a dia do plantão.", `${APP_URL}/dashboard/cursos`) +
      item("🩺", "Casos clínicos", "Treine o raciocínio com casos do mundo real.", `${APP_URL}/dashboard/casos`) +
      item("🎯", "Desafio clínico", "Questões para testar e fixar o conhecimento.", `${APP_URL}/dashboard/quiz`) +
      item("📚", "Materiais e ebooks", "Materiais de apoio para consultar quando precisar.", `${APP_URL}/dashboard/materiais`)
    )}
    ${btn(`${APP_URL}/dashboard`, "Explorar a plataforma →")}
  `);
}

// D6: ferramentas de organização + convite a responder (feedback)
export function onboardingD6(name: string) {
  return base("Deixe a plataforma com a sua cara", `
    ${hello(name)}
    ${p("Duas ferramentas que fazem a plataforma virar parte da sua rotina:")}
    ${list(
      item("🗒️", "Anotações", "Guarde seus resumos e lembretes num só lugar, acessível de qualquer dispositivo.", `${APP_URL}/dashboard/anotacoes`) +
      item("🔎", "CID-10", "Encontre o código certo rapidamente na hora de preencher documentos.", `${APP_URL}/dashboard/cid`)
    )}
    ${p("E queremos te ouvir: <strong>o que você mais gostaria de encontrar aqui?</strong> Responda este email. Lemos todas as mensagens e elas viram melhorias na plataforma.")}
    ${btn(`${APP_URL}/dashboard`, "Acessar a plataforma →")}
  `);
}

// ── Recuperação de checkout ─────────────────────────────────────────────────

const PLANO_LABEL = { mensal: "mensal", anual: "anual" } as const;

export function checkoutRecovery1(name: string, plano: "mensal" | "anual") {
  return base("Sua assinatura ficou pela metade", `
    ${hello(name)}
    ${p(`Vimos que você iniciou a assinatura do plano <strong>${PLANO_LABEL[plano]}</strong> do Rotina Clínica, mas o pagamento não foi concluído.`)}
    ${p("Se foi só falta de tempo, você retoma de onde parou. No cartão de crédito a liberação é imediata e a renovação é automática: você não precisa se lembrar de pagar e não perde o acesso no meio de um plantão.")}
    ${btn(`${APP_URL}/checkout?plano=${plano}`, "Concluir minha assinatura →")}
    ${p("Teve algum problema no pagamento? Responda este email que ajudamos você.")}
  `);
}

export function checkoutRecovery2(name: string, plano: "mensal" | "anual") {
  return base("Ainda dá tempo de concluir", `
    ${hello(name)}
    ${p("Passando para lembrar que sua assinatura ainda não foi concluída. Com ela você tem, num só lugar:")}
    ${list(
      item("📋", "Condutas Clínicas", "Mais de 250 temas, de emergência à atenção primária.", `${APP_URL}/assinatura`) +
      item("🧮", "Calculadoras, evoluções e CID-10", "As ferramentas do dia a dia, prontas no celular.", `${APP_URL}/assinatura`) +
      item("🎓", "Cursos, casos clínicos e desafios", "Para estudar no seu ritmo.", `${APP_URL}/assinatura`)
    )}
    ${btn(`${APP_URL}/checkout?plano=${plano}`, "Concluir no cartão →")}
    ${p(`Prefere outro plano ou forma de pagamento? <a href="${APP_URL}/assinatura#planos" style="color:#1a6aad;font-weight:600">Veja todas as opções</a>.`)}
  `);
}

// ── Teste grátis (Condutas, Evoluções e Calculadoras por 7 dias) ────────────

const TRIAL_CHECKOUT = `${APP_URL}/checkout?plano=mensal`;

const trialLista = () =>
  list(
    item("📋", "Condutas Clínicas", "Busque pela queixa, diagnóstico ou medicamento e tenha a conduta em segundos.", `${APP_URL}/dashboard/prescricoes`) +
    item("📝", "Modelos de evolução", "Evoluções prontas para copiar e adaptar.", `${APP_URL}/dashboard/evolucoes`) +
    item("🧮", "Calculadoras e escores", "Os cálculos do dia a dia à beira do leito.", `${APP_URL}/dashboard/calculadoras`)
  );

const assinanteExtras = () =>
  p("Assinando, você mantém tudo isso e libera também <strong>cursos e videoaulas, casos clínicos, desafio clínico, materiais e anotações</strong>.");

export function trialD1(name: string) {
  return base("Seu teste grátis começou", `
    ${hello(name)}
    ${p("Seu teste de 7 dias do Rotina Clínica está ativo. Para aproveitar ao máximo, leve a plataforma para o seu próximo plantão ou atendimento na UBS:")}
    ${trialLista()}
    ${p("💡 <strong>Dica:</strong> adicione o site à tela inicial do celular. Assim a plataforma do Rotina Clínica fica a um toque, como um aplicativo.")}
    ${btn(`${APP_URL}/dashboard`, "Acessar a plataforma →")}
  `);
}

export function trialD5(name: string) {
  return base("Seu teste termina em 2 dias", `
    ${hello(name)}
    ${p("Faltam <strong>2 dias</strong> para o fim do seu teste grátis. Se a plataforma já está ajudando no seu dia a dia, garanta a continuidade sem interrupção.")}
    ${assinanteExtras()}
    ${btn(TRIAL_CHECKOUT, "Assinar no cartão →")}
    ${p("💳 No cartão a renovação é automática: você não precisa se lembrar de pagar e não perde o acesso no meio de um plantão. Sem fidelidade.")}
    ${p(`Prefere Pix ou o plano anual? <a href="${APP_URL}/assinatura#planos" style="color:#1a6aad;font-weight:600">Veja todos os planos</a>.`)}
  `);
}

export function trialEnded(name: string) {
  return base("Seu teste grátis terminou", `
    ${hello(name)}
    ${p("Seu teste de 7 dias chegou ao fim e o acesso foi pausado. Obrigado por experimentar o Rotina Clínica!")}
    ${p("Para voltar a usar as condutas, os modelos de evolução e as calculadoras, e liberar todo o resto da plataforma, é só assinar:")}
    ${btn(TRIAL_CHECKOUT, "Continuar com acesso completo →")}
    ${assinanteExtras()}
    ${p("Ficou alguma dúvida ou faltou algo que você esperava encontrar? Responda este email. Sua opinião ajuda a melhorar a plataforma.")}
  `);
}

export function trialAfter3(name: string) {
  return base("Sua aliada na prática clínica continua aqui", `
    ${hello(name)}
    ${p("Há alguns dias seu teste grátis terminou. Seguimos aqui para quando você quiser voltar: condutas, modelos de evolução, calculadoras, cursos e muito mais, num só lugar.")}
    ${btn(TRIAL_CHECKOUT, "Assinar no cartão →")}
    ${p(`Prefere outro plano ou forma de pagamento? <a href="${APP_URL}/assinatura#planos" style="color:#1a6aad;font-weight:600">Veja todas as opções</a>.`)}
  `);
}
