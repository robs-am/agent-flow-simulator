// Este é o único lugar do projeto que fala o protocolo MCP de verdade.
// Usa o SDK oficial pra subir @modelcontextprotocol/server-filesystem
// como um processo filho (via stdio) e conversar com ele via JSON-RPC —
// exatamente como o Claude Code faria.
//
// Diferente do githubService.js (chamada HTTP direta), aqui a "ferramenta
// externa" é o próprio disco do usuário, então faz sentido de verdade
// passar pelo protocolo — é o caso de uso raiz do MCP.

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "node:path";

async function withMcpClient(rootPath, fn) {
  const transport = new StdioClientTransport({
    command: "npx",
    // -y evita prompt de confirmação; o servidor só recebe permissão
    // pra essa pasta específica, nenhuma outra.
    args: ["-y", "@modelcontextprotocol/server-filesystem", rootPath],
  });

  const client = new Client({ name: "agent-flow-simulator", version: "0.1.0" });

  try {
    await client.connect(transport);
    return await fn(client);
  } finally {
    await client.close();
  }
}

async function tryReadFile(client, filePath) {
  try {
    const result = await client.callTool({
      name: "read_file",
      arguments: { path: filePath },
    });
    const text = result.content?.[0]?.text ?? "";
    return { found: true, text };
  } catch {
    return { found: false, text: "" };
  }
}

async function tryListDirectory(client, dirPath) {
  try {
    const result = await client.callTool({
      name: "list_directory",
      arguments: { path: dirPath },
    });
    const text = result.content?.[0]?.text ?? "";
    // O servidor devolve linhas tipo "[FILE] nome.md" — extrai só o nome
    const names = text
      .split("\n")
      .filter((l) => l.includes("[FILE]"))
      .map((l) => l.replace("[FILE]", "").trim());
    return { found: true, names };
  } catch {
    return { found: false, names: [] };
  }
}

export async function analyzeLocalProject(rootPath) {
  return withMcpClient(rootPath, async (client) => {
    const steps = [];

    const agentsMd = await tryReadFile(client, path.join(rootPath, "AGENTS.md"));
    if (agentsMd.found) {
      const preview = agentsMd.text.slice(0, 160).trim();
      steps.push({
        node: "agents-md",
        title: "AGENTS.md encontrado (via MCP)",
        explanation: `Lido em tempo real do disco via MCP filesystem. Início: "${preview}${preview.length === 160 ? "..." : ""}"`,
      });
    } else {
      steps.push({
        node: "agents-md",
        title: "Sem AGENTS.md",
        explanation: "Não foi encontrado um AGENTS.md na raiz dessa pasta.",
      });
    }

    const commands = await tryListDirectory(client, path.join(rootPath, ".claude", "commands"));
    if (commands.found && commands.names.length) {
      steps.push({
        node: "skills",
        title: `${commands.names.length} skill(s) encontrada(s) (via MCP)`,
        explanation: `Arquivos em .claude/commands: ${commands.names.join(", ")}.`,
      });
    }

    const mcpConfig = await tryReadFile(client, path.join(rootPath, ".mcp.json"));
    if (mcpConfig.found) {
      try {
        const parsed = JSON.parse(mcpConfig.text);
        const servers = Object.keys(parsed.mcpServers || {});
        steps.push({
          node: "mcp",
          title: servers.length ? `${servers.length} conexão(ões) MCP` : "MCP configurado (vazio)",
          explanation: servers.length
            ? `Conecta com: ${servers.join(", ")}.`
            : "O .mcp.json existe mas não declara servidor nenhum.",
        });
      } catch {
        steps.push({
          node: "mcp",
          title: "MCP configurado",
          explanation: "Existe .mcp.json, mas não deu pra interpretar o conteúdo.",
        });
      }
    }

    const agents = await tryListDirectory(client, path.join(rootPath, ".claude", "agents"));
    if (agents.found && agents.names.length) {
      steps.push({
        node: "subagents",
        title: `${agents.names.length} subagent(s) encontrado(s) (via MCP)`,
        explanation: `Arquivos em .claude/agents: ${agents.names.join(", ")}.`,
      });
    }

    steps.push({
      node: "agent",
      title: "Mapa completo (leitura via MCP)",
      explanation: `Essa análise foi feita 100% via protocolo MCP — nenhuma leitura de arquivo usou o filesystem do Node diretamente.`,
    });

    return steps;
  });
}
