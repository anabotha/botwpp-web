import { scoreMarketSignal } from "./scoreModel";
import { explainDecisionWithAI } from "./explain";
import { enviarAlertaInversion } from "../../wpp/api/enviarAlertaInversion";
import { SignalInterface } from "./scoreModel";

export async function runDecisionEngine(marketSnapshot: any, availableMoney: { ars: number, usd: number }) {
  console.log("Running Decision Engine for:", marketSnapshot.ticker);

  const { score, context, signal } = await scoreMarketSignal({
    ticker: marketSnapshot.ticker || "UNKNOWN",
    availableMoney: { ars: availableMoney.ars, usd: availableMoney.usd },
    marketSnapshot: marketSnapshot,
    signalText: `Market update for ${marketSnapshot.ticker}: Price ${marketSnapshot.price}, Change ${marketSnapshot.priceChange}%`,
    systemPrompt: `
    Actúa como un Analista de Inversiones Cuantitativo. Tu tarea es recibir datos de mercado 
    y devolver una lista de acciones recomendadas.

REGLAS CRÍTICAS:
1. Tu respuesta debe ser EXCLUSIVAMENTE un array de objetos JSON.
2. Si no hay datos suficientes para un activo, omítelo, pero si hay datos y no estás seguro, usa ACTION: "HOLD".
3. No incluyas texto antes ni después del JSON.

ESTRUCTURA DEL JSON:
[
  {
    "activo": "ticker",
    "tipo_activo": "CEDEAR/STOCK/ETF",
    "action": "BUY/SELL/HOLD",
    "score": 0.0 a 1.0,
    "price": valor_numérico,
    "analisis": "breve explicacion"
  }
]

DATOS DE MERCADO PARA ANALIZAR:
   `
  });

  console.log(`Score calculated: ${score}`);

  if (signal === "buy" && Number(score) > 0.7) {
    console.log("High score detected. Generating explanation...");

    const explanation = await explainDecisionWithAI({
      score,
      context,
      marketSnapshot,
    });

    console.log("Explanation generated:", explanation, "compraaaa");

    // // await enviarAlertaInversion({
    // //   recomendacion: "OPORTUNIDAD DETECTADA",
    // //   activo: marketSnapshot.ticker || "ASSET",
    // //   precio: String(marketSnapshot.price || "0"),
    // //   detalle: explanation
    // });

    return { executed: true, score, explanation };
  } else if (signal === "sell" && Number(score) > 0.5) {
    console.log("Medium score detected. Generating explanation...");

    const explanation = await explainDecisionWithAI({
      score,
      context,
      marketSnapshot,
    });

    console.log("Explanation generated:", explanation, "VENDEEE");

    // await enviarAlertaInversion({
    //   recomendacion: "VENDE" + marketSnapshot.ticker,
    //   activo: marketSnapshot.ticker || "ASSET",
    //   precio: String(marketSnapshot.price || "0"),
    //   detalle: explanation
    // });

    return { executed: true, score, explanation, signal };
  } else {
    console.log("no paso nada", signal, score);
  }

  return { executed: false, score };
}

