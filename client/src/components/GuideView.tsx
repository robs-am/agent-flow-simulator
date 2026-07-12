import { useState } from "react";
import { Card } from "@/components/ui/card";
import FlowDiagram from "./FlowDiagram";
import { GUIDE_BY_NODE, GUIDE_ORDER, QUICK_TEST, EVOLUTION_2026 } from "../data/guideContent";
import type { ComponentGuide } from "../data/guideContent";
import type { NodeId } from "../types";

// Tela "Guia": em vez de uma parede de texto, a pessoa EXPLORA. Clica num nó
// do diagrama concêntrico (ou num chip) e o painel ao lado mostra só aquele
// componente. É o par conceitual do simulador — mesmo diagrama, outro modo.

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono-tight text-[11px] uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))] mb-3">
      {children}
    </p>
  );
}

function DetailPanel({ c }: { c: ComponentGuide }) {
  const accent = `hsl(${c.accent})`;
  return (
    <Card className="p-5 border-l-4 h-full" style={{ borderLeftColor: accent }}>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h3 className="font-mono-tight text-base font-semibold tracking-tight">
          <span className="mr-1.5">{c.emoji}</span>
          {c.name}
        </h3>
        <span
          className="font-mono-tight text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ backgroundColor: `hsl(${c.accent} / 0.12)`, color: accent }}
        >
          {c.state}
        </span>
      </div>
      <p className="text-sm font-medium mb-3">{c.tagline}</p>

      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 leading-relaxed">{c.whatIs}</p>

      <p className="font-mono-tight text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))] mb-1.5">
        Quando entra
      </p>
      <p className="text-sm mb-4 leading-relaxed">{c.whenEnters}</p>

      <p className="font-mono-tight text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))] mb-1.5">
        Exemplos
      </p>
      <ul className="mb-4 space-y-1">
        {c.examples.map((ex) => (
          <li
            key={ex}
            className="font-mono-tight text-[12px] bg-[hsl(var(--muted))] rounded px-2 py-1"
          >
            {ex}
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="font-mono-tight text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--destructive))] mb-1">
            Não coloque aqui
          </p>
          <p className="text-[13px] text-[hsl(var(--muted-foreground))] leading-snug">{c.dontPut}</p>
        </div>
        <div>
          <p className="font-mono-tight text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))] mb-1">
            Pense assim
          </p>
          <p className="text-[13px] text-[hsl(var(--muted-foreground))] leading-snug">{c.thinkOf}</p>
        </div>
      </div>

      {/* Analogia da orquestra — agora por componente, não mais um card solto */}
      <div className="mt-4 pt-3 border-t border-[hsl(var(--border))]">
        <p className="font-mono-tight text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))] mb-1">
          🎼 Na orquestra
        </p>
        <p className="text-[13px] text-[hsl(var(--muted-foreground))] leading-snug">{c.orchestra}</p>
      </div>

      {/* Evolução 2026 aparece só no detalhe de Subagents (é sobre subagents) */}
      {c.id === "subagents" && (
        <div className="mt-4 pt-3 border-t border-[hsl(var(--border))]">
          <p className="font-mono-tight text-[10px] uppercase tracking-[0.12em] mb-2" style={{ color: accent }}>
            Evolução 2026 — nem todo subagent é "isolado"
          </p>
          <ul className="space-y-2">
            {EVOLUTION_2026.map((e) => (
              <li key={e.title} className="pl-3 border-l-2" style={{ borderColor: `hsl(${c.accent} / 0.4)` }}>
                <p className="text-[13px] font-semibold">{e.title}</p>
                <p className="text-[12px] text-[hsl(var(--muted-foreground))] leading-snug">{e.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export default function GuideView() {
  const [selected, setSelected] = useState<NodeId>("agent");
  const current = GUIDE_BY_NODE[selected];

  return (
    <div className="space-y-8">
      {/* Hero interativo: diagrama + detalhe do nó selecionado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <Card className="p-4 flex flex-col">
          <FlowDiagram mode="explore" selectedNode={selected} onNodeSelect={setSelected} />
          {/* chips: navegação alternativa (mobile + descoberta) */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {GUIDE_ORDER.map((id) => {
              const g = GUIDE_BY_NODE[id];
              const on = id === selected;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelected(id)}
                  aria-pressed={on}
                  className="font-mono-tight text-[11px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-full border transition-colors"
                  style={{
                    borderColor: `hsl(${g.accent})`,
                    backgroundColor: on ? `hsl(${g.accent})` : "transparent",
                    color: on ? "#fff" : `hsl(${g.accent})`,
                  }}
                >
                  {g.emoji} {g.name.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </Card>

        <DetailPanel c={current} />
      </div>

      {/* O teste rápido */}
      <Card className="p-5">
        <SectionLabel>O teste rápido pra decidir</SectionLabel>
        <div className="divide-y divide-[hsl(var(--border))]">
          {QUICK_TEST.map((row) => (
            <div key={row.answer} className="flex items-center justify-between gap-4 py-2.5">
              <p className="text-sm">{row.question}</p>
              <span className="font-mono-tight text-[11px] font-semibold tracking-[0.05em] text-[hsl(var(--secondary))] whitespace-nowrap">
                → {row.answer}
              </span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
