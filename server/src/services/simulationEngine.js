import { scenarios, findScenario } from "../data/scenarios.js";

// Regra do backend/AGENTS.md: função pura, sem efeito colateral —
// mesma entrada, mesma saída sempre. É uma SIMULAÇÃO de decisão,
// não uma decisão real de IA.

export function simulate(requestText) {
  const scenario = findScenario(requestText);
  return {
    matchedLabel: scenario.label ?? requestText,
    steps: scenario.steps,
  };
}

export function listScenarios() {
  return scenarios
    .filter((s) => s.id !== "fallback")
    .map((s) => ({ id: s.id, label: s.label }));
}
