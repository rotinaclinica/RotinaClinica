# Prompt — Sessão de prescrições: Ebook IOT, Sedação e VM

## Contexto

Estamos criando novos temas de prescrição para a plataforma Rotina Clínica a partir do ebook:

```
D:\Projeto Claude Rotina Clínica\plataforma\public\ebookiotsedaçãoevm\Ebook Sedação, IOT e VM - Rotina Clínica (1).pdf
```

O ebook já foi convertido para Markdown em:

```
D:\Projeto Claude Rotina Clínica\plataforma\public\ebookiotsedaçãoevm\ebook.md
```

## Sumário do ebook (capítulos a criar como temas)

1. Insuficiência Respiratória
2. Oxigenoterapia
3. Ventilação Não Invasiva (VNI)
4. Materiais para Intubação
5. Os 7 "Ps" da Intubação
6. Medicações (ISR — Fentanil, Etomidato, Midazolam, Quetamina, Propofol, Succinilcolina, Rocurônio; Pós-intubação — Dexmedetomidina, BIC; BNM em infusão contínua)
7. Ventilação Mecânica: Fundamentos e Modos Ventilatórios
8. Ventilação Mecânica em Distúrbios Obstrutivos e Restritivos

**Próximo ID livre: 189.** Os novos temas seguem a sequência 189, 190, 191…

## Formato dos temas

O formato é **misto**: cada tema pode conter teoria inline (textos explicativos, notas clínicas) e cards de droga. Seguir o padrão do parser de `PrescricaoContent.tsx`.

## Arquivos a editar

- `plataforma/lib/prescricoes-meta.ts` — adicionar entrada `{id, titulo, categoria, tags}`
- `plataforma/lib/prescricoes-content.json` — adicionar conteúdo raw com a chave string do ID

## Sistema de prescrições — regras do parser (PrescricaoContent.tsx)

### Block types e como escrever no raw

| Block | Como disparar | Renderizado como |
|---|---|---|
| `section` | Linha que bate em `isSection` (Tratamento, Manejo, Sintomáticos, etc.) | Cabeçalho azul escuro maiúsculo em negrito |
| `subtitle` | Termina com `:` e < 70 chars, OU all-caps ≤ 45 chars | Label cinza maiúsculo |
| `drug` | Tem dose (mg/mcg/mL/%) em linha curta | Box azul com nome + dose |
| `instruction` | Começa com verbo de ação (Tomar, Diluir, Infundir, Aplicar, Administrar…) | Appended ao card atual ou nota |
| `connector` | Exatamente `Ou`, `Alternativa:`, `Associado a:`, `+` | Divisória horizontal |
| `note` | Começa com `Atenção`, `Obs`, `Importante`, `Detalhes`, `Racional` | Box teal com borda esquerda |
| `text` | Tudo o mais; `→ texto` vira bullet com seta | Texto simples ou bullet |
| `table` | Linhas com exatamente um `\|`: `Chave \| Valor` | Tabela 2 colunas |
| `image` | `[IMAGE:path\|legenda]` | `<img>` com legenda |

### Regras críticas do `isDrug`

`isDrug` é **bloqueado** se a linha:
- Tem > 95 caracteres
- Começa com `(`
- Começa com `→ `
- Começa com letra minúscula
- Está na lista `NOT_DRUG`: `SF `, `SG `, `RL `, `Dose `, `Volume `, `Concentração `…
- Bate em `RX_LAB_THRESHOLD` (padrões como `< 3,5 mEq/L`)

Use `→ ` no início para proteger uma linha de ser classificada como drug mesmo com dose.

### Exemplo de formato misto (teoria + cards)

```
Analgesia pré-intubação:
Fentanil 50 mcg/mL
Infundir 1 a 3 mcg/kg EV lentamente (3 min antes da indução).
Atenção: Droga negativa cardiovascular. Reduzir dose em instabilidade hemodinâmica.
Sedação:
Etomidato 2 mg/mL — ampola 10 mL
Bolus 0,3 mg/kg EV sem diluição.
Atenção: Droga neutra. Opção preferencial em instabilidade hemodinâmica. Usar com cautela em sepse.
Ou
Quetamina 10 mg/mL
Bolus 1 a 2 mg/kg EV sem diluição.
Atenção: Droga positiva — broncodilatadora. Indicada em broncoespasmo e choque séptico. Evitar em HIC.
```

## Workflow por tema

1. Ler a seção correspondente em `ebook.md`
2. Escrever o conteúdo raw no padrão do parser
3. Verificar o próximo ID livre (contar em `prescricoes-meta.ts`)
4. Adicionar entrada em `prescricoes-meta.ts`:
```ts
{ id: "189", titulo: "Título do Tema", categoria: "IOT, Sedação e VM", tags: ["tag1", "tag2"] },
```
5. Adicionar conteúdo em `prescricoes-content.json`:
```powershell
$path = "D:\Projeto Claude Rotina Clínica\plataforma\lib\prescricoes-content.json"
$obj = Get-Content $path -Raw -Encoding UTF8 | ConvertFrom-Json
$obj.PSObject.Properties.Add([System.Management.Automation.PSNoteProperty]::new("189", $content))
$enc = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, ($obj | ConvertTo-Json -Depth 5), $enc)
```
6. Verificar no browser: `localhost:3000/dashboard/prescricoes`, buscar pelo nome, screenshot para confirmar

## Referência clínica

Usar `ebook.md` como fonte primária de doses, classes e indicações.

## Categoria

Todos os novos temas usam categoria: **`"IOT, Sedação e VM"`**

## Restrição ativa

Nada vai para o Vercel ou git remote até revisão visual completa de todos os temas.
