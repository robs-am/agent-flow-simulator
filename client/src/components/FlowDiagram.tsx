import type { NodeId } from "../types";

interface NodeDef {
  x: number;
  y: number;
  label: string;
  w: number;
  h: number;
}

const NODES: Record<NodeId, NodeDef> = {
  agent: { x: 200, y: 150, label: "AGENTE", w: 96, h: 52 },
  "agents-md": { x: 200, y: 40, label: "AGENTS.MD", w: 118, h: 46 },
  skills: { x: 55, y: 150, label: "SKILLS", w: 96, h: 46 },
  mcp: { x: 345, y: 150, label: "MCP", w: 96, h: 46 },
  subagents: { x: 200, y: 260, label: "SUBAGENTS", w: 118, h: 46 },
};

const EDGES: [NodeId, NodeId][] = [
  ["agent", "agents-md"],
  ["agent", "skills"],
  ["agent", "mcp"],
  ["agent", "subagents"],
];

type NodeState = "active" | "visited" | "idle";

const COLORS: Record<NodeState, { fill: string; stroke: string; text: string }> = {
  idle: { fill: "var(--color-surface)", stroke: "var(--color-line)", text: "var(--color-ink)" },
  visited: { fill: "hsl(194 45% 92%)", stroke: "var(--color-trace)", text: "var(--color-ink)" },
  active: { fill: "var(--color-signal)", stroke: "hsl(28 82% 38%)", text: "var(--color-signal-foreground)" },
};

interface FlowDiagramProps {
  activeNode: NodeId | null;
  visitedNodes: NodeId[];
}

/**
 * Diagrama do fluxo de decisão, estilo esquema técnico: grid, cantos
 * de anotação nos nós ativos/visitados, labels em monoespaçada.
 * Regra do client/AGENTS.md: SVG puro, sem lib de gráficos.
 */
export default function FlowDiagram({ activeNode, visitedNodes }: FlowDiagramProps) {
  function nodeState(id: NodeId): NodeState {
    if (id === activeNode) return "active";
    if (visitedNodes.includes(id)) return "visited";
    return "idle";
  }

  function edgeActive([a, b]: [NodeId, NodeId]): boolean {
    return (
      (a === activeNode && visitedNodes.includes(b)) ||
      (b === activeNode && visitedNodes.includes(a)) ||
      (visitedNodes.includes(a) && visitedNodes.includes(b))
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <p className="font-mono-tight text-[11px] uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))] mb-1 self-start pl-1">
        Fig. 1 — Fluxo de decisão
      </p>
      <svg viewBox="0 0 400 320" width="100%" style={{ maxWidth: 460 }}>
        <style>{`
          .fd-rect { transition: fill 0.35s ease, stroke 0.35s ease; }
          .fd-edge { stroke: var(--color-line); stroke-width: 1.5; stroke-dasharray: 4 3; transition: stroke 0.35s ease, stroke-dasharray 0.35s ease; }
          .fd-edge-active { stroke: var(--color-trace); stroke-dasharray: none; stroke-width: 2; }
          @keyframes fd-pulse-stroke {
            0%, 100% { stroke-width: 2; }
            50% { stroke-width: 4; }
          }
          .fd-pulsing { animation: fd-pulse-stroke 1s ease-in-out infinite; }
          .fd-bracket { stroke: var(--color-signal); stroke-width: 1.5; fill: none; opacity: 0; transition: opacity 0.3s ease; }
          .fd-bracket-visible { opacity: 1; }
        `}</style>

        {EDGES.map(([a, b]) => {
          const na = NODES[a];
          const nb = NODES[b];
          return (
            <line
              key={`${a}-${b}`}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              className={`fd-edge ${edgeActive([a, b]) ? "fd-edge-active" : ""}`}
            />
          );
        })}

        {(Object.entries(NODES) as [NodeId, NodeDef][]).map(([id, n]) => {
          const state = nodeState(id);
          const colors = COLORS[state];
          const bracketOffset = 6;
          const showBracket = state !== "idle";
          return (
            <g key={id}>
              {/* cantos de anotação, estilo desenho técnico */}
              {showBracket &&
                [
                  [n.x - n.w / 2 - bracketOffset, n.y - n.h / 2 - bracketOffset, 1, 1],
                  [n.x + n.w / 2 + bracketOffset, n.y - n.h / 2 - bracketOffset, -1, 1],
                  [n.x - n.w / 2 - bracketOffset, n.y + n.h / 2 + bracketOffset, 1, -1],
                  [n.x + n.w / 2 + bracketOffset, n.y + n.h / 2 + bracketOffset, -1, -1],
                ].map(([bx, by, dx, dy], i) => (
                  <path
                    key={i}
                    d={`M ${bx} ${by + dy * 8} L ${bx} ${by} L ${bx + dx * 8} ${by}`}
                    className={`fd-bracket ${showBracket ? "fd-bracket-visible" : ""}`}
                  />
                ))}

              <rect
                x={n.x - n.w / 2}
                y={n.y - n.h / 2}
                width={n.w}
                height={n.h}
                rx={3}
                className={`fd-rect ${state === "active" ? "fd-pulsing" : ""}`}
                fill={colors.fill}
                stroke={colors.stroke}
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
                fill={colors.text}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
