
import { scoreMarketSignal } from "./scoreModel";
import { enviarAlertaInversion } from "../../wpp/api/enviarAlertaInversion.js";

type ActionType = "BUY" | "SELL" | "HOLD";

interface ActiveSignal {
  action: ActionType;
  score: number;
  activo?: string;
  price?: number;
  analisis: string;
}

interface ExecutionResult {
  executed: boolean;
  action?: "BUY" | "SELL";
  score?: number;
  explanation?: string;
}

export async function runDecisionEngine(
  marketSnapshot: any,
  availableMoney: { ars: number; usd: number }
) {
  console.log("Running Decision Engine for:", marketSnapshot);

  const activesArray: ActiveSignal[] = await scoreMarketSignal({
    ticker: marketSnapshot.ticker || "UNKNOWN",
    availableMoney: { ars: availableMoney.ars, usd: availableMoney.usd },
    marketSnapshot,
    signalText: `Market update for ${marketSnapshot.ticker}: Price ${marketSnapshot.price}, Change ${marketSnapshot.priceChange}%`,
    systemPrompt: `Actúa como un Analista de Inversiones Cuantitativo de alto nivel. Tu tarea es procesar datos de mercado y generar una lista de acciones recomendadas con un enfoque en gestión de cartera.

CONTEXTO DE CAPITAL:

Capital Total Disponible para invertir hoy: ${availableMoney}

Perfil de Riesgo: Moderado.

Meta: Ganarle a la inflacion y al procenaje de ganancia de un plazo fijo.

REGLAS CRÍTICAS:

Tu respuesta debe ser EXCLUSIVAMENTE un array de objetos JSON. No incluyas \`\`\`json ni texto adicional.

Si no hay datos suficientes para un activo, omítelo.
Eres un cron que se ejecuta cada ciertos minutos,no es necesario invertir todo ya.

Lógica de monto_sugerido:

Si la acción es BUY: El valor debe ser el monto de capital a asignar (positivo). La suma de todos los "BUY" no debe exceder el capital total disponible.

Si la acción es SELL: El valor debe representar el monto estimado a liquidar de la posición actual (expresado como número positivo).

Si la acción es HOLD: El valor debe ser 0. Solo pueden ser HOLD los activos que se poseen.

El score debe reflejar la convicción técnica/fundamental (0.0 a 1.0).

ESTRUCTURA DEL JSON: [ { "activo": "ticker", "tipo_activo": "CEDEAR/STOCK/ETF/LETRA", "action": "BUY/SELL/HOLD", "score": 0.00, "price": 0.00, "monto_sugerido": 0.00, "analisis": "Explicación técnica breve de la decisión" } ]

DATOS DE MERCADO PARA ANALIZAR:`
  });

  const evaluacion = await evaluarActivos(activesArray);
  return evaluacion;
}

export async function evaluarActivos(
  activesArray: ActiveSignal[]
): Promise<ExecutionResult> {

  console.log("evaluaractivos");

  //  Solo lo que no sea HOLD y tenga score >= 0.5
  const best = activesArray.filter(act => act.action !== "HOLD" && act.score >= 0.5);


  for (let i = 0; i < best.length; i++) {
    const current = best[i];


    if (current.score > 0.7) {

      if (current.action === "BUY") {
        console.log("Explanation generated:", current.analisis, "COMPRA");

        await enviarAlertaInversion({
          recomendacion: "OPORTUNIDAD DETECTADA C",
          activo: current.activo ?? "?",
          precio: String(current.price ?? 0),
          detalle: current.analisis
        });
      }

      else if (current.action === "SELL") {
        console.log("llega a sell", current);

        await enviarAlertaInversion({
          recomendacion: "OPORTUNIDAD DETECTADA - V",
          activo: current.activo ?? "?",
          precio: String(current.price ?? 0),
          detalle: current.analisis
        });
      }
    }
  }
}
