// Analisa a arquitetura de um repositório GitHub público, batendo
// direto na API REST (sem MCP) — decisão registrada em backend/AGENTS.md.
//
// Funciona com qualquer repo público, sem token (60 req/hora por IP).
// Se GITHUB_TOKEN estiver definido no .env, usa ele pra subir o limite
// pra 5.000 req/hora.
//
// Diferente da primeira versão, este service lê o CONTEÚDO de cada
// skill/subagent encontrado (não só o nome do arquivo) pra explicar de
// verdade o que cada um faz — ver mdParsing.js pros helpers de extração.

import { extractAgentDescription, extractSkillDescription, extractHeadings, truncate } from "./mdParsing.js";

const API_BASE = "https://api.github.com";
const MAX_ITEMS_DETAILED = 6; // limite de chamadas extras por categoria, pra não estourar rate limit

function authHeaders() {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function fetchContents(owner, repo, path) {
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
    headers: authHeaders(),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub API retornou ${res.status} para ${path}`);
  }
  return res.json();
}

function decodeBase64File(fileEntry) {
  if (!fileEntry?.content) return "";
  return Buffer.from(fileEntry.content, "base64").toString("utf-8");
}

// Busca o conteúdo de cada arquivo .md de uma lista de entradas de
// diretório (limitado a MAX_ITEMS_DETAILED pra não estourar o rate
// limit do GitHub), devolvendo [{ name, content }].
async function fetchFileContents(owner, repo, entries) {
  const limited = entries.slice(0, MAX_ITEMS_DETAILED);
  const results = await Promise.all(
    limited.map(async (entry) => {
      const file = await fetchContents(owner, repo, entry.path);
      return { name: entry.name.replace(/\.md$/, ""), content: decodeBase64File(file) };
    })
  );
  return { results, omitted: entries.length - limited.length };
}

function bulletList(items) {
  return items.map((line) => `• ${line}`).join("\n");
}

// Cada build*Step recebe o que já foi buscado da API e devolve um passo
// (ou null, quando a categoria não existe no repo). A orquestração fica no
// analyzeGithubRepo, que só faz os fetches e junta os passos.

function buildAgentsMdStep(agentsMd) {
  if (!agentsMd || Array.isArray(agentsMd)) {
    return {
      node: "agents-md",
      title: "Sem AGENTS.md",
      explanation:
        "Esse repositório não define um AGENTS.md na raiz — não há regras globais sempre presentes configuradas.",
    };
  }
  const content = decodeBase64File(agentsMd);
  const preview = truncate(content.trim(), 140);
  const headings = extractHeadings(content);
  const headingsLine = headings.length ? `\nSeções: ${headings.slice(0, 6).join(", ")}` : "";
  return {
    node: "agents-md",
    title: "AGENTS.md encontrado",
    explanation: `Regras sempre presentes. Início: "${preview}"${headingsLine}`,
  };
}

async function buildSkillsStep(owner, repo, commands) {
  if (!Array.isArray(commands) || commands.length === 0) return null;
  const { results, omitted } = await fetchFileContents(owner, repo, commands);
  const lines = results.map((r) => {
    const desc = truncate(extractSkillDescription(r.content) || "sem descrição no arquivo", 90);
    return `${r.name} — ${desc}`;
  });
  const omittedLine = omitted > 0 ? `\n(+ ${omitted} outra(s), não detalhada(s) pra economizar chamadas à API)` : "";
  return {
    node: "skills",
    title: `${commands.length} skill(s) encontrada(s)`,
    explanation: `${bulletList(lines)}${omittedLine}`,
  };
}

// Devolve { step, count } — o count alimenta o resumo final.
function buildMcpStep(mcpConfig) {
  if (!mcpConfig || Array.isArray(mcpConfig)) return { step: null, count: 0 };
  try {
    const parsed = JSON.parse(decodeBase64File(mcpConfig));
    const entries = Object.entries(parsed.mcpServers || {});
    const lines = entries.map(([name, cfg]) => {
      const args = Array.isArray(cfg.args) ? cfg.args.join(" ") : "";
      return `${name} — ${cfg.command || "?"} ${args}`.trim();
    });
    return {
      count: entries.length,
      step: {
        node: "mcp",
        title: entries.length ? `${entries.length} conexão(ões) MCP` : "MCP configurado (vazio)",
        explanation: entries.length
          ? bulletList(lines)
          : "O .mcp.json existe mas não declara nenhum servidor — o projeto não precisa de recurso externo agora.",
      },
    };
  } catch {
    return {
      count: 0,
      step: {
        node: "mcp",
        title: "MCP configurado",
        explanation: "Existe um .mcp.json, mas não foi possível interpretar o conteúdo.",
      },
    };
  }
}

async function buildSubagentsStep(owner, repo, agents) {
  if (!Array.isArray(agents) || agents.length === 0) return null;
  const { results, omitted } = await fetchFileContents(owner, repo, agents);
  const lines = results.map((r) => {
    const desc = truncate(extractAgentDescription(r.content) || "sem description no frontmatter", 90);
    return `${r.name} — ${desc}`;
  });
  const omittedLine = omitted > 0 ? `\n(+ ${omitted} outro(s), não detalhado(s) pra economizar chamadas à API)` : "";
  return {
    node: "subagents",
    title: `${agents.length} subagent(s) encontrado(s)`,
    explanation: `${bulletList(lines)}${omittedLine}`,
  };
}

function buildSummaryStep(owner, repo, { hasAgentsMd, skillsCount, mcpServersCount, subagentsCount }) {
  const semprePresente = hasAgentsMd ? "AGENTS.md (regras globais)" : "nada — sem AGENTS.md na raiz";
  const sobDemanda = [
    skillsCount ? `${skillsCount} skill(s)` : null,
    mcpServersCount ? `${mcpServersCount} conexão(ões) MCP` : null,
    subagentsCount ? `${subagentsCount} subagent(s)` : null,
  ].filter(Boolean);
  return {
    node: "agent",
    title: "Mapa completo",
    explanation:
      `Retrato de ${owner}/${repo}:\n` +
      `• Sempre presente: ${semprePresente}\n` +
      `• Sob demanda: ${sobDemanda.length ? sobDemanda.join(", ") : "nada configurado"}`,
  };
}

export async function analyzeGithubRepo(owner, repo) {
  const [agentsMd, commands, mcpConfig, agents] = await Promise.all([
    fetchContents(owner, repo, "AGENTS.md"),
    fetchContents(owner, repo, ".claude/commands"),
    fetchContents(owner, repo, ".mcp.json"),
    fetchContents(owner, repo, ".claude/agents"),
  ]);

  const { step: mcpStep, count: mcpServersCount } = buildMcpStep(mcpConfig);

  const steps = [
    buildAgentsMdStep(agentsMd),
    await buildSkillsStep(owner, repo, commands),
    mcpStep,
    await buildSubagentsStep(owner, repo, agents),
    buildSummaryStep(owner, repo, {
      hasAgentsMd: agentsMd && !Array.isArray(agentsMd),
      skillsCount: Array.isArray(commands) ? commands.length : 0,
      mcpServersCount,
      subagentsCount: Array.isArray(agents) ? agents.length : 0,
    }),
  ];

  return steps.filter(Boolean);
}
