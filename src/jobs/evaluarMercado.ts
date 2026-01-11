// src/jobs/evaluarMercado.ts
import { ejecutarEvaluacionMercado } from "../services/market.service";

async function run() {
  console.log("⏰ Cron Job: iniciando evaluación");
  await ejecutarEvaluacionMercado();
  console.log("✅ Cron Job: evaluación finalizada");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Cron Job error:", err);
  process.exit(1);
});
