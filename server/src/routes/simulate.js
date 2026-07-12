import { Router } from "express";
import { simulate, listScenarios } from "../services/simulationEngine.js";

const router = Router();

// Regra do backend/AGENTS.md: rota só valida entrada e delega pro service.

router.get("/scenarios", (req, res) => {
  res.json(listScenarios());
});

router.post("/simulate", (req, res) => {
  const { request } = req.body;

  if (!request || typeof request !== "string" || !request.trim()) {
    return res.status(400).json({ error: "request é obrigatório" });
  }

  const result = simulate(request.trim());
  res.json(result);
});

export default router;
