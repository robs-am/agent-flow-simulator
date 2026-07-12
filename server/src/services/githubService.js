// Analisa a arquitetura de um repositório GitHub público, batendo
// direto na API REST (sem MCP) — decisão registrada em backend/AGENTS.md.
//
// Funciona com qualquer repo público, sem token (60 req/hora por IP).
// Se GITHUB_TOKEN estiver definido no .env, usa ele pra subir o limite
// pra 5.000 req/hora.

const API_BASE = "https://api.github.com";

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

export async function analyzeGithubRepo(owner, repo) {
  const steps = [];

  // AGENTS.md na raiz
  const agentsMd = await fetchContents(owner, repo, "AGENTS.md");
  if (agentsMd && !Array.isArray(agentsMd)) {
    const preview = decodeBase64File(agentsMd).slice(0, 160).trim();
    steps.push({
      node: "agents-md",
      title: "AGENTS.md encontrado",
      explanation: `Esse repositório tem regras sempre presentes definidas. Início do arquivo: "${preview}${preview.length === 160 ? "..." : ""}"`,
    });
  } else {
    steps.push({
      node: "agents-md",
      title: "Sem AGENTS.md",
      explanation:
        "Esse repositório não define um AGENTS.md na raiz — não há regras globais sempre presentes configuradas.",
    });
  }

  // Skills (.claude/commands)
  const commands = await fetchContents(owner, repo, ".claude/commands");
  if (Array.isArray(commands) && commands.length > 0) {
    const names = commands.map((f) => f.name.replace(/\.md$/, "")).join(", ");
    steps.push({
      node: "skills",
      title: `${commands.length} skill(s) encontrada(s)`,
      explanation: `Comandos sob demanda disponíveis: ${names}.`,
    });
  }

  // MCP (.mcp.json)
  const mcpConfig = await fetchContents(owner, repo, ".mcp.json");
  if (mcpConfig && !Array.isArray(mcpConfig)) {
    try {
      const parsed = JSON.parse(decodeBase64File(mcpConfig));
      const servers = Object.keys(parsed.mcpServers || {});
      steps.push({
        node: "mcp",
        title: servers.length ? `${servers.length} conexão(ões) MCP` : "MCP configurado (vazio)",
        explanation: servers.length
          ? `Conecta com: ${servers.join(", ")}.`
          : "O .mcp.json existe mas não declara nenhum servidor — o projeto não precisa de recurso externo agora.",
      });
    } catch {
      steps.push({
        node: "mcp",
        title: "MCP configurado",
        explanation: "Existe um .mcp.json, mas não foi possível interpretar o conteúdo.",
      });
    }
  }

  // Subagents (.claude/agents)
  const agents = await fetchContents(owner, repo, ".claude/agents");
  if (Array.isArray(agents) && agents.length > 0) {
    const names = agents.map((f) => f.name.replace(/\.md$/, "")).join(", ");
    steps.push({
      node: "subagents",
      title: `${agents.length} subagent(s) encontrado(s)`,
      explanation: `Agentes especializados isolados: ${names}.`,
    });
  }

  steps.push({
    node: "agent",
    title: "Mapa completo",
    explanation: `Esse é o retrato real de ${owner}/${repo} — o que está sempre presente vs. o que é acionado sob demanda.`,
  });

  return steps;
}
