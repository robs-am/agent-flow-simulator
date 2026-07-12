import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const EXAMPLES = [
  "Qual convenção de nomes usamos no projeto?",
  "Cria um componente de botão reutilizável",
  "Quantos usuários estão cadastrados no banco?",
  "Revisa esse código antes de eu commitar",
  "Cria o endpoint de login e já verifica se está seguro",
];

interface ExamplesPanelProps {
  onRun: (text: string) => void;
  disabled: boolean;
}

export default function ExamplesPanel({ onRun, disabled }: ExamplesPanelProps) {
  return (
    <div>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
        Escolha um pedido de exemplo e veja o caminho que o agente percorreria:
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {EXAMPLES.map((text) => (
          <Button
            key={text}
            variant="outline"
            size="sm"
            className="rounded-full font-normal"
            onClick={() => onRun(text)}
            disabled={disabled}
          >
            {text}
          </Button>
        ))}
        {disabled && <Spinner />}
      </div>
    </div>
  );
}
