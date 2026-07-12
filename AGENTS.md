# AGENTS.md — Regras globais do projeto

<!-- Sempre lido, em qualquer pasta. Só entra aqui o que vale pro projeto inteiro. -->

## O que é este projeto

Agent Flow Simulator: app educacional que mostra visualmente o caminho
de decisão de um agente (AGENTS.md → Skills/MCP/Subagents), dado um
pedido de exemplo. Frontend React, server Node/Express, comunicação
via REST, tudo em memória (sem banco).

## Regras que valem pro projeto inteiro

- Nenhuma dependência de IA de verdade — a "simulação" é baseada em
  regras determinísticas (`server/src/services/simulationEngine.js`),
  não em chamadas a modelo. O objetivo é pedagógico, não funcional.
- Todo novo cenário de exemplo precisa ter uma explicação clara do
  "porquê" em cada passo — não só o "o quê"
- Nomes de variáveis e funções em inglês; comentários e textos de UI em português

## Não coloque aqui

- Cenários de exemplo específicos → `server/src/data/scenarios.js`
- Estilo visual do diagrama → `client/AGENTS.md`
