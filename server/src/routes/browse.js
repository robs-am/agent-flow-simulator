import { Router } from "express";
import { browseDirectory } from "../services/browseService.js";

const router = Router();

router.get("/browse", async (req, res, next) => {
  try {
    const result = await browseDirectory(req.query.path);
    res.json(result);
  } catch (err) {
    // Erro de path inválido é do usuário, não do servidor — 400, não 500
    res.status(400).json({ error: err.message });
  }
});

export default router;
