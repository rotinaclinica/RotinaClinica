# Contexto — Adição de Aulas ao Destravando o Plantão

## O que é este projeto

Plataforma Next.js 16 de cursos médicos. O curso "Destravando o Plantão" tem 7 aulas sobre queixas prevalentes no plantão adulto. O player está implementado e funcionando. Cada sessão neste contexto serve para adicionar **uma nova aula** (YouTube ID + materiais PDF opcionais).

## Arquivos que você vai editar

### `plataforma/lib/cursos-videos.ts` — IDs dos vídeos (server-only)
```typescript
// Server-only: NUNCA importar em "use client"
export const YOUTUBE_IDS: Record<number, string> = {
  1: "APZqdnpNIjA",
  2: "4cyaVmEyIw8",
  // adicionar aqui: 3: "ID_DO_YOUTUBE", ...
};
```

### `plataforma/lib/cursos-data.ts` — Metadados públicos das aulas
Interface de cada aula:
```typescript
export interface Material {
  id: string;       // slug único ex: "guia-prescricao"
  titulo: string;   // nome exibido ex: "Modelo de Prescrição - ITU"
  arquivo: string;  // nome do arquivo PDF dentro da pasta (com espaços é ok)
  tamanho?: string; // ex: "1,3 MB"
}

export interface Aula {
  id: number;
  titulo: string;
  duracao: string;     // ex: "27:46"
  descricao?: string;  // parágrafos separados por \n\n
  pasta?: string;      // nome da pasta dentro de public/ que contém os materiais
  materiais?: Material[];
}
```

O array `MODULOS` já contém as 7 aulas. Para cada nova aula, adicionar:
- `descricao` (texto fornecido pelo usuário, parágrafos separados por `\n\n`)
- `pasta` (nome da pasta criada em `public/`)
- `materiais` (array com os PDFs dentro da pasta)

### `plataforma/public/{nomepasta}/` — PDFs dos materiais
O usuário cria esta pasta e coloca os arquivos. Não criar nem mover arquivos — só referenciar.

## Rotas de API (já implementadas, não mudar)

- `GET /api/cursos/[id]/embed` — auth + assinatura → `{ videoId }`
- `GET /api/cursos/[id]/thumb` — proxy thumbnail YouTube
- `GET /api/cursos/[id]/material/[materialId]` — PDF com marca d'água (email + data)

## Fluxo para adicionar uma nova aula

1. Usuário informa: número da aula, link do YouTube, descrição, se tem materiais
2. Extrair o YouTube ID do link (ex: `https://youtu.be/XXXXXID` → `"XXXXXID"`)
3. Adicionar o ID em `cursos-videos.ts` na chave correta
4. Atualizar a aula correspondente em `cursos-data.ts` com `descricao`, `pasta`, `materiais`
5. Se tiver materiais: usuário informa o nome da pasta e os arquivos. Adicionar `pasta` + `materiais` na aula
6. Verificar no browser: navegar para `localhost:3000/dashboard/cursos/{id}`, checar player e aba Materiais
7. Screenshot de confirmação

## Estado atual (2026-08-10)

| Aula | Título | YouTube ID | Materiais |
|---|---|---|---|
| 1 | Bem-vindo (a) ao Destravando o Plantão! | APZqdnpNIjA | Não |
| 2 | Infecções do trato urinário | 4cyaVmEyIw8 | 3 PDFs em `public/aulaitu/` |
| 3 | Radiografia de tórax no plantão | wStBoIohXUQ | 1 PDF em `public/aularaiox/` |
| 4 | Urticária e Anafilaxia | lnbvzf4FZPg | 3 PDFs em `public/aulaalergias/` |
| 5 | Diarreia Aguda | yGxa926n4k8 | 3 PDFs em `public/auladiarreia/` |
| 6 | Infecções respiratórias | sQRQIPOWT1w | 3 PDFs em `public/aularesp/` |
| 7 | ECG no plantão | 2rKLRzr_F9Q | — |

## Regras críticas

- **YouTube ID**: sempre em `cursos-videos.ts` apenas. Nunca em `cursos-data.ts` (arquivo acessível pelo cliente).
- **Componentes helpers** em `PlayerClient.tsx`: definir ANTES do `export default`. O Turbopack não hoista function declarations durante HMR.
- **PDF download**: `new NextResponse(Buffer.from(watermarkedBytes), {...})` — nunca Uint8Array direto.
- **Thumbnails**: usam `/api/cursos/${id}/thumb` — não URL direta do YouTube.
- **Marca d'água**: email do usuário + data, rodapé centralizado, branco, opacidade 0.85.

## Como iniciar o servidor

O launch.json em `plataforma/.claude/launch.json` tem a configuração `plataforma-dev` na porta 3000.

## Não fazer

- Não mudar a estrutura do player (`PlayerClient.tsx`) — está aprovada e funcionando
- Não criar novos arquivos de API — as rotas já existem
- Não mover ou renomear PDFs — o usuário organiza as pastas
