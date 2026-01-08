import { ejecutarEvaluacionMercado } from "../services/market.service";
import { Request, Response } from 'express';


// export async function ejecutarEvaluacion(req: Request, res: Response) {
//   const secret = req.header("x-cron-secret");

//   if (secret !== process.env.CRON_SECRET) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

// try {
//     // await ejecutarEvaluacionMercado();
//     console.log("llego aca al try");

//     const resultado = await ejecutarEvaluacionMercado();

//     console.log("Cron ejecutado con éxito");
//     return res.json({
//       ok: true,
//       message: "Evaluación completada",
//       data: resultado // Opcional: para debug
//     });
//   } catch (error: any) {
//     console.error("Error en el proceso de Cron:", error.message, error);
//     return res.status(500).json({ error: "Cron failed", detail: error.message });
//   }
// }
export async function ejecutarEvaluacion(req: Request, res: Response) {
  const secret = req.header("x-cron-secret");

  if (!secret || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log("Cron OK, iniciando evaluación");

    await ejecutarEvaluacionMercado();

    return res.json({ ok: true });
  } catch (error: any) {
    console.error("Error en el proceso de Cron:", error);
    return res.status(500).json({ ok: false });
  }
}

