import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const EXAMPLES = [
  "Qual convenção de nomes usamos no projeto?",
  "Cria um componente de botão reutilizável",
  "Quantos usuários estão cadastrados no banco?",
  "Revisa esse código antes de eu commitar",
  "Cria o endpoint de login e já verifica se está seguro",
];

interface ExamplesPanelProps {
  onRun: (text: string) => void;
  onRunAI: (text: string) => void;
  disabled: boolean;
}

export default function ExamplesPanel({ onRun, onRunAI, disabled }: Readonly<ExamplesPanelProps>) {
  const [text, setText] = useState("");
  const trimmed = text.trim();

  function submitAI() {
    if (trimmed && !disabled) onRunAI(trimmed);
  }

  return (
    <div>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
        Escreva qualquer ação e a IA descobre o fluxo que o agente percorreria:
      </p>
      <form
        className="flex items-center gap-2 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          submitAI();
        }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          placeholder="Ex: manda um resumo do deploy no Slack"
          className="flex-1 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50"
        />
        <Button type="submit" size="sm" disabled={disabled || !trimmed}>
          <Sparkles className="size-3.5 mr-1.5" />
          Analisar
        </Button>
      </form>

      {/* Exemplos prontos → motor determinístico (rápido, sem custo).
          value="" fixo + placeholder desabilitado: o select sempre volta pro
          placeholder, então dá pra escolher o mesmo exemplo de novo. */}
      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
        Ou escolha um pedido de exemplo:
      </p>
      <div className="flex items-center gap-2">
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) onRun(e.target.value);
          }}
          disabled={disabled}
          className="flex-1 h-[38px] rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50"
        >
          <option value="" disabled>
            Selecione…
          </option>
          {EXAMPLES.map((example) => (
            <option key={example} value={example}>
              {example}
            </option>
          ))}
        </select>
        {/* Espaçador invisível do tamanho do botão Analisar, pro select
            alinhar com o input de cima (mesmo flex-1). */}
        <Button type="button" size="sm" aria-hidden tabIndex={-1} className="invisible">
          <Sparkles className="size-3.5 mr-1.5" />
          Analisar
        </Button>
      </div>
    </div>
  );
}
