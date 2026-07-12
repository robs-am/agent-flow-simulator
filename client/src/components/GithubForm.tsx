import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { parseGithubUrl } from "@/lib/github";

interface GithubFormProps {
  onRun: (owner: string, repo: string) => void;
  disabled: boolean;
}

export default function GithubForm({ onRun, disabled }: GithubFormProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = parseGithubUrl(value);
    if (!parsed) {
      setError('Não reconheci esse formato. Cole a URL do repo (ex: github.com/anthropics/claude-code) ou só "dono/repo".');
      return;
    }
    setError(null);
    onRun(parsed.owner, parsed.repo);
  }

  return (
    <div>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
        Cole a URL de qualquer repositório público — busca via API REST do GitHub direto:
      </p>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="github.com/anthropics/claude-code"
          className="flex-1"
          disabled={disabled}
        />
        <Button type="submit" disabled={disabled || !value.trim()}>
          Analisar
        </Button>
        {disabled && <Spinner />}
      </form>
      {error && <p className="text-sm text-[hsl(var(--destructive))] mt-2">{error}</p>}
    </div>
  );
}
