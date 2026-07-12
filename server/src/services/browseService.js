// Lista subpastas de um caminho, pra alimentar o navegador de pastas do
// front. Diferente do mcpFilesystemService.js (que lê ARQUIVOS via MCP
// pra análise), este aqui é navegação simples de diretório — não precisa
// de protocolo nenhum, é fs do Node puro.

import { readdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

export async function browseDirectory(requestedPath) {
  const targetPath = requestedPath && requestedPath.trim() ? requestedPath : homedir();

  let entries;
  try {
    entries = await readdir(targetPath, { withFileTypes: true });
  } catch (err) {
    throw new Error(`Não foi possível abrir "${targetPath}": ${err.code === "ENOENT" ? "pasta não existe" : err.message}`);
  }

  const directories = entries
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));

  const parent = path.dirname(targetPath);
  const hasParent = parent !== targetPath; // raiz do filesystem não tem pai

  return {
    path: targetPath,
    parent: hasParent ? parent : null,
    directories,
  };
}
