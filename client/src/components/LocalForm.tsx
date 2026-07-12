import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import FolderBrowser from "@/components/FolderBrowser";
import { FolderOpen } from "lucide-react";

interface LocalFormProps {
  onRun: (path: string) => void;
  disabled: boolean;
}

export default function LocalForm({ onRun, disabled }: LocalFormProps) {
  const [path, setPath] = useState("");
  const [browserOpen, setBrowserOpen] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (path.trim()) onRun(path.trim());
  }

  function handleFolderSelected(selected: string) {
    setPath(selected);
    setBrowserOpen(false);
  }

  return (
    <div>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
        Aponte pra uma pasta na sua máquina — lida via MCP de verdade
        (o server precisa ter acesso a esse caminho localmente):
      </p>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={() => setBrowserOpen(true)} disabled={disabled}>
          <FolderOpen className="size-4 mr-1.5" />
          Escolher pasta
        </Button>
        <Input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="/caminho/completo/da/pasta"
          className="flex-1"
          disabled={disabled}
        />
        <Button type="submit" disabled={disabled || !path.trim()}>
          Analisar
        </Button>
        {disabled && <Spinner />}
      </form>

      <FolderBrowser open={browserOpen} onOpenChange={setBrowserOpen} onSelect={handleFolderSelected} />
    </div>
  );
}
