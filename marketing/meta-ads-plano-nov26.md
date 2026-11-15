# Meta Ads — plano e diário, 03/11 a 03/12/2026

Conta 594058799378511 (pré-paga). Saldo em 03/11: R$ 1.021,14. Seguidores em 03/11: 51.207.

## Divisão da verba

| Frente | Campanha (ID) | Conjunto (ID) | Verba | Período | Criativo inicial |
|---|---|---|---|---|---|
| Seguidores | Seguidores IG — Posts Educativos (120246072070670490) | 120246072070650490 | R$ 300 | até 03/12 | Posts educativos campeões (120246286680710490) |
| Seguidores | Seguidores IG — Reels novos (120246398640670490) | 120246398644720490 | R$ 170 | até 03/12 | Reel FC na FA (120246398652340490) |
| Teste grátis | Teste Grátis — Cadastro (120246398642690490) | Reels 120246398645280490 | R$ 85 | até 17/11 | Reel CURB-65 (120246398692880490) |
| Teste grátis | idem | Carrossel 120246398645600490 | R$ 85 | até 17/11 | Carrossel 5 abas (120246398744710490) |
| Teste grátis | vencedor recebe | | R$ 130 | 18/11 a 03/12 | decidir em 17/11 |
| Assinatura | Assinatura — Público Quente (120246398642980490) | 120246398648030490 | R$ 100 | até 21/11 | Reel Plataforma (120246398753270490) |
| Reserva | | | ~R$ 150 | | escalar o que vencer |

Total comprometido: R$ 870. Ritmo: cerca de R$ 29/dia, até R$ 34/dia com a reserva.

## Regras de decisão

- **Seguidores (posts e Reels):** medir seguidores de anúncio por post no Insights, não custo por visita. Bom: até R$ 0,70. Trocar criativo acima de R$ 1,00, depois de pelo menos R$ 40 gastos nele. Trocar posts educativos a cada 2 semanas.
- **Reels novos:** um Reel novo por semana entra se tiver gancho clínico forte. Não pode ser collab com @yanalvesg (a Meta bloqueia). Reel que pede "Comente X" precisa da palavra cadastrada na automação de DM.
- **Teste grátis:** bom até R$ 15 por cadastro. Pausar criativo acima de R$ 30, depois de R$ 40 gastos. Atribuir pelo ID da campanha/anúncio, porque a Meta sobrescreve as UTMs.
- **Ativação:** meta de pelo menos 40% dos testes pagos com 2+ dias de uso. Abaixo de 20% em 15/11, não usar a reserva em teste grátis.
- **Assinatura:** depois de R$ 50 gastos sem nenhuma compra atribuída, pausar e devolver o restante à reserva.
- **Saldo:** nunca comprometer mais que o saldo disponível. O mínimo da Meta é ~R$ 5,51/dia por conjunto.

## Limites de medição conhecidos

- Quem deixou de seguir só aparece no app do Instagram. O número de seguidores é bruto.
- Lookalike de cadastrados não existe ainda: o público do pixel tem ~20 pessoas (mínimo 100). A alternativa é subir a lista do banco, o que depende de revisar LGPD.
- A Hotmart usa o mesmo pixel. InitiateCheckout e Purchase de lá entram nas contagens: 36 de 44 InitiateCheckout desde 08/10 vieram de pay.hotmart.com. Antes de aplicar a regra da Assinatura ou contar uma compra atribuída, separar por host (`/stats?aggregation=host&event=...`). Essas vendas não aparecem na tabela Order.
- "Abriram o checkout" só registra quem já está logado, porque /checkout manda o visitante sem sessão para /login antes. Quem desiste no login ou no cadastro não aparece.

## Diário

### 03/11/2026
Campanhas criadas e publicadas. Reel CAD já estava pausado. Revisão só de leitura agendada para segundas e quintas, às 19h: ela recomenda, e os ajustes são aplicados na sessão quando Lucas diz "aplica". A versão que ajustava sozinha foi bloqueada pela camada de permissões do Claude Code.

### 05/11/2026 (revisão, ~17h40)
Saldo R$ 949,08. Gasto desde 03/11: Posts R$ 29,81 · Reels R$ 9,46 · Teste Grátis R$ 25,12 (CURB-65 R$ 11,39 e Carrossel R$ 13,73, 1 cadastro cada) · Assinatura R$ 11,55 (37 LPV, 0 compras). Seguidores brutos: 48 em 03/11 e 50 em 04/11, contra base de 26–30/dia. Testes reais desde 03/11: 3. Vendas reais: 0 (último pedido pago em 02/11). Nenhuma regra disparou (todo criativo abaixo de R$ 40 gastos, Assinatura abaixo de R$ 50), então nada foi alterado. Em aberto: Purchase único da Meta coincide com o teste de CAPI de 03/11; StartTrial chega como 2 Servidor + 1 Navegador por teste real; InitiateCheckout de 04/11 ~18h sem pedido correspondente; domínio rotina-clinica.vercel.app a confirmar no pixel. Próxima decisão por dados: 09/11.

### 05/11/2026 (investigação do InitiateCheckout)
O evento de 04/11 21h UTC (18h BRT) veio de pay.hotmart.com, em um iPhone, 3 registros. Não é falha no checkout da plataforma: nenhum pedido nem erro de checkout desde 03/11 no banco. A única abertura de /checkout desde 03/11 é de conta ADMIN, em 03/11 23h04 BRT, por isso o quadro mostra 0. Logo, as 37 visitas à página da campanha Assinatura não chegaram a abrir o checkout logado. StartTrial real aparece como 2 em www.rotinaclinica.com e 1 em rotina-clinica.vercel.app; o de vercel.app bate com o envio pela CAPI, que montava a URL com NEXT_PUBLIC_APP_URL (corrigido no commit f0cae95: agora usa www.rotinaclinica.com). Campanhas sem alteração.

### 05/11/2026 (revisão, ~20h)
Saldo R$ 943,55. Gasto desde 03/11 (dia de hoje parcial): Posts R$ 31,06 · Reel FC na FA R$ 10,30 · CURB-65 R$ 12,31 e Carrossel R$ 14,74 (1 cadastro cada na Meta) · Assinatura R$ 12,21 (38 LPV, 0 compras). Abriram o checkout: 0. Receita do mês: R$ 39,90. Seguidores por anúncio não lidos nesta revisão. Nenhuma regra disparou, nada foi alterado. Próxima decisão por dados: 09/11.

### 08/11/2026 (análise profunda, pedida pelo usuário)
Gasto 03→08/11: R$ 181,39 (~R$ 32/dia). Posts educativos R$ 59,11 (478 visitas ao perfil, 71 salvamentos, 23 compartilhamentos) · Reel FC na FA R$ 27,92 (3.458 plays, 2,5% passam de 25%, média 2 s; R$ 17,75 foram para Stories) · CURB-65 R$ 32,30 (43 LPV, 1 cadastro) · Carrossel 5 abas R$ 34,48 (20 LPV, 1 cadastro, CPM R$ 31,5, R$ 2,78 na Audience Network) · Assinatura R$ 27,58 (84 LPV, 0 aberturas de checkout, 0 compras). Seguidores brutos/dia (Business Suite): 03–06/11 = 48, 50, 47, 57 (base pré-anúncio 26–30; 27–30/10 só com posts educativos = 66). Banco desde 01/10: anúncios 16 testes → 1 venda e 2 com 2+ dias de uso; link da bio 11 cadastros → 5 vendas. 9 assinaturas ACTIVE com período vencido. Nenhuma venda anual desde outubro. Recomendações entregues; nada alterado (aguarda "aplica").

### 08/11/2026 (ajustes aplicados, "aplica" do usuário)
- Seguidores Reels (conjunto 120246398644720490) e anúncio Reel FC (120246398652340490) PAUSADOS. Sobra de R$ 141,97 somada ao orçamento da campanha de posts: R$ 735 → R$ 876,97.
- Posts educativos: anúncio antigo (120246286680710490) PAUSADO; 5 novos, um por post, escolhidos pelo histórico de salvamentos/R$ dos impulsionamentos da conta: DPOC exacerbação (120246477535810490), IOT série final (120246477541820490), Hemorragia digestiva, "Não assuma plantão sem esse manejo", Trousseau/cálcio (120246477628060490). O post de medicações (08/2024) não pode mais ser anúncio (carrossel editado).
- Teste grátis: conjunto Carrossel (120246398645600490) PAUSADO, R$ 50,22 somados ao conjunto de Reels (R$ 85 → R$ 135,22); Audience Network/Messenger removidos (só Facebook + Instagram); 2º anúncio "Não assuma plantão" → /teste (120246477634340490, utm_content=post_plantao).
- Assinatura (conjunto 120246398648030490) PAUSADA: R$ 72,31 voltam para a reserva. Motivo: checkout exige login e o login descarta o destino (ver abaixo).
- Bug achado: /checkout manda o visitante sem sessão para /login?callbackUrl=..., mas o /login lê só `plano` e ignora callbackUrl, e o link "Criar conta" do login não repassa o plano. Quem vem do anúncio cai no painel/assinatura e nunca chega ao checkout.
- 08/11 (noite): cadastro curto no checkout publicado (commit c6c2265, testado no local). Assinatura (conjunto 120246398648030490) REATIVADA a pedido do usuário: R$ 72,28 restantes até 22/11, anúncio Reel Plataforma → /assinatura. Regra mantida: pausar com R$ 50 gastos desde a reativação sem compra. Medir em /admin/metricas: visitantes sem conta no checkout → cadastros → pagamentos.

### 08/11/2026 (diagnóstico do teste grátis, banco de produção)
- 36 testes desde 14/10 (sem contas de teste), 3 pagaram (8%). 23 (64%) nunca voltaram depois da 1ª sessão (nenhum acesso 2 h+ depois).
- Anúncio (ig/paid): 16 testes, 2 voltaram, 1 pagou. Orgânico/direto/e-mail: 20 testes, 11 voltaram, 2 pagaram (no mesmo dia, já decididos).
- A 1ª sessão do anúncio não é rasa: vários abriram 15–40 páginas (condutas, evoluções, calculadoras) e mesmo assim não voltaram. O problema é a volta, não a primeira impressão.
- Voltas tardias se concentram no dia 5 (111 h, 115 h, 129 h), o dia do e-mail "termina em 2 dias"; a única venda do anúncio veio aí. O prazo funciona; os e-mails de ativação D2/D4 (no ar desde ~30/10) ainda não trouxeram ninguém de volta (9 envios).
- 8 de 36 começaram o teste entre 0 h e 6 h (provável plantão noturno).
- Limites: a chave Resend é só de envio (aberturas só no painel da Resend); PageView não guarda qual conduta foi aberta; aberturas de /checkout por quem estava em teste não aparecem no histórico.

### 09/11/2026 (consulta do usuário, ~tarde)
Saldo R$ 760,25. Gasto 03→09/11: R$ 240,00. Posts educativos R$ 85,90 (anúncio antigo R$ 59,30 + v5 R$ 26,60, dos quais R$ 20,17 na Hemorragia digestiva; 756 visitas ao perfil, 91 salvamentos) · Reel FC (pausado) R$ 28,06 · Teste grátis R$ 89,28 (CURB-65 R$ 35,75, 45 LPV, 1 cadastro; Carrossel pausado R$ 34,80, 1 cadastro; "Não assuma plantão" R$ 18,73, 12 LPV, 0) · Assinatura R$ 36,76 (121 LPV, 0 compras; ~R$ 9 desde a reativação de 08/11). Banco desde 03/11: 6 cadastros, 4 testes (1 com utm pago teste_nov26), 0 assinaturas vindas das campanhas de novembro. Única venda paga do período: 09/11, mensal Pix R$ 39,90, conta criada em 18/10 pela Vendas v2 de outubro (teste grátis expirado em 25/10; voltou direto ao /checkout). Aberturas de /checkout logadas: 2 pessoas. Seguidores do dia não lidos. Nada alterado.
- 09/11 ("aplica" do usuário): anúncio Reel CURB-65 (120246398692880490) PAUSADO via API (status PAUSED confirmado; effective_status ainda IN_PROCESS logo depois). Motivo: R$ 35,75 por cadastro, acima do limite de R$ 30, a ~R$ 4 do mínimo de R$ 40 gastos. No conjunto de Reels do teste grátis segue só "Não assuma plantão" (R$ 18,73, 0 cadastros), que é avaliado ao chegar a R$ 40. Assinatura mantida (~R$ 9 de R$ 50 desde a reativação).
- 09/11 (melhorias pedidas pelo usuário, "pode ir fazendo todos"):
  - Reserva para a Black Friday (27/11): conjunto de Reels do teste grátis (120246398645280490) com orçamento total R$ 135,22 → R$ 77,00 e término 18/11 → 13/11 (restam R$ 22,32, o suficiente para o "Não assuma plantão" chegar aos R$ 40 da regra). Comprometido caiu de R$ 510,32 para R$ 452,10; com saldo de R$ 760,25, ficam ~R$ 308 livres, reservados para a semana da Black Friday (foco no anual).
  - Seguidores: sem alteração; Meta concentra ~75% no post de Hemorragia digestiva. Ler seguidores de anúncio por post em 15/11 e trocar acima de R$ 1/seguidor.
  - Assinatura: sem alteração; se chegar a R$ 50 desde 08/11 sem nenhuma abertura de /checkout, o problema é oferta/página.
  - Atribuição: o cadastro de 04/11 12h53 (bate com o cadastro que a Meta dá ao Carrossel em 04/11) entrou no banco com UTM e referrer totalmente vazios, ou seja, sem o cookie rc_utm. O script utm-capture (app/layout.tsx) sempre grava ao menos "direto/none" quando roda; vazio = cookie ausente no navegador do cadastro. Hipóteses: cadastro em outro navegador (abrir fora do app do Instagram), cookie bloqueado, ou script não executado. Correção proposta (não aplicada): capturar UTM/fbclid no servidor (proxy) e repassar UTM na URL de /teste para /registro.
  - E-mail para testes expirados sem assinatura (28 contas): rascunho em marketing/email-teste-expirado-nov26.html, aguarda aprovação. Sem desconto; mensal R$ 39,90 ou anual R$ 400.
  - 09/11 23h57: e-mail aprovado e enfileirado na fila Brevo (lista 11, 28 contas); envio pelo cron de 10/11 às 19h BRT.

### 15/11/2026 (revisão, pedida pelo usuário, ~noite)
Saldo R$ 601,66. Gasto 03→15/11: R$ 380,83 (~R$ 29/dia; R$ 178,18 desde 09/11). Posts educativos R$ 175,53, 1.472 visitas ao perfil (R$ 0,12); na semana 09→15/11 R$ 107,31, dos quais R$ 93,22 na Hemorragia digestiva (892 visitas, R$ 0,10). Teste grátis encerrado em 14/11: R$ 111,52, 4 cadastros pela Meta (R$ 27,88, meta era R$ 15). Assinatura R$ 65,72, 218 LPV, 0 checkout/0 compra no pixel (~R$ 38 desde a reativação de 08/11); aparecia "Não está em veiculação" com um alerta vermelho em Ações. Reels pausada (R$ 28,06).
- Banco desde 03/11: 10 cadastros, 8 testes (só 1 com utm ig/paid/teste_nov26), 0 assinaram. Pedidos pagos: 3 mensais de R$ 39,90 — a venda Pix de 09/11 (já analisada) e 2 no cartão em 15/11, que são renovações (contas de 15/09 e 15/10; só 1 assinatura nova no período). Nenhuma venda vinda das campanhas de novembro.
- 15/11 ("Sim, pause" do usuário): campanha Assinatura — Público Quente (120246398642980490) DESATIVADA pelo Gerenciador (confirmado "Desativado"). Sobra do orçamento vai para a reserva da Black Friday (~R$ 300 livres após os posts educativos, que seguem até 04/12).
- Pendente: ler seguidores por post no Insights (regra: trocar acima de R$ 1/seguidor).
