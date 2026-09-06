# Prompt — Novos temas de prescrição a partir de ebook PDF

## Contexto

Estamos na seção de **Prescrições** da plataforma Rotina Clínica. O sistema de prescrições usa dois arquivos:
- `plataforma/lib/prescricoes-meta.ts` — array de `PrescricaoMeta` com `{id, titulo, categoria, tags}` e o Set `emergenciaIds`
- `plataforma/lib/prescricoes-content.json` — objeto com chaves `"1"`–`"N"`, cada uma uma string multiline de texto clínico raw

O renderer está em `plataforma/app/dashboard/prescricoes/PrescricaoContent.tsx` e segue as regras documentadas em `CLAUDE.md`.

A referência clínica anterior era `D:\Downloads\manualrotina.md`. Agora há um novo ebook em:

```
D:\Projeto Claude Rotina Clínica\plataforma\public\ebookiotsedaçãoevm\
```

## Passo 1 — Converter o PDF para Markdown

Localizar o arquivo PDF na pasta acima e converter com markitdown (já instalado):

```powershell
$pdf = Get-ChildItem "D:\Projeto Claude Rotina Clínica\plataforma\public\ebookiotsedaçãoevm" -Filter "*.pdf" | Select-Object -First 1
markitdown $pdf.FullName -o "D:\Projeto Claude Rotina Clínica\plataforma\public\ebookiotsedaçãoevm\ebook.md"
```

Verificar o tamanho e estrutura do MD gerado antes de prosseguir.

## Passo 2 — Identificar os temas disponíveis no ebook

Ler o índice/sumário do MD para mapear quais temas clínicos estão disponíveis. Listar para o usuário e aguardar confirmação de quais criar.

## Passo 3 — Criar os novos temas de prescrição

Para cada tema confirmado pelo usuário:

1. **Ler a seção correspondente no MD** para extrair doses, fármacos e condutas
2. **Verificar o próximo ID livre** em `prescricoes-meta.ts` (contar o maior ID atual + 1)
3. **Escrever o conteúdo raw** seguindo as regras do parser (ver CLAUDE.md):
   - `drug` — linha curta com nome + dose (mg/mcg/mL/%)
   - `instruction` — começa com verbo de ação (Tomar, Diluir, Infundir, Aplicar…)
   - `section` — cabeçalho de seção (Tratamento, Manejo, Sintomáticos…)
   - `connector` — `Ou` / `Alternativa:` / `Associado a:` / `+`
   - `note` — começa com `Atenção`, `Obs`, `Importante`, `Detalhes`, `Racional`
   - `→ texto` — bullet de orientação
4. **Adicionar entrada em `prescricoes-meta.ts`** com id, titulo, categoria e tags
5. **Adicionar conteúdo em `prescricoes-content.json`** com chave string do ID

### Salvar sempre em UTF-8 sem BOM

```powershell
$path = "D:\Projeto Claude Rotina Clínica\plataforma\lib\prescricoes-content.json"
$enc = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, ($obj | ConvertTo-Json -Depth 5), $enc)
```

### Para adicionar novo ID numérico no JSON

```powershell
$obj.PSObject.Properties.Add([System.Management.Automation.PSNoteProperty]::new("188", $content))
```

## Passo 4 — Verificar no browser

Após cada tema salvo: abrir `localhost:3000/dashboard/prescricoes`, buscar pelo nome e tirar screenshot para confirmar antes de avançar.

O dev server é iniciado via configuração `plataforma-dev` no Browser pane (launch.json).

## Regras críticas

- `isDrug` é bloqueado se a linha: tem > 95 chars, começa com `(`, começa com `→ `, começa minúsculo, está na lista `NOT_DRUG` (`SF `, `SG `, `RL `, `Dose `, `Volume `…)
- Não duplicar o título do tema na primeira linha do conteúdo
- Cada via de administração (oral, EV, IM) deve ser separada por `section` ou `connector`
- Nada vai para o Vercel ou git remote até revisão visual completa de todos os temas

## Categoria sugerida para este ebook

`"Temas PS/UPA"` ou criar nova categoria específica para IOT/Sedação/VM se o volume justificar — confirmar com o usuário.
