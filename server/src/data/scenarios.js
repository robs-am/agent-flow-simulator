// Cada cenário representa um pedido de exemplo e o caminho que um agente
// real percorreria pra atendê-lo. "node" é um dos: agents-md, skills,
// mcp, subagents — usados pelo frontend pra saber qual nó acender.
//
// Regra do backend/AGENTS.md: todo cenário precisa ter steps com
// node, title e explanation.

export const scenarios = [
  {
    id: "convencao-nomes",
    label: "Qual convenção de nomes usamos no projeto?",
    keywords: ["convenção", "convencao", "nome", "padrão", "padrao", "estilo"],
    steps: [
      {
        node: "agents-md",
        title: "Consulta o AGENTS.md",
        explanation:
          "A pergunta é sobre uma regra fixa do projeto — exatamente o tipo de coisa que já está sempre carregada, sem precisar buscar em lugar nenhum.",
      },
      {
        node: "agent",
        title: "Responde direto",
        explanation:
          "Como a resposta já estava no contexto sempre presente, o agente responde sem acionar skill, MCP ou subagent — o caminho mais curto possível.",
      },
    ],
  },
  {
    id: "criar-componente",
    label: "Cria um componente de botão reutilizável",
    keywords: ["componente", "botão", "botao", "criar componente"],
    steps: [
      {
        node: "agents-md",
        title: "Consulta o AGENTS.md",
        explanation:
          "Primeiro checa as regras do frontend: onde os componentes ficam, como nomear, se usa CSS Modules.",
      },
      {
        node: "skills",
        title: "Aciona a skill /create-component",
        explanation:
          "Criar um componente é um procedimento conhecido e repetível — exatamente o tipo de tarefa que uma skill resolve, em vez do agente reinventar os passos toda vez.",
      },
      {
        node: "agent",
        title: "Entrega o resultado",
        explanation:
          "A skill executa os passos (criar arquivo, CSS, teste) e o agente mostra o resultado final.",
      },
    ],
  },
  {
    id: "quantos-usuarios",
    label: "Quantos usuários estão cadastrados no banco?",
    keywords: ["usuários", "usuarios", "banco", "quantos", "cadastrados"],
    steps: [
      {
        node: "agents-md",
        title: "Consulta o AGENTS.md",
        explanation:
          "Checa as regras do backend antes de qualquer ação — por exemplo, que toda query precisa ser parametrizada.",
      },
      {
        node: "mcp",
        title: "Conecta via MCP (postgres)",
        explanation:
          "A resposta não está em nenhum arquivo do projeto — é um dado que só existe no banco de verdade, fora do código. Isso é exatamente o que o MCP resolve: buscar algo externo.",
      },
      {
        node: "agent",
        title: "Reporta o número",
        explanation:
          "O agente traduz o resultado da query numa resposta direta pro usuário.",
      },
    ],
  },
  {
    id: "revisar-antes-commit",
    label: "Revisa esse código antes de eu commitar",
    keywords: ["revisa", "revisar", "commit", "antes de commitar", "review"],
    steps: [
      {
        node: "agents-md",
        title: "Consulta o AGENTS.md",
        explanation:
          "Sabe que todo commit precisa passar por revisão antes — regra do projeto inteiro.",
      },
      {
        node: "subagents",
        title: "Delega pro subagent code-reviewer",
        explanation:
          "Revisão de código é uma tarefa focada e isolada — o subagent analisa o diff sozinho, com seu próprio escopo, e devolve só um resumo priorizado, sem poluir o contexto principal com o processo inteiro.",
      },
      {
        node: "agent",
        title: "Mostra o resumo da revisão",
        explanation:
          "O agente principal recebe só a lista de achados do subagent, não o raciocínio passo a passo — é assim que o contexto principal fica limpo.",
      },
    ],
  },
  {
    id: "endpoint-login-seguro",
    label: "Cria o endpoint de login e já verifica se está seguro",
    keywords: ["login", "endpoint", "seguro", "segurança", "seguranca", "autenticação", "autenticacao"],
    steps: [
      {
        node: "agents-md",
        title: "Consulta o AGENTS.md",
        explanation:
          "Checa as regras do backend: rota nunca acessa banco direto, erros não vazam detalhe interno.",
      },
      {
        node: "skills",
        title: "Aciona a skill /create-endpoint",
        explanation:
          "Criar um endpoint é um procedimento já conhecido pelo projeto — rota, service, testes.",
      },
      {
        node: "subagents",
        title: "Delega pro subagent security-reviewer",
        explanation:
          "'Já verifica se está seguro' é um pedido explícito de revisão de segurança — escopo isolado o suficiente pra justificar um subagent dedicado, em vez do agente principal tentar fazer as duas coisas ao mesmo tempo.",
      },
      {
        node: "agent",
        title: "Entrega endpoint + relatório de segurança",
        explanation:
          "O agente principal combina o resultado da skill com o resumo do subagent numa resposta só.",
      },
    ],
  },
  {
    id: "fallback",
    label: null,
    keywords: [],
    steps: [
      {
        node: "agents-md",
        title: "Consulta o AGENTS.md",
        explanation:
          "Sem um padrão reconhecido no pedido, o agente sempre começa pelo que já tem carregado — o AGENTS.md — antes de decidir se precisa buscar mais alguma coisa.",
      },
      {
        node: "agent",
        title: "Pede mais contexto",
        explanation:
          "Sem informação suficiente pra saber se precisa de uma skill, MCP ou subagent, o caminho mais honesto é perguntar de volta em vez de adivinhar.",
      },
    ],
  },
];

export function findScenario(text) {
  const normalized = text.toLowerCase();
  const match = scenarios
    .filter((s) => s.id !== "fallback")
    .find((s) => s.keywords.some((k) => normalized.includes(k)));
  return match || scenarios.find((s) => s.id === "fallback");
}
