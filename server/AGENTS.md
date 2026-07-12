# AGENTS.md — Regras do server

<!-- Só lido dentro de server/. Soma com o AGENTS.md da raiz. -->

## Stack

Node.js + Express. Sem banco de dados — os cenários de exemplo vivem em
memória em `src/data/scenarios.js`; a análise real não persiste nada.

## Regras específicas

- `simulationEngine.js` (modo demo) é puro — mesma entrada, mesma saída,
  sem efeito colateral
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

## Não coloque aqui

- Estilo de resposta HTTP → segue o padrão REST simples já usado em
  `routes/simulate.js`, não precisa reinventar por rota
