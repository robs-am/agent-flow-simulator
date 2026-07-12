import type { SimulationResult, BrowseResult } from "../types";

const BASE_URL = "/api";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Falha na requisição");
  }
  return res.json();
}

export function simulateRequest(request: string): Promise<SimulationResult> {
  return post("/simulate", { request });
}

// Texto livre classificado pelo Claude (mais lento e custa chamada de API,
// mas entende qualquer ação — não só os exemplos).
export function classifyRequestAI(request: string): Promise<SimulationResult> {
  return post("/simulate/ai", { request });
}

export function analyzeGithubRepo(owner: string, repo: string): Promise<SimulationResult> {
  return post("/analyze/github", { owner, repo });
}

export function analyzeLocalProject(localPath: string): Promise<SimulationResult> {
  return post("/analyze/local", { path: localPath });
}

export async function browseDirectory(dirPath?: string): Promise<BrowseResult> {
  const url = dirPath ? `${BASE_URL}/browse?path=${encodeURIComponent(dirPath)}` : `${BASE_URL}/browse`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Falha ao navegar pasta");
  }
  return res.json();
}
