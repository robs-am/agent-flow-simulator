import { useEffect, useRef, useState } from "react";
import { simulateRequest, analyzeGithubRepo, analyzeLocalProject } from "./services/api";
import FlowDiagram from "./components/FlowDiagram";
import ScenarioPicker from "./components/ScenarioPicker";
import StepLog from "./components/StepLog";
import { Card, CardContent } from "@/components/ui/card";
import type { NodeId, SimulationResult } from "./types";

const STEP_DELAY_MS = 900;

export default function App() {
  const [steps, setSteps] = useState<SimulationResult["steps"]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  async function runAnimation(fetchSteps: () => Promise<SimulationResult>) {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setRunning(true);
    setError(null);
    setActiveIndex(-1);
    setSteps([]);

    try {
      const result = await fetchSteps();
      setSteps(result.steps);

      result.steps.forEach((_, i) => {
        const t = setTimeout(() => {
          setActiveIndex(i);
          if (i === result.steps.length - 1) setRunning(false);
        }, i * STEP_DELAY_MS);
        timeoutsRef.current.push(t);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setRunning(false);
    }
  }

  const visitedNodes: NodeId[] = steps.slice(0, activeIndex).map((s) => s.node);
  const activeNode: NodeId | null = activeIndex >= 0 ? steps[activeIndex]?.node ?? null : null;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="font-mono-tight text-xs uppercase tracking-[0.2em] text-[hsl(var(--secondary))] mb-2">
          Agent Flow Simulator
        </p>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Como um agente decide o que consultar
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 max-w-lg">
          AGENTS.md, Skills, MCP e Subagents — com exemplos, um repositório
          GitHub real, ou uma pasta local via MCP.
        </p>

        <Card className="p-4">
          <ScenarioPicker
            onRunExample={(text) => runAnimation(() => simulateRequest(text))}
            onRunGithub={(owner, repo) => runAnimation(() => analyzeGithubRepo(owner, repo))}
            onRunLocal={(path) => runAnimation(() => analyzeLocalProject(path))}
            disabled={running}
          />
        </Card>

        {error && (
          <p className="text-sm text-[hsl(var(--destructive))] mt-3 font-mono-tight">
            {error}
          </p>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <Card className="p-4">
            <CardContent className="p-0 flex justify-center">
              <FlowDiagram activeNode={activeNode} visitedNodes={visitedNodes} />
            </CardContent>
          </Card>

          <Card className="p-4 lg:max-h-[420px] lg:overflow-y-auto">
            <p className="font-mono-tight text-[11px] uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))] mb-3">
              Passos
            </p>
            <StepLog steps={steps} revealedCount={activeIndex + 1} />
          </Card>
        </div>
      </div>
    </div>
  );
}
