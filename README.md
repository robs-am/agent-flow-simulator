# Agent Flow Simulator

Um app que ensina a arquitetura de contexto (AGENTS.md, SKILLS, MCP,
SUBAGENTS) **mostrando visualmente** o caminho que um agente percorre pra
decidir o que consultar, dado um pedido do usuário.

Você digita (ou escolhe) um pedido, tipo "cria um componente de botão",
e vê o diagrama acender, em sequência, os nós que um agente real
consultaria pra atender aquele pedido — com a explicação do porquê em
cada passo.

Além dos cenários de exemplo, o app tem dois modos de análise **real**:

- **GitHub público** — aponta pra qualquer repo público e o server
  busca o AGENTS.md, skills e subagents de verdade via API REST do GitHub
- **Pasta local (MCP)** — aponta pra uma pasta na máquina e o server lê
  os arquivos via um cliente MCP de verdade, conectando no servidor
  oficial `@modelcontextprotocol/server-filesystem`

Repare que cada modo usa a ferramenta certa pro problema — API direta
pro GitHub (não é um agente falando com outro agente), MCP de verdade
pro disco local (esse sim é o caso de uso raiz do protocolo). O porquê
dessa escolha está documentado em `.claude/mcp-notes.md`.

**Bônus:** o próprio projeto é estruturado com a arquitetura real
(AGENTS.md, skills, subagents, mcp.json) — então além de simular o
conceito na tela, ele também *é* um exemplo vivo da coisa.

## Mapa do projeto

```
agent-flow-simulator/
├── AGENTS.md                    ← regras globais do projeto
├── .mcp.json                    ← conexão MCP real (filesystem)
├── .claude/
│   ├── agents/                  ← subagents reais deste projeto
│   ├── commands/                ← skills reais deste projeto
│   └── mcp-notes.md             ← por que GitHub usa API direta e o local usa MCP
├── client/
│   └── src/components/
│       ├── FlowDiagram.tsx      ← o diagrama SVG animado
│       ├── ScenarioPicker.tsx   ← abas: Exemplos / GitHub / Pasta local
│       └── StepLog.tsx          ← explicação textual de cada passo
└── server/
    └── src/
        ├── data/scenarios.js              ← cenários de exemplo (modo demo)
        ├── services/simulationEngine.js   ← decisão simulada (modo demo)
        ├── services/githubService.js      ← análise real via API do GitHub
        ├── services/mcpFilesystemService.js  ← análise real via MCP (filesystem)
        └── routes/
            ├── simulate.js       ← expõe o modo demo
            └── analyze.js        ← expõe os dois modos reais
```

## Como funciona a simulação

O server **não** usa IA de verdade pra decidir — é um motor baseado em
regras (`simulationEngine.js`) que casa palavras-chave do pedido com um
cenário pré-definido e devolve o caminho que um agente real percorreria.
Isso é proposital: o objetivo é ensinar o *padrão* de decisão, não
simular um LLM de verdade.

## Pré-requisitos

- **Node.js 20.6 ou mais recente** (o server usa `process.loadEnvFile()`,
  uma API nativa que só existe a partir dessa versão — sem precisar do
  pacote `dotenv`)
- npm (vem junto com o Node)

Pra conferir sua versão: `node --version`

## Rodando

**1. Server** (num terminal):

```
cd server
npm install
npm run dev
```

Sobe em `http://localhost:3001`. Você deve ver `Server rodando na
porta 3001` no terminal.

**2. Client** (em outro terminal, sem fechar o server):

```
cd client
npm install
npm run dev
```

Sobe em `http://localhost:5173` — abre esse endereço no navegador. O
Vite já tem um proxy configurado pra redirecionar `/api` pro server na
porta 3001, então não precisa mexer em CORS nem nada.

Não precisa de banco de dados. O modo "Exemplos" e o modo "Pasta local"
funcionam sem nenhuma configuração extra (o modo local só pede um
caminho que exista de verdade na máquina rodando o server).

## Configuração opcional: token do GitHub

O modo "GitHub público" funciona sem token, mas com limite de 60
requisições/hora por IP. Pra subir esse limite pra 5.000/hora, crie um
arquivo `.env` dentro de `server/` com:

```
GITHUB_TOKEN=seu_token_pessoal_aqui
```

(Gere um token em github.com → Settings → Developer settings →
Personal access tokens. Não precisa de nenhuma permissão especial, só
leitura de repositórios públicos.)

## Um detalhe sobre o modo "Pasta local"

O caminho que você digita precisa existir na máquina onde o **server**
está rodando — não no navegador. Se você rodar tudo localmente (como
nas instruções acima), isso é só o seu próprio computador. Na primeira
vez que usar esse modo, o `npx` vai baixar o pacote
`@modelcontextprotocol/server-filesystem` — pode demorar alguns
segundos a mais nessa primeira chamada.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `npm run dev` do server falha com erro sobre `loadEnvFile` | Node desatualizado — atualize pra 20.6+ |
| Client abre mas nada responde ao clicar | Server não está rodando, ou caiu — confira o terminal dele |
| Modo GitHub retorna erro 403/rate limit | Estourou o limite de 60 req/hora sem token — configure o `GITHUB_TOKEN` |
| Modo local não encontra nada | Caminho digitado não existe no computador onde o *server* roda, ou está com erro de digitação |
