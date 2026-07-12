# Notas sobre .mcp.json

<!--
  JSON não aceita comentários de verdade, então o .mcp.json usa uma chave
  "_comentario" só pra fins didáticos.
-->

## As duas formas de buscar dados reais neste projeto

O app tem duas fontes de dados externas, e cada uma foi implementada do
jeito que fazia mais sentido pra ela — não força MCP em tudo:

- **Repositório GitHub público** → chamada HTTP direta à API REST do
  GitHub (`server/src/services/githubService.js`). MCP não foi usado
  aqui de propósito: o protocolo MCP existe pra conectar um *agente* a
  ferramentas, e nosso server é um servidor comum, não um agente —
  implementar um cliente MCP só pra chamar uma API que um `fetch()`
  já resolve seria complexidade sem ganho real.

- **Pasta local no disco** → cliente MCP de verdade
  (`server/src/services/mcpFilesystemService.js`), conectando no
  servidor oficial `@modelcontextprotocol/server-filesystem` via stdio.
  Aqui faz sentido genuíno: é exatamente o caso de uso raiz do MCP
  (dar acesso controlado e padronizado a um recurso do sistema).

## Por que só filesystem está no .mcp.json

Só entra aqui o que precisa ser declarado pra um agente (como o Claude
Code) usar quando estiver trabalhando NESTE repositório. A conexão com
o GitHub não é uma ferramenta MCP — é só uma função HTTP normal dentro
do código do app.
