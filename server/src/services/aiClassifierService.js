// Classificador por IA: dado um texto livre (uma ação que o usuário pediria
// a um agente), chama o Claude pra decidir QUAL fluxo da arquitetura de
// contexto aquela ação percorreria, devolvendo steps no mesmo formato do
// resto do app ({ node, title, explanation }).
//
// IMPORTANTE (backend/AGENTS.md): o simulationEngine.js é PURO — mesma
// entrada, mesma saída. Este service é a exceção deliberada: fala com a API
// do Claude e tem efeito colateral (chamada de rede). Por isso vive num
// arquivo separado, com rota própria (/simulate/ai), e o motor determinístico
// dos exemplos continua intocado.

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-haiku-4-5";

const SYSTEM_PROMPT = `Você é um classificador didático do "Agent Flow Simulator". Dada uma AÇÃO que alguém pediria a um agente de IA (tipo Claude Code), você decide o CAMINHO que o agente percorreria pela arquitetura de contexto e devolve os passos.

A arquitetura tem 5 nós:
- "agents-md": regras e identidade do projeto, SEMPRE carregadas. O agente quase sempre começa consultando aqui.
- "skills": workflows/procedimentos conhecidos, acionados sob demanda (ex: /deploy, /create-component). Use quando a ação é um procedimento repetível.
- "mcp": conexões com ferramentas externas VIA um servidor MCP dedicado (ex: Postgres, Google Drive, Slack, GitHub — tecnologias com MCP consolidado). NEM TODA tecnologia tem MCP: muita integração (ex: um CMS como Strapi via REST/SDK, uma API própria) é feita direto no código, sem MCP nenhum. Só use este nó quando é plausível existir um MCP pra aquele recurso; se a integração seria via código, NÃO use "mcp" — trate como parte da implementação da skill/agent e diga isso na explicação.
- "subagents": agentes especializados e isolados que recebem uma tarefa focada e devolvem só um resumo (ex: revisão de código, análise de segurança ou performance). Use quando há trabalho especializado que vale a pena isolar.
- "agent": o agente principal (orquestrador). Termine SEMPRE com um passo "agent" que entrega o resultado ou pede mais contexto.

Regras:
- O primeiro passo normalmente é "agents-md" (consultar as regras fixas), a menos que seja claramente desnecessário.
- Acione "skills", "mcp" e "subagents" apenas quando a ação realmente pedir — não force os três.
- Se a ação for vaga demais, faça um caminho curto: "agents-md" e depois "agent" pedindo mais contexto.
- Cada passo tem um "title" curto (no máximo ~50 caracteres) e uma "explanation" de 1 a 2 frases explicando POR QUE aquele nó entra.
- Escreva em português do Brasil, com tom didático, no mesmo estilo de um material que ensina a arquitetura.
- Devolva de 2 a 5 passos, na ordem em que aconteceriam.

SEJA ESPECÍFICO E CONCRETO, como um passo a passo — nunca genérico. Ancore cada passo nos detalhes REAIS do pedido:
- Cite pelo nome as tecnologias, ferramentas e serviços que a pessoa mencionou.
- A "explanation" deve dizer O QUE o agente FAZ naquele passo, de forma acionável (as ações concretas), não só o conceito abstrato. Pense "passo a passo de execução".
- Fale de ESTRUTURA DE PASTAS quando fizer sentido: onde os arquivos entram/são criados seguindo convenções típicas (ex: "cria os componentes em src/components/ e a página em src/pages/", "o service da integração vai em src/services/"). Não invente caminhos que contrariem o pedido.
- Ao acionar uma skill, nomeie um /comando plausível e concreto (ex: /create-landing-page, /deploy-vercel).
- Ao delegar a um subagent, diga qual especialista e o que ele revisa naquele caso (ex: "subagent de acessibilidade audita o formulário: contraste, labels, ARIA").
- SOBRE MCP: avalie honestamente se existiria um MCP pra aquela tecnologia. Se a integração seria feita via REST/SDK no código (comum em CMS, APIs próprias), NÃO gere um passo "mcp" — em vez disso, deixe a integração dentro do passo da skill/agent e explique que é feita via código, não via MCP.
- No "title", prefira verbo + alvo concreto ("Criar página em src/pages/") em vez de rótulo genérico ("Criar estrutura").
- Se o pedido não menciona tecnologia específica, tudo bem ser mais geral — mas nunca invente detalhes que a pessoa não deu.`;

// Schema de saída estruturada — garante que o node é sempre um dos válidos e
// que o formato bate com o que o frontend espera.
const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          node: {
            type: "string",
            enum: ["agents-md", "skills", "mcp", "subagents", "agent"],
          },
          title: { type: "string" },
          explanation: { type: "string" },
        },
        required: ["node", "title", "explanation"],
        additionalProperties: false,
      },
    },
  },
  required: ["steps"],
  additionalProperties: false,
};

export async function classifyRequestAI(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    const err = new Error(
      "ANTHROPIC_API_KEY não configurada no servidor — defina no .env pra usar a análise por IA."
    );
    err.statusCode = 503;
    throw err;
  }

  const client = new Anthropic();

  // Structured outputs é beta: vive em client.beta.messages, usa o campo
  // output_format e exige o header beta abaixo. Garante que o node sempre
  // seja um dos válidos e que o JSON bata com OUTPUT_SCHEMA.
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: request }],
    output_format: { type: "json_schema", schema: OUTPUT_SCHEMA },
    betas: ["structured-outputs-2025-11-13"],
  });

  if (response.stop_reason === "refusal") {
    const err = new Error("O classificador de segurança recusou esse pedido.");
    err.statusCode = 422;
    throw err;
  }

  const text = response.content.find((b) => b.type === "text")?.text ?? "";
  const parsed = JSON.parse(text);
  return parsed.steps;
}
