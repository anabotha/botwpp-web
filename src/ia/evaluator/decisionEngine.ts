
import { scoreMarketSignal } from "./scoreModel";
import { enviarAlertaInversion } from "../../wpp/api/enviarAlertaInversion.js";

type ActionType = "BUY" | "SELL" | "HOLD";

interface ActiveSignal {
  action: ActionType;
  score: number;
  activo?: string;
  tipo_activo:string;
  price?: number;
  analisis: string;
  mercado:string;
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

Meta: 12% de rendimiento semanal ideas. 2% de ganancia por dia minimo.

REGLAS CRÍTICAS:

Tu respuesta debe ser EXCLUSIVAMENTE un array de objetos JSON. No incluyas \`\`\`json ni texto adicional.

Si no hay datos suficientes para un activo, omítelo.
Eres un cron que se ejecuta cada ciertos minutos,no es necesario invertir todo ya.
Se te va a dar contexto historico de ciertos activos ademas de embeddings con informacion historica. 
Podes recomendar activos que no se encuentren el listado solo si hay una confianza del 90% de que es una buena decision.
Lógica de monto_sugerido:

Si la acción es BUY: El valor debe ser el monto de capital a asignar (positivo). La suma de todos los "BUY" no debe exceder el capital total disponible.

Si la acción es SELL: El valor debe representar el monto estimado a liquidar de la posición actual (expresado como número positivo).

Si la acción es HOLD: El valor debe ser 0. Solo pueden ser HOLD los activos que se poseen.

El score debe reflejar la convicción técnica/fundamental (0.0 a 1.0).

Logica mercado:  Si pertenece al mercado argentino o estadounidense. Donde se deberia comprar p.ej : IOL, TD,NASDAQ.

ESTRUCTURA DEL JSON: [ { "activo": "ticker", "tipo_activo": "CEDEAR/STOCK/ETF/LETRA/BONO", "action": "BUY/SELL/HOLD", "score": 0.00, "price": 0.00, "monto_sugerido": 0.00, "analisis": "Explicación técnica breve de la decisión","mercado":"IOL" } ]

DATOS DE MERCADO PARA ANALIZAR:`
  });

  const evaluacion = await evaluarActivos(activesArray);
  return evaluacion;
}

export async function evaluarActivos(
  activesArray: ActiveSignal[]
): Promise<ExecutionResult> {

  console.log("evaluaractivos");

  //  Solo lo que no sea HOLD o tenga score >= 0.5
  const best = activesArray.filter(act => act.action !== "HOLD" && act.score >= 0.5).
  sort((a, b) => b.score - a.score).slice(0, 5);


  for (let i = 0; i < best.length; i++) {
    const current = best[i];


    if (current.score > 0.7) {

      if (current.action === "BUY") {
        console.log("Explanation generated:", current.analisis, "COMPRA");

        await enviarAlertaInversion({
          recomendacion: "OPORTUNIDAD DETECTADA COMPRA",
          activo: current.activo ?? "?",
          tipo_activo:current.tipo_activo,
          precio: String(current.price ?? 0),
          detalle: current.analisis,
          mercado:current.mercado
        });
      }

      else if (current.action === "SELL") {
        console.log("llega a sell", current);

        await enviarAlertaInversion({
          recomendacion: "OPORTUNIDAD DETECTADA - VENTA",
          activo: current.activo ?? "?",
          tipo_activo:current.tipo_activo,
          precio: String(current.price ?? 0),
          detalle: current.analisis,
          mercado:current.mercado

        });
      }
    }
  }
}
