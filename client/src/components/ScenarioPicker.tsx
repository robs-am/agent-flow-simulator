import { useState, type FormEvent } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FolderBrowser from "@/components/FolderBrowser";
import { parseGithubUrl } from "@/lib/github";
import { Github, FolderCog, FolderOpen } from "lucide-react";

const EXAMPLES = [
  "Qual convenção de nomes usamos no projeto?",
  "Cria um componente de botão reutilizável",
  "Quantos usuários estão cadastrados no banco?",
  "Revisa esse código antes de eu commitar",
  "Cria o endpoint de login e já verifica se está seguro",
];

interface ScenarioPickerProps {
  onRunExample: (text: string) => void;
  onRunGithub: (owner: string, repo: string) => void;
  onRunLocal: (path: string) => void;
  disabled: boolean;
}

export default function ScenarioPicker({
  onRunExample,
  onRunGithub,
  onRunLocal,
  disabled,
}: ScenarioPickerProps) {
  return (
    <Tabs defaultValue="examples">
      <TabsList>
        <TabsTrigger value="examples">Exemplos</TabsTrigger>
        <TabsTrigger value="github">
          <Github className="size-3.5 mr-1.5" />
          GitHub
        </TabsTrigger>
        <TabsTrigger value="local">
          <FolderCog className="size-3.5 mr-1.5" />
          Pasta local
        </TabsTrigger>
      </TabsList>

      <TabsContent value="examples">
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
          Escolha um pedido de exemplo e veja o caminho que o agente percorreria:
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((text) => (
            <Button
              key={text}
              variant="outline"
              size="sm"
              className="rounded-full font-normal"
              onClick={() => onRunExample(text)}
              disabled={disabled}
            >
              {text}
            </Button>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="github">
        <GithubForm onRun={onRunGithub} disabled={disabled} />
      </TabsContent>

      <TabsContent value="local">
        <LocalForm onRun={onRunLocal} disabled={disabled} />
      </TabsContent>
    </Tabs>
  );
}

function GithubForm({ onRun, disabled }: { onRun: (owner: string, repo: string) => void; disabled: boolean }) {
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
      <form onSubmit={handleSubmit} className="flex gap-2">
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
      </form>
      {error && <p className="text-sm text-[hsl(var(--destructive))] mt-2">{error}</p>}
    </div>
  );
}

function LocalForm({ onRun, disabled }: { onRun: (path: string) => void; disabled: boolean }) {
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
      <form onSubmit={handleSubmit} className="flex gap-2">
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
      </form>

      <FolderBrowser open={browserOpen} onOpenChange={setBrowserOpen} onSelect={handleFolderSelected} />
    </div>
  );
}
