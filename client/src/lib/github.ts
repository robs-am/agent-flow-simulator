// Aceita vários formatos de entrada e extrai { owner, repo }:
// - https://github.com/anthropics/claude-code
// - https://github.com/anthropics/claude-code/tree/main
// - github.com/anthropics/claude-code
// - anthropics/claude-code (atalho, sem URL completa)

export function parseGithubUrl(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim().replace(/\.git$/, "");
  if (!trimmed) return null;

  // Atalho "owner/repo" sem domínio nenhum
  const shortcutMatch = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (shortcutMatch) {
    return { owner: shortcutMatch[1], repo: shortcutMatch[2] };
  }

  // URL completa ou parcial contendo github.com/owner/repo
  const urlMatch = trimmed.match(/github\.com\/([\w.-]+)\/([\w.-]+)/);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  return null;
}
