import { evaluarMercado } from "../market/evaluarMercado.js";

export async function ejecutarEvaluacion(req, res) {
  const auth = req.headers.authorization;

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await evaluarMercado();
    return res.json({ ok: true });
  } catch (error) {
    console.error("Error cron:", error);
    return res.status(500).json({ error: "Cron failed" });
  }
}
