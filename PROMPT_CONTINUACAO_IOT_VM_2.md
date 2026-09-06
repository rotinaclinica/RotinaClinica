# Prompt de Continuação — Revisão Visual Temas IOT/VM

## Contexto do projeto

Estou desenvolvendo uma plataforma clínica em `D:\Projeto Claude Rotina Clínica\plataforma\` (Next.js 16 + Tailwind + TypeScript). O sistema de condutas tem um pipeline de renderização em `plataforma/app/dashboard/prescricoes/PrescricaoContent.tsx` que converte texto raw em cards visuais.

O ebook de referência está em:
`plataforma/public/ebookiotsedaçãoevm/Ebook Sedação, IOT e VM - Rotina Clínica (1).pdf`

A referência clínica principal é: `D:\Downloads\manualrotina.md`

---

## Estado atual — O que já foi feito

Os IDs a seguir já têm **conteúdo gravado no JSON** (`lib/prescricoes-content.json`), mas ainda **não foram revisados visualmente no browser**:

| ID | Título | Status |
|----|--------|--------|
| 193 | Os 7 Ps da Intubação | ✅ Revisado |
| 194 | Medicações para ISR | ✅ Revisado |
| 195 | Sedação Pós-Intubação e BNM em BIC | ⚠️ Conteúdo OK — revisar no browser |
| 196 | VM — Fundamentos e Modos Ventilatórios | ⚠️ Conteúdo OK — revisar no browser |
| 197 | VM em Distúrbios Obstrutivos e Restritivos | ⚠️ Conteúdo OK — revisar no browser |
| 198 | SDRA | ⚠️ Conteúdo OK — revisar no browser |

**Paramos na revisão do ID 196 (VM Fundamentos).**
Começar revisando o ID 195 e seguir em ordem.

---

## Padrão obrigatório de qualidade

1. **Conteúdo literal ao ebook** — não resumir, copiar texto organizado por seção
2. **Imagens** — incluir com `[IMAGE:/iot-vm/nome_arquivo.png]` (arquivos em `plataforma/public/iot-vm/`)
3. **Legendas** — `→ Legenda conforme o ebook` imediatamente após o `[IMAGE:...]`
4. **Tabelas** — formato `Chave | Valor` (uma linha por par)
5. **Subtítulos de seção** — em MAIÚSCULAS seguidas de `:` (ex: `MODOS VENTILATÓRIOS:`)
6. **Parágrafos** — separados por linha em branco no raw text

---

## Pipeline do parser (PrescricaoContent.tsx)

| Block | Trigger |
|-------|---------|
| `section` | Regex isSection: Tratamento, Manejo, Sintomáticos, Emergência, etc. |
| `subtitle` | Termina em `:` e < 70 chars, OU ALL-CAPS ≤ 45 chars |
| `drug` | Tem dose (mg/mL/%) em linha curta (< 95 chars) |
| `instruction` | Começa com verbo de ação (Tomar, Diluir, Infundir, Aplicar...) |
| `connector` | Exatamente: `Ou`, `Alternativa:`, `Associado a:`, `+` |
| `note` | Começa com `Atenção`, `Obs`, `Importante`, `Detalhes`, `Racional` |
| `text` | Tudo o mais; `→ texto` vira bullet com seta |
| `table` | Linhas com exatamente um `\|` no formato `Chave \| Valor` |
| `image` | `[IMAGE:/iot-vm/nome.png]` |

**Regras críticas:**
- Linhas com `→ ` nunca viram drug card
- Linhas que começam em minúsculo nunca viram drug ou section
- `curNote` absorve tudo até próximo section/drug/subtitle/connector
- `curTable` acumula linhas `Chave | Valor` consecutivas

---

## Como ler o conteúdo atual de um ID

```powershell
$path = "D:\Projeto Claude Rotina Clínica\plataforma\lib\prescricoes-content.json"
$obj = Get-Content $path -Raw -Encoding UTF8 | ConvertFrom-Json
$obj."195"
```

## Como salvar (UTF-8 sem BOM — OBRIGATÓRIO)

```javascript
// Criar arquivo update.mjs e rodar com: node update.mjs
import fs from 'fs';
const path = 'D:\\Projeto Claude Rotina Clínica\\plataforma\\lib\\prescricoes-content.json';
const obj = JSON.parse(fs.readFileSync(path, 'utf8'));
obj["196"] = fs.readFileSync('novo_conteudo.txt', 'utf8');
fs.writeFileSync(path, JSON.stringify(obj), 'utf8');
```

**Nunca usar `ConvertTo-Json` do PowerShell 5.1 para salvar — quebra strings longas.**

---

## Imagens disponíveis em `/iot-vm/`

Os arquivos seguem o padrão `tema_pNNN_N.png` onde `tema` é abreviação do tema, `NNN` é a página do ebook e `N` é o índice da imagem na página.

Para verificar imagens existentes:
```powershell
Get-ChildItem "D:\Projeto Claude Rotina Clínica\plataforma\public\iot-vm\" | Select-Object Name
```

## Extração de imagens do PDF (se necessário)

```python
import fitz
pdf_path = r'D:\Projeto Claude Rotina Clínica\plataforma\public\ebookiotsedaçãoevm\Ebook Sedação, IOT e VM - Rotina Clínica (1).pdf'
doc = fitz.open(pdf_path)
page = doc[N]  # N = índice 0-based
for i, img_ref in enumerate(page.get_images()):
    xref = img_ref[0]
    pix = fitz.Pixmap(doc, xref)
    if pix.width > 100:
        pix.save(f'D:\\Projeto Claude Rotina Clínica\\plataforma\\public\\iot-vm\\tema_pNNN_{i}.png')
```

---

## Dev server

Iniciar com a configuração `plataforma-dev` no Browser pane (porta 3000).

**Workflow por tema:**
1. Ler o conteúdo raw atual do ID com PowerShell
2. Abrir `localhost:3000/dashboard/prescricoes` no browser, buscar o tema
3. Tirar screenshot para ver como está renderizando
4. Corrigir problemas de formatação no conteúdo raw se necessário
5. Salvar via Node.js (update.mjs)
6. Screenshot final para confirmar
7. Avançar para o próximo ID

---

## Começar pelo ID 195 — Sedação Pós-Intubação e BNM em BIC

Ler o raw, abrir no browser, verificar visualmente, corrigir se necessário. Depois 196, 197, 198 em sequência.
