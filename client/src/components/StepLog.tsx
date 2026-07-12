import type { Step } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StepLogProps {
  steps: Step[];
  revealedCount: number;
}

export default function StepLog({ steps, revealedCount }: StepLogProps) {
  if (!steps.length) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))] font-mono-tight">
        Rode um exemplo pra ver os passos aqui.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {steps.slice(0, revealedCount).map((step, i) => (
        <Card
          key={i}
          className="animate-[fd-fade-in_0.4s_ease_forwards] opacity-0"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <CardContent className="p-3 flex gap-3 items-start">
            <Badge variant="outline" className="mt-0.5 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </Badge>
            <div className="min-w-0">
              <p className="font-semibold text-sm">{step.title}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5 whitespace-pre-line font-mono-tight">
                {step.explanation}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
