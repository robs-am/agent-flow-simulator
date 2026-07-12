import { Loader2 } from "lucide-react";

/**
 * Spinner de carregamento genérico, na cor de sinal (--primary). Usado
 * ao lado dos botões "Analisar" enquanto uma requisição está em andamento.
 */
export function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[hsl(var(--primary))] text-sm font-mono-tight">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </span>
  );
}
