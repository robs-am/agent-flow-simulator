import type { NodeId } from "../types";

// Diagrama concêntrico da arquitetura de contexto:
//   • núcleo   = AGENTE (o orquestrador)
//   • anel     = AGENTS.MD, sempre carregado, envolvendo o agente
//   • externo  = SKILLS / MCP / SUBAGENTS, acionados sob demanda
// A geometria (posição/anel) codifica a ideia central: o que é barato e
// essencial fica no centro sempre ligado; o caro/específico orbita fora.
//
// Dois modos:
//   flow    → simulador: os nós acendem em sequência (activeNode/visited).
//   explore → guia: cada nó ganha a cor da sua identidade e é clicável.
// Regra do client/AGENTS.md: SVG puro, sem lib de gráficos.

const CENTER = { x: 180, y: 175 };
const AGENT_R = 30;
const RING_R = 56; // raio médio do anel AGENTS.MD
const RING_W = 30; // espessura do anel (banda clicável)
const BOUNDARY_R = 150; // círculo tracejado "sob demanda"
const OUTER_R = 130; // raio onde ficam os 3 nós externos

interface OuterNode {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Três nós externos em triângulo: Skills no topo, MCP e Subagents embaixo.
const OUTER: Record<"skills" | "mcp" | "subagents", OuterNode> = {
  skills: { x: CENTER.x, y: CENTER.y - OUTER_R, w: 92, h: 40 },
  mcp: { x: CENTER.x + OUTER_R * 0.866, y: CENTER.y + OUTER_R * 0.5, w: 92, h: 40 },
  subagents: { x: CENTER.x - OUTER_R * 0.866, y: CENTER.y + OUTER_R * 0.5, w: 100, h: 40 },
};

const LABELS: Record<NodeId, string> = {
  agent: "AGENTE",
  "agents-md": "AGENTS.MD",
  skills: "SKILLS",
  mcp: "MCP",
  subagents: "SUBAGENTS",
};

// Cor de identidade de cada nó (modo explore). Segue o código de cores do
// material de referência (ver data/guideContent.ts).
const ACCENT: Record<NodeId, string> = {
  agent: "194 45% 38%",
  "agents-md": "28 82% 52%",
  skills: "270 60% 55%",
  mcp: "214 80% 55%",
  subagents: "0 72% 51%",
};

type NodeState = "active" | "visited" | "idle";

const FLOW_COLORS: Record<NodeState, { fill: string; stroke: string; text: string }> = {
  idle: { fill: "var(--color-surface)", stroke: "var(--color-line)", text: "var(--color-ink)" },
  visited: { fill: "hsl(194 45% 92%)", stroke: "var(--color-trace)", text: "var(--color-ink)" },
  active: { fill: "var(--color-signal)", stroke: "hsl(28 82% 38%)", text: "var(--color-signal-foreground)" },
};

interface FlowDiagramProps {
  mode?: "flow" | "explore";
  // modo flow
  activeNode?: NodeId | null;
  visitedNodes?: NodeId[];
  // modo explore
  selectedNode?: NodeId | null;
  onNodeSelect?: (id: NodeId) => void;
}

export default function FlowDiagram({
  mode = "flow",
  activeNode = null,
  visitedNodes = [],
  selectedNode = null,
  onNodeSelect,
}: FlowDiagramProps) {
  const interactive = mode === "explore" && !!onNodeSelect;

  function flowState(id: NodeId): NodeState {
    if (id === activeNode) return "active";
    if (visitedNodes.includes(id)) return "visited";
    return "idle";
  }

  // Estilo de um nó conforme o modo. No explore, o nó selecionado fica com a
  // cor cheia; os demais ficam só delineados na própria cor.
  function styleFor(id: NodeId) {
    if (mode === "explore") {
      const accent = ACCENT[id];
      const selected = id === selectedNode;
      return {
        fill: selected ? `hsl(${accent})` : `hsl(${accent} / 0.08)`,
        stroke: `hsl(${accent})`,
        text: selected ? "#fff" : `hsl(${accent})`,
        selected,
      };
    }
    const s = flowState(id);
    return { ...FLOW_COLORS[s], selected: false, state: s };
  }

  function handleClick(id: NodeId) {
    if (interactive) onNodeSelect?.(id);
  }

  const groupProps = (id: NodeId) =>
    interactive
      ? {
          onClick: () => handleClick(id),
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick(id);
            }
          },
          role: "button" as const,
          tabIndex: 0,
          "aria-label": LABELS[id],
          style: { cursor: "pointer" as const },
          className: "fd-hit",
        }
      : {};

  const agentStyle = styleFor("agent");
  const agentsMdStyle = styleFor("agents-md");
  const isPulsing = (id: NodeId) => mode === "flow" && id === activeNode;

  return (
    <div className="w-full flex flex-col items-center">
      <p className="font-mono-tight text-[11px] uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))] mb-1 self-start pl-1">
        {mode === "explore" ? "Clique num nó pra entender" : "Fig. 1 — Fluxo de decisão"}
      </p>
      <svg viewBox="0 0 360 350" width="100%" style={{ maxWidth: 460 }}>
        <style>{`
          .fd-shape { transition: fill 0.3s ease, stroke 0.3s ease, opacity 0.2s ease; }
          .fd-edge { stroke: var(--color-line); stroke-width: 1.5; stroke-dasharray: 4 3; transition: stroke 0.35s ease, stroke-dasharray 0.35s ease; }
          .fd-edge-active { stroke: var(--color-trace); stroke-dasharray: none; stroke-width: 2; }
          @keyframes fd-pulse { 0%, 100% { stroke-width: 2; } 50% { stroke-width: 4; } }
          .fd-pulsing { animation: fd-pulse 1s ease-in-out infinite; }
          .fd-hit { outline: none; }
          .fd-hit:hover .fd-shape { opacity: 0.85; }
          .fd-hit:focus-visible .fd-halo { opacity: 1; }
          .fd-halo { opacity: 0; transition: opacity 0.2s ease; }
          .fd-halo-on { opacity: 1; }
        `}</style>

        {/* fronteira "sob demanda" */}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={BOUNDARY_R}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={1}
          strokeDasharray="3 4"
          opacity={0.7}
        />
        <text
          x={CENTER.x}
          y={CENTER.y + BOUNDARY_R - 8}
          textAnchor="middle"
          fontSize={9}
          fontFamily="var(--font-mono)"
          letterSpacing="0.18em"
          fill="var(--color-muted-foreground)"
        >
          SOB DEMANDA
        </text>

        {/* conexões agente → nós externos */}
        {(Object.keys(OUTER) as ("skills" | "mcp" | "subagents")[]).map((id) => {
          const n = OUTER[id];
          const dx = n.x - CENTER.x;
          const dy = n.y - CENTER.y;
          const len = Math.hypot(dx, dy);
          const ux = dx / len;
          const uy = dy / len;
          const active =
            mode === "flow" && (id === activeNode || visitedNodes.includes(id)) && visitedNodes.includes("agent");
          return (
            <line
              key={`edge-${id}`}
              x1={CENTER.x + ux * (RING_R + RING_W / 2)}
              y1={CENTER.y + uy * (RING_R + RING_W / 2)}
              x2={n.x - ux * (n.w / 2)}
              y2={n.y - uy * (n.h / 2)}
              className={`fd-edge ${active ? "fd-edge-active" : ""}`}
            />
          );
        })}

        {/* anel AGENTS.MD — sempre presente, envolve o agente */}
        <g {...groupProps("agents-md")}>
          <circle
            className={`fd-halo ${agentsMdStyle.selected ? "fd-halo-on" : ""}`}
            cx={CENTER.x}
            cy={CENTER.y}
            r={RING_R + RING_W / 2 + 3}
            fill="none"
            stroke={`hsl(${ACCENT["agents-md"]})`}
            strokeWidth={1.5}
          />
          <circle
            className={`fd-shape ${isPulsing("agents-md") ? "fd-pulsing" : ""}`}
            cx={CENTER.x}
            cy={CENTER.y}
            r={RING_R}
            fill="none"
            stroke={agentsMdStyle.stroke}
            strokeWidth={mode === "explore" && !agentsMdStyle.selected ? RING_W * 0.5 : RING_W}
            strokeOpacity={mode === "explore" && !agentsMdStyle.selected ? 0.18 : 1}
          />
          <text
            x={CENTER.x}
            y={CENTER.y + RING_R}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontFamily="var(--font-mono)"
            letterSpacing="0.04em"
            fill={mode === "explore" ? `hsl(${ACCENT["agents-md"]})` : "var(--color-ink)"}
            style={{ pointerEvents: "none" }}
          >
            AGENTS.MD
          </text>
          <text
            x={CENTER.x}
            y={CENTER.y - RING_R}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={7}
            fontFamily="var(--font-mono)"
            letterSpacing="0.16em"
            fill="var(--color-muted-foreground)"
            style={{ pointerEvents: "none" }}
          >
            SEMPRE
          </text>
        </g>

        {/* núcleo AGENTE */}
        <g {...groupProps("agent")}>
          <circle
            className={`fd-halo ${agentStyle.selected ? "fd-halo-on" : ""}`}
            cx={CENTER.x}
            cy={CENTER.y}
            r={AGENT_R + 4}
            fill="none"
            stroke={`hsl(${ACCENT.agent})`}
            strokeWidth={1.5}
          />
          <circle
            className={`fd-shape ${isPulsing("agent") ? "fd-pulsing" : ""}`}
            cx={CENTER.x}
            cy={CENTER.y}
            r={AGENT_R}
            fill={agentStyle.fill}
            stroke={agentStyle.stroke}
            strokeWidth={2}
          />
          <text
            x={CENTER.x}
            y={CENTER.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontFamily="var(--font-mono)"
            letterSpacing="0.03em"
            fill={agentStyle.text}
            style={{ pointerEvents: "none" }}
          >
            AGENTE
          </text>
        </g>

        {/* nós externos */}
        {(Object.keys(OUTER) as ("skills" | "mcp" | "subagents")[]).map((id) => {
          const n = OUTER[id];
          const st = styleFor(id);
          return (
            <g key={id} {...groupProps(id)}>
              <rect
                className={`fd-halo ${st.selected ? "fd-halo-on" : ""}`}
                x={n.x - n.w / 2 - 4}
                y={n.y - n.h / 2 - 4}
                width={n.w + 8}
                height={n.h + 8}
                rx={5}
                fill="none"
                stroke={`hsl(${ACCENT[id]})`}
                strokeWidth={1.5}
              />
              <rect
                className={`fd-shape ${isPulsing(id) ? "fd-pulsing" : ""}`}
                x={n.x - n.w / 2}
                y={n.y - n.h / 2}
                width={n.w}
                height={n.h}
                rx={4}
                fill={st.fill}
                stroke={st.stroke}
                strokeWidth={2}
              />
              <text
                x={n.x}
                y={n.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontFamily="var(--font-mono)"
                letterSpacing="0.03em"
                fill={st.text}
                style={{ pointerEvents: "none" }}
              >
                {LABELS[id]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
