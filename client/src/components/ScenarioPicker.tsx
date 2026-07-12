import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ExamplesPanel from "@/components/ExamplesPanel";
import GithubForm from "@/components/GithubForm";
import LocalForm from "@/components/LocalForm";
import { Github, FolderCog } from "lucide-react";

interface ScenarioPickerProps {
  onRunExample: (text: string) => void;
  onRunGithub: (owner: string, repo: string) => void;
  onRunLocal: (path: string) => void;
  disabled: boolean;
}

/**
 * Casco das 3 abas (Exemplos / GitHub / Pasta local). A lógica de cada
 * aba vive no próprio componente dela — este arquivo só monta o Tabs.
 */
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
        <ExamplesPanel onRun={onRunExample} disabled={disabled} />
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
