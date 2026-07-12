import { Router } from "express";
import { simulate, listScenarios } from "../services/simulationEngine.js";
import { classifyRequestAI } from "../services/aiClassifierService.js";

const router = Router();

// Regra do backend/AGENTS.md: rota só valida entrada e delega pro service.

router.get("/scenarios", (req, res) => {
  res.json(listScenarios());
});

// Modo demo: casamento determinístico por keywords (motor puro).
router.post("/simulate", (req, res) => {
  const { request } = req.body;

  if (!request || typeof request !== "string" || !request.trim()) {
    return res.status(400).json({ error: "request é obrigatório" });
  }

  const result = simulate(request.trim());
  res.json(result);
});

// Modo IA: texto livre classificado pelo Claude (service com efeito colateral,
// separado do motor puro — ver aiClassifierService.js).
router.post("/simulate/ai", async (req, res, next) => {
  const { request } = req.body;

  if (!request || typeof request !== "string" || !request.trim()) {
    return res.status(400).json({ error: "request é obrigatório" });
  }

  try {
    const steps = await classifyRequestAI(request.trim());
    res.json({ matchedLabel: request.trim(), steps });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    next(err);
  }
});

export default router;
