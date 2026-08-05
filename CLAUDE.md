# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `plataforma/`:

```bash
npm run dev      # dev server at localhost:3000 (Next.js 16 + Turbopack)
npm run build    # prisma generate && next build
npm run lint     # eslint
```

The dev server is also launchable via the Browser pane using the `plataforma-dev` configuration in `plataforma/.claude/launch.json`.

> **Next.js 16 warning:** This version has breaking changes versus training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any Next.js-specific code.

## Architecture

### Stack
- **Next.js 16** (App Router, React 19) + **TypeScript** + **Tailwind CSS v4**
- **Auth:** NextAuth v5 (beta) with Prisma adapter
- **DB:** PostgreSQL via `@prisma/adapter-pg` (Prisma 7, driver adapter required — no default client)
- **Payments:** Stripe + Mercado Pago (dual webhooks at `app/api/webhooks/`)
- **Video:** Mux (player + node SDK)
- **Storage:** Cloudflare R2 via `@aws-sdk/client-s3`
- **Email:** Resend

### Prescrições system (main active work area)

The prescriptions feature is a two-file system at `app/dashboard/prescricoes/`:

**Data layer:**
- `lib/prescricoes-meta.ts` — static array of 114 `PrescricaoMeta` objects (id, titulo, categoria, tags), plus `emergenciaIds` Set. Imported at build time, not fetched.
- `lib/prescricoes-content.json` — object with keys `"1"`–`"114"`, each a multiline string of raw clinical text. Served by `app/api/prescricoes/[id]/route.ts` (reads file at runtime with `readFileSync`).

**Rendering pipeline:**
`PrescricaoContent.tsx` (`app/dashboard/prescricoes/PrescricaoContent.tsx`) contains the entire pipeline — classifiers, parser, and renderer — in a single file:

1. **Classifiers** — regex functions (`isSection`, `isDrug`, `isInstruction`, `isConnector`, `isNoteHeader`, `isSubtitle`, `isTableRow`, `isImageMarker`) that classify each line
2. **`parse(content)`** — re-joins wrapped lines into logical lines, then classifies them into typed `Block` objects using a cursor pattern (`curDrug`, `curNote`, `curTable`)
3. **`PrescricaoContent`** — React component that renders the `Block[]` via a switch/case

#### Block types and how to create them in raw content

| Block | How to trigger | Rendered as |
|---|---|---|
| `section` | Line matches `isSection` regex (Tratamento, Manejo, Sintomáticos, etc.) | Dark blue bold uppercase header |
| `subtitle` | Ends with `:` and < 70 chars, OR all-caps ≤ 45 chars | Gray uppercase label |
| `drug` | Has `RX_DOSE` (mg/mcg/mL/%) or `RX_FORM` (ampola, comprimido…) in a short line | Blue box with name + dose |
| `instruction` | Starts with action verb (Tomar, Diluir, Infundir, Aplicar…) | Appended to current drug card or note |
| `connector` | Exactly `Ou`, `Alternativa:`, `Associado a:`, `+` | Horizontal divider |
| `note` | Starts with `Atenção`, `Obs`, `Importante`, `Detalhes`, `Racional` | Teal left-border box labeled "Detalhe" |
| `text` | Everything else; `→ texto` renders as arrow bullet | Plain text or bullet |
| `table` | Lines with exactly one `\|`: `Chave \| Valor` | Two-column table, first row = header |
| `image` | `[IMAGE:path]` | `<img>` tag |

#### Critical parser rules

- `isDrug` is blocked if the line: is > 95 chars, starts with `(`, starts with `→ `, starts lowercase, matches `NOT_DRUG` list (`SF `, `SG `, `RL `, `Dose `, `Volume `, etc.), or matches `RX_LAB_THRESHOLD` (`< 3,5 mEq/L` patterns).
- `curNote` absorbs all subsequent non-structural lines until reset by a connector, section, drug, subtitle, or new note. Subtitles always break out of `curNote` (checked before the note-absorption branch).
- `curTable` accumulates consecutive `Chave | Valor` lines into one table block; any other structural line closes it.
- `→ ` prefix on a line protects it from being classified as a drug card, even if it contains doses.
- Lines starting lowercase are never drugs or sections.

## Editing prescriptions content

### Reading a topic
```powershell
$path = "D:\Projeto Claude Rotina Clínica\plataforma\lib\prescricoes-content.json"
$obj = Get-Content $path -Raw -Encoding UTF8 | ConvertFrom-Json
$obj."21"
```

### Saving (always UTF-8 without BOM)
```powershell
$enc = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, ($obj | ConvertTo-Json -Depth 5), $enc)
```

Using `Set-Content` or `Out-File` without `-Encoding` defaults to UTF-8 with BOM, which breaks the JSON parser.

## Active constraint

**Nothing goes to Vercel or git remote** until the full visual review of all 114 topics is complete. All work is local (localhost:3000) only.

## Review progress

Topics reviewed and approved: **1–26**. Next: **Topic 27**.

IDs 115–147 created: individual antibiotic topics (categoria "Temas PS/UPA"), one per drug, routes separated by section headers within each topic.

Content source: `D:\Downloads\manualrotina.md` — use this as the authoritative reference for all clinical content (doses, forms, instructions).

After each edit: reload the browser at `localhost:3000/dashboard/prescricoes`, search for the topic, and take a screenshot to confirm before moving to the next.
