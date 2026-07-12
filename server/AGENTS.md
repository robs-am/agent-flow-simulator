# AGENTS.md — Regras do server

<!-- Só lido dentro de server/. Soma com o AGENTS.md da raiz. -->

## Stack

Node.js + Express. Sem banco de dados — os cenários de exemplo vivem em
memória em `src/data/scenarios.js`; a análise real não persiste nada.

## Regras específicas

- `simulationEngine.js` (modo demo) é puro — mesma entrada, mesma saída,
  sem efeito colateral
- `aiClassifierService.js` é a exceção deliberada: chama a API do Claude
  (`@anthropic-ai/sdk`) pra classificar texto livre num fluxo, então TEM
  efeito colateral (rede). Fica isolado em rota própria (`/simulate/ai`) pra
  não contaminar o motor puro. Precisa de `ANTHROPIC_API_KEY` no `.env` —
  sem ela, a rota devolve 503 e o modo demo continua funcionando normal
- `githubService.js` usa chamada HTTP direta (não MCP) — motivo
  documentado em `.claude/mcp-notes.md`
- `mcpFilesystemService.js` é o único lugar do server que fala o
  protocolo MCP de verdade — não duplicar essa lógica em outro service
- `browseService.js` é navegação de diretório simples (fs do Node) —
  não usa MCP nem precisa, é só listar subpastas pro navegador de
  pastas do client. Não confundir com a análise de arquitetura
- Todo cenário/análise precisa devolver `steps` com `node`, `title` e
  `explanation` — o client depende desse formato exato, seja a origem
  demo, GitHub ou MCP local

