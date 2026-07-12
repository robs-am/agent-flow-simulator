// Conteúdo do Guia — a "enciclopédia" que explica cada componente da
// arquitetura de contexto (AGENTS.md, Skills, MCP, Subagents) e como o
// agente principal decide o que consultar. Baseado no material de
// referência do projeto ("Arquitetura de Contexto: Cursor / Claude Code").
//
// Mantido como dado (não JSX) pra ficar no mesmo padrão data-driven do
// resto do repo (ver server/src/data/scenarios.js) e pra o GuideView só
// renderizar. O `id` bate com NodeId, então dá pra cruzar com o diagrama.

import type { NodeId } from "../types";

export interface ComponentGuide {
  id: NodeId;
  emoji: string;
  accent: string;
  name: string;
  tagline: string;
  state: string;
  whatIs: string;
  whenEnters: string;
  examples: string[];
  dontPut: string;
  thinkOf: string;
}

export const COMPONENTS: ComponentGuide[] = [
  {
    id: "agents-md",
    emoji: "🟠",
    accent: "28 82% 52%",
    name: "AGENTS.MD",
    tagline: "Quem você é",
    state: "SEMPRE presente",
    whatIs:
      "Contexto permanente de identidade e regras do projeto — convenções, arquitetura, o que é obrigatório desde o início. É o \"manual de integração de funcionário\" do agente.",
    whenEnters:
      "SEMPRE presente — é barato e atemporal, então fica carregado o tempo todo, não só quando pedido.",
    examples: [
      "Always use TypeScript strict mode",
      "Follow clean architecture — API calls through services layer",
      "Never use the any type",
    ],
    dontPut:
      "Procedimentos de tarefa específica (isso é Skill) ou conexões com ferramentas externas (isso é MCP).",
    thinkOf: "\"Employee handbook\" — o que TODO agente deve saber desde o início.",
  },
  {
    id: "skills",
    emoji: "🟣",
    accent: "270 60% 55%",
    name: "SKILLS",
    tagline: "O que você pode fazer",
    state: "SOB DEMANDA",
    whatIs:
      "Workflows e procedimentos para situações específicas — como executar uma tarefa passo a passo. Geralmente invocado via /comando.",
    whenEnters: "SOB DEMANDA — só carrega quando a tarefa bate com aquele procedimento específico.",
    examples: [
      "/deploy → Run tests → Build → Deploy to prod",
      "/debug-api → Check logs → Test endpoint → Fix issue",
      "/create-component → Boilerplate → Props → Tests → Export",
    ],
    dontPut: "Regras permanentes tipo \"Always use X\" ou regras de estilo — isso é AGENTS.MD.",
    thinkOf: "\"Onboarding procedures\" — como executar tarefas específicas, quando necessário.",
  },
  {
    id: "mcp",
    emoji: "🔵",
    accent: "214 80% 55%",
    name: "MCP",
    tagline: "O que você pode acessar",
    state: "QUANDO CONECTA",
    whatIs:
      "Conexões com ferramentas externas — APIs, bancos de dados, serviços como Google Drive, Slack, GitHub. Acesso a recursos fora do código.",
    whenEnters:
      "QUANDO CONECTA — sob demanda, só quando a tarefa precisa buscar algo que não está no repositório.",
    examples: [
      "Google Drive MCP → acessa/edita arquivos no Drive",
      "PostgreSQL MCP → query no banco, roda migrations",
      "Slack MCP → envia mensagens, lê canais",
    ],
    dontPut:
      "Regras de código (AGENTS.MD) ou workflows internos (Skills) — coisas que não precisam de API externa.",
    thinkOf: "\"IT infrastructure\" — ferramentas e serviços externos, quando precisa acessar.",
  },
  {
    id: "subagents",
    emoji: "🔴",
    accent: "0 72% 51%",
    name: "SUBAGENTS",
    tagline: "Agentes especializados",
    state: "SOB DELEGAÇÃO",
    whatIs:
      "Agentes filhos, cada um com contexto isolado e possivelmente modelo diferente, focados em uma tarefa específica (ex: debugging, arquitetura).",
    whenEnters:
      "O agente principal delega a tarefa e recebe de volta só um resumo — os subagentes não conversam entre si.",
    examples: [
      "Refatoração grande → subagente analisa riscos de performance e devolve só um resumo",
      "Contexto isolado → não polui o raciocínio do agente principal",
      "Modelo próprio → pode rodar num modelo diferente do principal",
    ],
    dontPut:
      "Tarefas triviais que o agente principal resolve direto — delegar tem custo de coordenação.",
    thinkOf: "\"Naipes da orquestra\" — cada seção ensaia isolada e entrega só o resultado.",
  },
];

// O agente principal — o núcleo do diagrama. Não é um dos "4 ao redor",
// é quem orquestra todos eles, então tem entrada própria pro painel do guia.
export const AGENT: ComponentGuide = {
  id: "agent",
  emoji: "🎼",
  accent: "194 45% 38%",
  name: "AGENTE PRINCIPAL",
  tagline: "O orquestrador",
  state: "SEMPRE ATIVO",
  whatIs:
    "Recebe sua instrução e decide, na hora, o que precisa consultar pra responder bem. Como um gerente de projeto: não faz tudo sozinho, mas sabe exatamente a quem delegar cada parte.",
  whenEnters: "É o ponto de entrada de toda interação — orquestra os outros componentes.",
  examples: [
    "Lê AGENTS.md antes de tudo",
    "Escolhe uma Skill quando reconhece o procedimento",
    "Aciona MCP quando precisa de dado externo",
    "Delega a um Subagent trabalho especializado e isolado",
  ],
  dontPut: "Ele não guarda regras nem procedimentos — isso vive nos componentes ao redor.",
  thinkOf: "\"O maestro\" — rege, decide o tempo e indica quem entra em cada momento.",
};

// Lookup por nó (inclui o agente) e a ordem de navegação no guia.
export const GUIDE_BY_NODE: Record<NodeId, ComponentGuide> = Object.fromEntries(
  [AGENT, ...COMPONENTS].map((c) => [c.id, c])
) as Record<NodeId, ComponentGuide>;

export const GUIDE_ORDER: NodeId[] = ["agent", "agents-md", "skills", "mcp", "subagents"];

// O teste rápido de decisão — qual componente usar.
export const QUICK_TEST: { question: string; answer: string }[] = [
  { question: "Isso é sempre verdade, desde o início do projeto?", answer: "AGENTS.MD" },
  { question: "Isso é um procedimento pra uma tarefa específica?", answer: "SKILLS" },
  { question: "Isso exige sair do código pra buscar algo externo?", answer: "MCP" },
  { question: "Isso é trabalho especializado e isolado?", answer: "SUBAGENTS" },
];

// A analogia da orquestra — cada linha conecta um componente ao papel dele.
export const ORCHESTRA: { role: string; text: string }[] = [
  {
    role: "Agente principal = o maestro",
    text: "Não toca nenhum instrumento — rege, decide o tempo e indica quem entra em cada momento.",
  },
  {
    role: "AGENTS.MD = a partitura geral",
    text: "Sempre na estante do maestro. A interpretação e as marcações que valem a peça inteira, do início ao fim.",
  },
  {
    role: "SKILLS = trechos técnicos da partitura",
    text: "O maestro só abre aquela página quando a orquestra chega numa passagem que exige execução particular.",
  },
  {
    role: "MCP = a equipe fora do palco",
    text: "Luz, som, transmissão ao vivo — só aciona quando precisa de algo que não está nas mãos dos músicos.",
  },
  {
    role: "SUBAGENTS = os naipes especializados",
    text: "Cada naipe ensaia isolado na própria seção e devolve ao maestro só o resultado, não o ensaio inteiro.",
  },
];

// Evolução 2026 — nem todo subagent é mais "isolado".
export const EVOLUTION_2026: { title: string; text: string }[] = [
  {
    title: "Agent Teams (experimental)",
    text: "Em vez de isolados, os \"teammates\" compartilham lista de tarefas e trocam mensagens direto entre si — coordenando em tempo real em vez de só reportar pro principal.",
  },
  {
    title: "Nested subagents",
    text: "Um subagent pode spawnar seus próprios filhos, até 3 níveis de profundidade.",
  },
  {
    title: "Memória persistente",
    text: "Subagents agora podem ter um arquivo próprio de memória que sobrevive entre sessões — antes, cada execução começava do zero.",
  },
];
