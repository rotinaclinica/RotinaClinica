# Contexto — Modelos de Evolução (continuar aqui)

## Objetivo
Revisar e aprovar os 10 modelos de evolução clínica em **localhost:3000** (nada vai ao Vercel ainda).

## Protótipo aprovado
**Urticária (ID 1)** é o modelo de referência visual. Todos os outros devem seguir o mesmo padrão. Detalhes completos em `memory/feedback_evolucoes_prototipo.md`.

## Progresso
| ID | Tema | Status |
|----|------|--------|
| 1 | Urticária | ✅ Aprovado |
| 10 | Anafilaxia | ✅ Aprovado |
| 2 | Cefaleia | ⏳ Próximo |
| 3 | Crises Hipertensivas | — |
| 4 | Diarreia Aguda | — |
| 5 | Dor Torácica | — |
| 6 | Infecção do Trato Urinário (ITU) | — |
| 7 | Arboviroses | — |
| 8 | Crise de Asma | — |
| 9 | Infecções Respiratórias | — |

## Arquitetura dos modelos de evolução
- **Meta:** `plataforma/lib/evolucoes-meta.ts` — array de 10 objetos `{id, titulo, tags}`
- **Conteúdo:** `plataforma/lib/evolucoes-content.json` — chaves `"1"`–`"10"` (raw text do PDF)
- **API:** `plataforma/app/api/evolucoes/[id]/route.ts`
- **Renderer:** `plataforma/app/dashboard/evolucoes/EvolucaoContent.tsx`
- **Página/busca:** `plataforma/app/dashboard/evolucoes/page.tsx`

## Fluxo de revisão por tema
1. Abrir o tema em localhost:3000/dashboard/evolucoes
2. Tirar screenshot e verificar se segue o protótipo
3. Ajustar conteúdo no JSON se necessário (`evolucoes-content.json`, salvar UTF-8 sem BOM)
4. Confirmar com screenshot antes de ir ao próximo

## Constraint ativa
**Nada vai ao Vercel ou git remote** até revisão completa de todos os modelos.

## Outros trabalhos em aberto
- Revisão prescrições: Temas 27+ ainda pendentes (pausada para focar em evoluções)
