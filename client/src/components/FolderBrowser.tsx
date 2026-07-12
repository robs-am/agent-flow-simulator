import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { browseDirectory } from "@/services/api";
import { Folder, ChevronUp, Loader2 } from "lucide-react";

interface FolderBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (path: string) => void;
}

/**
 * Navegador de pastas dentro do app. NÃO é o seletor nativo do sistema
 * operacional (o navegador não deixa JS ver caminho absoluto por
 * segurança) — é um modal nosso, alimentado por GET /api/browse, que
 * lista subpastas de verdade porque quem responde é o server (que tem
 * acesso real ao filesystem), não o navegador.
 */
export default function FolderBrowser({ open, onOpenChange, onSelect }: FolderBrowserProps) {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [parent, setParent] = useState<string | null>(null);
  const [directories, setDirectories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) load(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function load(path: string | undefined) {
    setLoading(true);
    setError(null);
    try {
      const result = await browseDirectory(path);
      setCurrentPath(result.path);
      setParent(result.parent);
      setDirectories(result.directories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao abrir pasta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escolher pasta</DialogTitle>
        </DialogHeader>

        <p className="font-mono-tight text-xs text-[hsl(var(--muted-foreground))] mb-2 truncate">
          {currentPath ?? "carregando..."}
        </p>

        <div className="border border-[hsl(var(--border))] rounded-[var(--radius)] h-64 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))]">
              <Loader2 className="size-4 animate-spin" />
            </div>
          )}

          {!loading && error && (
            <p className="text-sm text-[hsl(var(--destructive))] p-3">{error}</p>
          )}

          {!loading && !error && (
            <div className="flex flex-col">
              {parent && (
                <button
                  onClick={() => load(parent)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  <ChevronUp className="size-4 text-[hsl(var(--muted-foreground))]" />
                  ..
                </button>
              )}
              {directories.length === 0 && !parent && (
                <p className="text-sm text-[hsl(var(--muted-foreground))] p-3">
                  Nenhuma subpasta aqui.
                </p>
              )}
              {directories.map((name) => (
                <button
                  key={name}
                  onClick={() => load(`${currentPath}/${name}`)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  <Folder className="size-4 text-[hsl(var(--secondary))]" />
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-3">
          <Button
            disabled={!currentPath || loading}
            onClick={() => currentPath && onSelect(currentPath)}
          >
            Selecionar esta pasta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
