// Este é o único lugar do projeto que fala o protocolo MCP de verdade.
// Usa o SDK oficial pra subir @modelcontextprotocol/server-filesystem
// como um processo filho (via stdio) e conversar com ele via JSON-RPC —
// exatamente como o Claude Code faria.
//
// Diferente do githubService.js (chamada HTTP direta), aqui a "ferramenta
// externa" é o próprio disco do usuário, então faz sentido de verdade
// passar pelo protocolo — é o caso de uso raiz do MCP.
//
// Assim como o githubService.js, lê o CONTEÚDO de cada skill/subagent
// (não só o nome do arquivo) pra explicar de verdade o que cada um faz.

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "node:path";
import { extractAgentDescription, extractSkillDescription, extractHeadings, truncate } from "./mdParsing.js";

const MAX_ITEMS_DETAILED = 6; // mesmo limite do githubService, por consistência

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

function bulletList(items) {
  return items.map((line) => `• ${line}`).join("\n");
}

// Lê o conteúdo de cada arquivo .md de uma pasta (limitado a
// MAX_ITEMS_DETAILED), devolvendo [{ name, content }].
async function readEachFile(client, dirPath, names) {
  const limited = names.slice(0, MAX_ITEMS_DETAILED);
  const results = await Promise.all(
    limited.map(async (name) => {
      const file = await tryReadFile(client, path.join(dirPath, name));
      return { name: name.replace(/\.md$/, ""), content: file.text };
    })
  );
  return { results, omitted: names.length - limited.length };
}

export async function analyzeLocalProject(rootPath) {
  return withMcpClient(rootPath, async (client) => {
    const steps = [];

    const agentsMd = await tryReadFile(client, path.join(rootPath, "AGENTS.md"));
    if (agentsMd.found) {
      const preview = truncate(agentsMd.text.trim(), 140);
      const headings = extractHeadings(agentsMd.text);
      const headingsLine = headings.length ? `\nSeções: ${headings.slice(0, 6).join(", ")}` : "";
      steps.push({
        node: "agents-md",
        title: "AGENTS.md encontrado (via MCP)",
        explanation: `Lido em tempo real do disco via MCP filesystem. Início: "${preview}"${headingsLine}`,
      });
    } else {
      steps.push({
        node: "agents-md",
        title: "Sem AGENTS.md",
        explanation: "Não foi encontrado um AGENTS.md na raiz dessa pasta.",
      });
    }

    const commandsDir = path.join(rootPath, ".claude", "commands");
    const commands = await tryListDirectory(client, commandsDir);
    if (commands.found && commands.names.length) {
      const { results, omitted } = await readEachFile(client, commandsDir, commands.names);
      const lines = results.map((r) => {
        const desc = truncate(extractSkillDescription(r.content) || "sem descrição no arquivo", 90);
        return `${r.name} — ${desc}`;
      });
      const omittedLine = omitted > 0 ? `\n(+ ${omitted} outra(s), não detalhada(s))` : "";
      steps.push({
        node: "skills",
        title: `${commands.names.length} skill(s) encontrada(s) (via MCP)`,
        explanation: `${bulletList(lines)}${omittedLine}`,
      });
    }

    let mcpServersCount = 0;
    const mcpConfig = await tryReadFile(client, path.join(rootPath, ".mcp.json"));
    if (mcpConfig.found) {
      try {
        const parsed = JSON.parse(mcpConfig.text);
        const entries = Object.entries(parsed.mcpServers || {});
        mcpServersCount = entries.length;
        const lines = entries.map(([name, cfg]) => {
          const args = Array.isArray(cfg.args) ? cfg.args.join(" ") : "";
          return `${name} — ${cfg.command || "?"} ${args}`.trim();
        });
        steps.push({
          node: "mcp",
          title: entries.length ? `${entries.length} conexão(ões) MCP` : "MCP configurado (vazio)",
          explanation: entries.length ? bulletList(lines) : "O .mcp.json existe mas não declara servidor nenhum.",
        });
      } catch {
        steps.push({
          node: "mcp",
          title: "MCP configurado",
          explanation: "Existe .mcp.json, mas não deu pra interpretar o conteúdo.",
        });
      }
    }

    const agentsDir = path.join(rootPath, ".claude", "agents");
    const agents = await tryListDirectory(client, agentsDir);
    if (agents.found && agents.names.length) {
      const { results, omitted } = await readEachFile(client, agentsDir, agents.names);
      const lines = results.map((r) => {
        const desc = truncate(extractAgentDescription(r.content) || "sem description no frontmatter", 90);
        return `${r.name} — ${desc}`;
      });
      const omittedLine = omitted > 0 ? `\n(+ ${omitted} outro(s), não detalhado(s))` : "";
      steps.push({
        node: "subagents",
        title: `${agents.names.length} subagent(s) encontrado(s) (via MCP)`,
        explanation: `${bulletList(lines)}${omittedLine}`,
      });
    }

    const semprePresente = agentsMd.found
      ? "AGENTS.md (regras globais)"
      : "nada — sem AGENTS.md na raiz";

    const sobDemanda = [
      commands.found && commands.names.length ? `${commands.names.length} skill(s)` : null,
      mcpServersCount ? `${mcpServersCount} conexão(ões) MCP` : null,
      agents.found && agents.names.length ? `${agents.names.length} subagent(s)` : null,
    ].filter(Boolean);

    steps.push({
      node: "agent",
      title: "Mapa completo (leitura via MCP)",
      explanation:
        "Análise feita 100% via protocolo MCP — nada usou o filesystem do Node diretamente.\n" +
        `• Sempre presente: ${semprePresente}\n` +
        `• Sob demanda: ${sobDemanda.length ? sobDemanda.join(", ") : "nada configurado"}`,
    });

    return steps;
  });
}
