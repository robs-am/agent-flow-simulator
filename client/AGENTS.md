# AGENTS.md — Regras do client

<!-- Só lido dentro de client/. Soma com o AGENTS.md da raiz. -->

## Stack

React 18 + Vite + TypeScript + Tailwind v4 + shadcn/ui (componentes
próprios em `src/components/ui/`, não uma dependência de runtime — é
assim que shadcn funciona: você copia o componente pro seu projeto).

## Direção visual

Estética de "diagrama técnico/blueprint" — grid de fundo, cantos de
anotação nos nós ativos do `FlowDiagram`, tipografia monoespaçada
(JetBrains Mono) pros labels técnicos e Space Grotesk pro resto. Cor de
"ativo" em âmbar de sinal, "visitado" em teal apagado. Ver tokens em
`src/globals.css`.

## Regras específicas

- O tipo `Step` (`src/types.ts`) é o contrato entre client e server —
  qualquer mudança no formato de resposta da API precisa atualizar esse
  tipo primeiro, não o componente
- Componentes shadcn ficam em `src/components/ui/` e não devem ser
  editados pra lógica específica do app — se precisar de uma variação,
  compor por fora, não alterar o componente base
- `ScenarioPicker.tsx` é só o casco das 3 abas — a lógica de cada uma
  vive em componente próprio (`ExamplesPanel.tsx`, `GithubForm.tsx`,
  `LocalForm.tsx`). Não engordar `ScenarioPicker.tsx` de novo; um
  componente novo por aba/formulário
- O diagrama (`FlowDiagram.tsx`) é SVG puro, sem lib de gráficos —
  cores vêm das CSS custom properties definidas em `globals.css`, nunca
  hexadecimal direto no componente
- Animação de "acender" cada nó usa CSS transition, nunca uma lib de
  animação pesada
- Todo texto explicativo que aparece na tela vem do server
  (`StepLog.tsx` só renderiza, não decide o conteúdo)
- `strict: true` no tsconfig — não desligar isso pra "resolver rápido"
  um erro de tipo

## Não coloque aqui

- Lógica de qual cenário casa com qual pedido → isso é
  `server/src/services/simulationEngine.js`
