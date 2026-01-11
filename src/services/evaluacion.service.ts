// src/services/evaluacion.service.ts
export async function ejecutarEvaluacionCore() {
  console.log("⚙️ Ejecutando evaluación de mercado");

  const resultado = await ejecutarEvaluacionMercado();

  console.log("✅ Evaluación finalizada");
  return resultado;
}
