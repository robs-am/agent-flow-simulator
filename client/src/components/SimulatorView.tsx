import { useEffect, useRef, useState } from "react";
import {
  simulateRequest,
  classifyRequestAI,
  analyzeGithubRepo,
  analyzeLocalProject,
} from "../services/api";
import { Sparkles } from "lucide-react";
import FlowDiagram from "./FlowDiagram";
import ScenarioPicker from "./ScenarioPicker";
import StepLog from "./StepLog";
import { Card, CardContent } from "@/components/ui/card";
import type { NodeId, SimulationResult } from "../types";

// Tela do simulador: escolhe um cenário (exemplo, repo GitHub ou pasta
// local) e anima o fluxo de decisão passo a passo no diagrama. Extraído do
// App pra conviver com o GuideView sob o mesmo menu de navegação.

const STEP_DELAY_MS = 900;

export default function SimulatorView() {
  const [steps, setSteps] = useState<SimulationResult["steps"]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [running, setRunning] = useState(false);
  // `loading` cobre só a chamada à API (antes dos passos chegarem); o overlay
  // central usa ele pra não tapar a animação do diagrama, que vem depois.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  async function runAnimation(fetchSteps: () => Promise<SimulationResult>) {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setRunning(true);
    setLoading(true);
    setError(null);
    setActiveIndex(-1);
    setSteps([]);

    try {
      const result = await fetchSteps();
      setLoading(false); // chegaram os passos — some o overlay, começa a animação
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
      setLoading(false);
      setRunning(false);
    }
  }

  const visitedNodes: NodeId[] = steps.slice(0, activeIndex).map((s) => s.node);
  const activeNode: NodeId | null = activeIndex >= 0 ? steps[activeIndex]?.node ?? null : null;

  return (
    <>
      {/* Overlay central enquanto a IA processa (antes dos passos chegarem) */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[hsl(var(--background)/0.4)] backdrop-blur-sm">
          <Sparkles className="size-16 text-[hsl(var(--primary))] animate-pulse" />
          <p className="font-mono-tight text-sm uppercase tracking-[0.15em] text-[hsl(var(--primary))] animate-pulse">
            Analisando
          </p>
        </div>
      )}

      <Card className="p-4">
        <ScenarioPicker
          onRunExample={(text) => runAnimation(() => simulateRequest(text))}
          onRunAI={(text) => runAnimation(() => classifyRequestAI(text))}
          onRunGithub={(owner, repo) => runAnimation(() => analyzeGithubRepo(owner, repo))}
          onRunLocal={(path) => runAnimation(() => analyzeLocalProject(path))}
          disabled={running}
        />
      </Card>

      {error && (
        <p className="text-sm text-[hsl(var(--destructive))] mt-3 font-mono-tight">{error}</p>
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
    </>
  );
}
