import express from "express";
import simulateRouter from "./routes/simulate.js";
import analyzeRouter from "./routes/analyze.js";
import browseRouter from "./routes/browse.js";

// Carrega .env se existir (ex: GITHUB_TOKEN). Não é obrigatório —
// sem ele, o serviço do GitHub simplesmente usa o limite sem autenticação.
try {
  process.loadEnvFile();
} catch {
  // sem .env, sem problema
}

const app = express();
app.use(express.json());
app.use("/api", simulateRouter);
app.use("/api", analyzeRouter);
app.use("/api", browseRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server rodando na porta ${PORT}`));
