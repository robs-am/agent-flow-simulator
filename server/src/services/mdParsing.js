// Parsing leve de markdown/frontmatter, compartilhado entre
// githubService.js (API REST) e mcpFilesystemService.js (MCP local) —
// os dois precisam extrair a MESMA informação (descrição real de cada
// skill/subagent), só a fonte dos bytes muda.

// Extrai o bloco de frontmatter YAML (--- ... ---) no topo do arquivo,
// se existir. Parsing simples de "chave: valor" — não é um parser YAML
// completo, mas cobre o formato que skills/subagents realmente usam.
export function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const [, rawFrontmatter, body] = match;
  const frontmatter = {};
  for (const line of rawFrontmatter.split("\n")) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) frontmatter[kv[1]] = kv[2].trim();
  }
  return { frontmatter, body };
}

// Descrição de um SUBAGENT: pelo nosso próprio padrão (ver
// .claude/agents/*.md deste projeto), o campo "description" do
// frontmatter É a descrição — é literalmente pra isso que ele existe.
export function extractAgentDescription(content) {
  const { frontmatter } = parseFrontmatter(content);
  return frontmatter.description || null;
}

// Descrição de uma SKILL: skills (slash commands) normalmente não têm
// frontmatter — a intenção está no primeiro parágrafo de texto depois
// do título. Pega a primeira linha não-vazia, não-cabeçalho, não-comentário.
export function extractSkillDescription(content) {
  const { body } = parseFrontmatter(content);
  const lines = body.split("\n").map((l) => l.trim());
  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith("#")) continue;
    if (line.startsWith("<!--")) continue;
    return line;
  }
  return null;
}

// Cabeçalhos "## " de um AGENTS.md — dá um índice rápido do que o
// arquivo cobre, além do preview de texto corrido.
export function extractHeadings(content) {
  return content
    .split("\n")
    .filter((l) => l.trim().startsWith("## "))
    .map((l) => l.replace(/^##\s*/, "").trim());
}

export function truncate(text, max) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}
