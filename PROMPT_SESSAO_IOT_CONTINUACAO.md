# Prompt de Continuação — Revisão Temas IOT/VM

## Contexto do projeto

Estou desenvolvendo uma plataforma clínica (Next.js 16 + Tailwind + TypeScript) em `D:\Projeto Claude Rotina Clínica\plataforma\`. O sistema de prescrições (condutas) tem um pipeline de renderização em `plataforma/app/dashboard/prescricoes/PrescricaoContent.tsx` que converte texto raw em cards visuais.

Tenho um ebook em PDF sobre IOT/VM/Sedação: `plataforma/public/ebookiotsedaçãoevm/Ebook Sedação, IOT e VM - Rotina Clínica (1).pdf`

A referência clínica principal é: `D:\Downloads\manualrotina.md`

## O que já foi feito

**ID 192 — Materiais para Intubação: CONCLUÍDO e no ar**
- Conteúdo literal do ebook, organizado por seções
- 10+ imagens extraídas do PDF salvas em `plataforma/public/iot-vm/`
- Fórmula pediátrica TOT renderizada como imagem com fundo dark: `plataforma/public/iot-vm/formula_tot_pediatrico.png`
- Seções: Introdução, Laringoscópio, Lâminas (Macintosh/Miller/Choi/Bizzari), TOT (com fórmula + estudo JAMA), Fio Guia, Cuff, Bougie

## Próximos temas IOT (categoria "Temas PS/UPA")

IDs que precisam ser revisados/criados com o mesmo padrão:

| ID | Título | Páginas aprox. no ebook |
|----|--------|------------------------|
| 193 | Os 7 Ps da Intubação | Caps. 2-3 |
| 194 | Medicações para ISR | Cap. 5 |
| 195 | Sedação Pós-Intubação | Cap. 6 |
| 196 | VM — Fundamentos | Cap. 7 |
| 197 | VM — Obstrutivos e Restritivos | Cap. 8 |
| 198 | SDRA | Cap. 9 |

## Padrão obrigatório para cada tema

1. **Conteúdo literal ao ebook** — não resumir, copiar o texto organizado por seção
2. **Imagens** — extrair com PyMuPDF e incluir com `[IMAGE:/iot-vm/nome_arquivo.png]`
3. **Legendas de imagens** — como texto `→ Legenda conforme ebook`
4. **Fórmulas** — se tiver fração visual, gerar PNG com Pillow (fundo dark-slate `(30,41,59,230)`, texto branco, Georgia Italic)
5. **Blocos grandes de texto** — separar em parágrafos com linha em branco

## Pipeline do parser (PrescricaoContent.tsx)

| Block | Trigger |
|-------|---------|
| `section` | Linha que bate no regex isSection (Tratamento, Manejo, etc.) |
| `subtitle` | Termina em `:` e < 70 chars, OU ALL-CAPS ≤ 45 chars |
| `drug` | Tem dose (mg/mL/%) em linha curta (< 95 chars) |
| `instruction` | Começa com verbo de ação (Tomar, Diluir, Infundir...) |
| `connector` | Exatamente: `Ou`, `Alternativa:`, `Associado a:`, `+` |
| `note` | Começa com `Atenção`, `Obs`, `Importante`, `Detalhes`, `Racional` |
| `text` | Tudo o mais; `→ texto` vira bullet com seta |
| `table` | Linhas com exatamente um `\|` no formato `Chave \| Valor` |
| `image` | `[IMAGE:/caminho/relativo/ao/public]` |

**Regras críticas do parser:**
- Linhas que começam com `→ ` nunca viram drug card
- Linhas que começam em minúsculo nunca viram drug ou section
- `curNote` absorve tudo até o próximo section/drug/subtitle/connector
- Linha em branco no raw content → `\x00` → quebra de parágrafo

## Como salvar o JSON (CRÍTICO — UTF-8 sem BOM)

```powershell
$path = "D:\Projeto Claude Rotina Clínica\plataforma\lib\prescricoes-content.json"
$enc = New-Object System.Text.UTF8Encoding $false

# Para ler o conteúdo de um arquivo .txt gerado pela IA:
$content = [System.IO.File]::ReadAllText("caminho\para\arquivo.txt", $enc)
# NÃO usar Get-Content -Raw (retorna PSCustomObject, quebra o JSON)

$obj = Get-Content $path -Raw -Encoding UTF8 | ConvertFrom-Json
$obj."193" = $content
[System.IO.File]::WriteAllText($path, ($obj | ConvertTo-Json -Depth 5), $enc)
```

## Extração de imagens do PDF (PyMuPDF)

```python
import fitz

pdf_path = r'D:\Projeto Claude Rotina Clínica\plataforma\public\ebookiotsedaçãoevm\Ebook Sedação, IOT e VM - Rotina Clínica (1).pdf'
doc = fitz.open(pdf_path)

# Extrair imagens embutidas de uma página:
page = doc[N]  # N = índice (0-based)
for i, img_ref in enumerate(page.get_images()):
    xref = img_ref[0]
    pix = fitz.Pixmap(doc, xref)
    if pix.width > 100:  # filtrar ícones pequenos
        pix.save(f'D:\\Projeto Claude Rotina Clínica\\plataforma\\public\\iot-vm\\tema_pNNN_{i}.png')

# Renderizar região específica da página (para fórmulas vetoriais):
clip = fitz.Rect(x0, y0, x1, y1)  # coordenadas em pontos (página = 384x600 pts)
mat = fitz.Matrix(2, 2)  # 2x = mais resolução
pix = page.get_pixmap(matrix=mat, clip=clip)
pix.save('saida.png')
```

## Gerar imagem de fórmula com Pillow

```python
from PIL import Image, ImageDraw, ImageFont
import os

out = r'D:\Projeto Claude Rotina Clínica\plataforma\public\iot-vm\formula_nome.png'
W, H = 540, 110
img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
bg = (30, 41, 59, 230)  # dark-slate semitransparente

def round_rect(draw, xy, r, fill):
    x1, y1, x2, y2 = xy
    draw.rectangle([x1+r, y1, x2-r, y2], fill=fill)
    draw.rectangle([x1, y1+r, x2, y2-r], fill=fill)
    draw.ellipse([x1, y1, x1+2*r, y1+2*r], fill=fill)
    draw.ellipse([x2-2*r, y1, x2, y1+2*r], fill=fill)
    draw.ellipse([x1, y2-2*r, x1+2*r, y2], fill=fill)
    draw.ellipse([x2-2*r, y2-2*r, x2, y2], fill=fill)

round_rect(draw, (0, 0, W-1, H-1), 12, bg)

fi = r'C:\Windows\Fonts\georgiai.ttf'
fr = r'C:\Windows\Fonts\georgia.ttf'
f_left = ImageFont.truetype(fi, 24)
f_num  = ImageFont.truetype(fi, 21)
f_den  = ImageFont.truetype(fr, 24)
white = (255, 255, 255, 255)
bar_y = H // 2 + 1

left = "Texto do lado esquerdo ="
left_w = draw.textlength(left, font=f_left)
draw.text((16, bar_y - 13), left, font=f_left, fill=white)

frac_x = int(left_w) + 22
num_text = "Numerador"
den_text = "Denominador"
num_w = draw.textlength(num_text, font=f_num)
den_w = draw.textlength(den_text, font=f_den)
line_w = max(num_w, den_w) + 6

draw.text((frac_x + (line_w - num_w) / 2, bar_y - 25), num_text, font=f_num, fill=white)
draw.rectangle([frac_x, bar_y, frac_x + line_w, bar_y + 2], fill=white)
draw.text((frac_x + (line_w - den_w) / 2, bar_y + 6), den_text, font=f_den, fill=white)

total_w = frac_x + int(line_w) + 16
img = img.crop((0, 0, total_w, H))
img.save(out)
```

## Dev server

Já em execução em `localhost:3000`. Após cada edição:
1. Salvar o JSON com o comando PowerShell acima
2. Recarregar `localhost:3000/dashboard/prescricoes`
3. Buscar o tema e tirar screenshot para confirmar antes de avançar

## Workflow por tema

1. Ler as páginas correspondentes do ebook (PDF)
2. Extrair imagens relevantes → salvar em `plataforma/public/iot-vm/`
3. Escrever conteúdo literal do ebook em seções usando os tipos de bloco do parser
4. Salvar no JSON com o padrão UTF-8 sem BOM
5. Verificar no browser com screenshot
6. Avançar para o próximo tema

**Começa pelo ID 193 — Os 7 Ps da Intubação.**
