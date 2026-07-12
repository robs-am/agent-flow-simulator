import { Router } from "express";
import { analyzeGithubRepo } from "../services/githubService.js";
import { analyzeLocalProject } from "../services/mcpFilesystemService.js";

const router = Router();

// Regra do backend/AGENTS.md: rota só valida entrada e delega pro service.

router.post("/analyze/github", async (req, res, next) => {
  const { owner, repo } = req.body;
  if (!owner || !repo) {
    return res.status(400).json({ error: "owner e repo são obrigatórios" });
  }
  try {
    const steps = await analyzeGithubRepo(owner, repo);
    res.json({ matchedLabel: `${owner}/${repo}`, steps });
  } catch (err) {
    next(err);
  }
});

router.post("/analyze/local", async (req, res, next) => {
  const { path: rootPath } = req.body;
  if (!rootPath) {
    return res.status(400).json({ error: "path é obrigatório" });
  }
  try {
    const steps = await analyzeLocalProject(rootPath);
    res.json({ matchedLabel: rootPath, steps });
  } catch (err) {
    next(err);
  }
});

export default router;
