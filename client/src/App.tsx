import { useState } from "react";
import SimulatorView from "./components/SimulatorView";
import GuideView from "./components/GuideView";

// Duas telas sob um menu: o simulador (mostra o fluxo acontecendo) e o guia
// (explica o que é cada componente). Navegação leve via useState — não vale
// a pena trazer um router pra duas views.

type View = "sim" | "guide";

const TABS: { id: View; label: string; hint: string }[] = [
  { id: "sim", label: "Simulador", hint: "Veja o fluxo de decisão acontecendo" },
  { id: "guide", label: "Guia", hint: "Entenda o que é cada componente" },
];

export default function App() {
  const [view, setView] = useState<View>("sim");
  const activeHint = TABS.find((t) => t.id === view)?.hint;

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
          AGENTS.md, Skills, MCP e Subagents — com exemplos, um repositório GitHub real, ou uma pasta
          local via MCP.
        </p>

        {/* Menu de navegação entre as telas */}
        <nav className="flex items-center gap-1 border-b border-[hsl(var(--border))] mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              aria-current={view === tab.id ? "page" : undefined}
              className={`font-mono-tight text-[13px] uppercase tracking-[0.12em] px-3 py-2 -mb-px border-b-2 transition-colors ${
                view === tab.id
                  ? "border-[hsl(var(--primary))] text-[hsl(var(--foreground))]"
                  : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              {tab.label}
            </button>
          ))}
          {activeHint && (
            <span className="ml-auto hidden sm:block text-[12px] text-[hsl(var(--muted-foreground))]">
              {activeHint}
            </span>
          )}
        </nav>

        {view === "sim" ? <SimulatorView /> : <GuideView />}
      </div>
    </div>
  );
}
