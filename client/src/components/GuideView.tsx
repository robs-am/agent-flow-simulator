import { Card } from "@/components/ui/card";
import { COMPONENTS, QUICK_TEST, ORCHESTRA, EVOLUTION_2026 } from "../data/guideContent";
import type { ComponentGuide } from "../data/guideContent";

// Tela "Guia": explica cada componente da arquitetura de contexto. É o par
// conceitual do simulador — enquanto o simulador MOSTRA o fluxo acontecendo,
// aqui a pessoa entende o que é cada peça. Conteúdo vem de data/guideContent.

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono-tight text-[11px] uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))] mb-3">
      {children}
    </p>
  );
}

function ComponentCard({ c }: { c: ComponentGuide }) {
  const accent = `hsl(${c.accent})`;
  return (
    <Card className="p-5 border-l-4" style={{ borderLeftColor: accent }}>
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
      <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-3">{c.tagline}</p>

      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 leading-relaxed">{c.whatIs}</p>

      <p className="font-mono-tight text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))] mb-1.5">
        Quando entra
      </p>
      <p className="text-sm text-[hsl(var(--foreground))] mb-4 leading-relaxed">{c.whenEnters}</p>

      <p className="font-mono-tight text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))] mb-1.5">
        Exemplos
      </p>
      <ul className="mb-4 space-y-1">
        {c.examples.map((ex) => (
          <li
            key={ex}
            className="font-mono-tight text-[12px] text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] rounded px-2 py-1"
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
    </Card>
  );
}

export default function GuideView() {
  return (
    <div className="space-y-8">
      {/* A ideia central */}
      <Card className="p-5">
        <SectionLabel>A ideia central</SectionLabel>
        <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed mb-2">
          O <strong>Agente Principal</strong> é o orquestrador. Ele recebe sua instrução e decide,
          na hora, <strong>o que precisa consultar</strong> para responder bem: regras fixas,
          workflows prontos, ferramentas externas ou agentes especializados.
        </p>
        <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
          Pense nele como um <strong>gerente de projeto</strong>: não faz tudo sozinho, mas sabe
          exatamente a quem delegar cada parte da tarefa. A lógica geral: o que é barato e essencial
          fica sempre ligado (AGENTS.MD); o que é caro ou específico só entra quando a tarefa pede
          (Skills, MCP, Subagents).
        </p>
      </Card>

      {/* Os 4 componentes */}
      <div>
        <SectionLabel>Os 4 componentes ao redor do agente</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {COMPONENTS.map((c) => (
            <ComponentCard key={c.id} c={c} />
          ))}
        </div>
      </div>

      {/* O teste rápido */}
      <Card className="p-5">
        <SectionLabel>O teste rápido pra decidir</SectionLabel>
        <div className="divide-y divide-[hsl(var(--border))]">
          {QUICK_TEST.map((row) => (
            <div key={row.answer} className="flex items-center justify-between gap-4 py-2.5">
              <p className="text-sm text-[hsl(var(--foreground))]">{row.question}</p>
              <span className="font-mono-tight text-[11px] font-semibold tracking-[0.05em] text-[hsl(var(--secondary))] whitespace-nowrap">
                → {row.answer}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Analogia da orquestra */}
      <Card className="p-5">
        <SectionLabel>Analogia — uma orquestra</SectionLabel>
        <ul className="space-y-3">
          {ORCHESTRA.map((o) => (
            <li key={o.role}>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{o.role}</p>
              <p className="text-[13px] text-[hsl(var(--muted-foreground))] leading-snug">{o.text}</p>
            </li>
          ))}
        </ul>
      </Card>

      {/* Evolução 2026 */}
      <Card className="p-5">
        <SectionLabel>Evolução 2026 — nem todo subagent é "isolado"</SectionLabel>
        <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">
          O modelo clássico (isolado, só devolve resumo) continua sendo a base. Mas o ecossistema
          evoluiu e "subagent" deixou de ser uma categoria única:
        </p>
        <ul className="space-y-3">
          {EVOLUTION_2026.map((e) => (
            <li key={e.title} className="pl-3 border-l-2 border-[hsl(var(--border))]">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{e.title}</p>
              <p className="text-[13px] text-[hsl(var(--muted-foreground))] leading-snug">{e.text}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
