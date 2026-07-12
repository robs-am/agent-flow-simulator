// Tipos compartilhados entre os componentes. O formato de Step precisa
// bater exatamente com o que o backend devolve (veja backend/AGENTS.md:
// "todo cenário/análise precisa devolver steps com node, title e
// explanation") — antes isso era só uma convenção; agora o TypeScript
// garante isso em tempo de compilação.

export type NodeId = "agent" | "agents-md" | "skills" | "mcp" | "subagents";

export interface Step {
  node: NodeId;
  title: string;
  explanation: string;
}

export interface SimulationResult {
  matchedLabel: string;
  steps: Step[];
}

export interface BrowseResult {
  path: string;
  parent: string | null;
  directories: string[];
}
