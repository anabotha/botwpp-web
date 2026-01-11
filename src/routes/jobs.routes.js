// src/routes/jobs.routes.js
import { Router } from "express";
import { ejecutarEvaluacion } from "../controllers/jobs.controller.js";

const router = Router();

// // Ruta para ejecutar evaluación (usada por Render cron)
router.get("/jobs/evaluar", async (req, res) => {
  console.log('🔄 Ejecutando evaluación programada desde Render cron...');
  try {
    await ejecutarEvaluacion();
    res.status(200).json({ 
      success: true, 
      message: '✅ Evaluación completada' 
    });
  } catch (error) {
    console.error('❌ Error en evaluación:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Ruta alternativa POST
router.post("/jobs/evaluar", ejecutarEvaluacion);

export default router;

// // src/jobs/evaluarMercado.ts
// import { ejecutarEvaluacion } from "../controllers/jobs.controller.js";

// async function run() {
//   await ejecutarEvaluacion();
//   process.exit(0);
// }

// run().catch(err => {
//   console.error(err);
//   process.exit(1);
// });
