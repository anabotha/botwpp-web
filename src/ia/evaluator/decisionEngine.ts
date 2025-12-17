import { scoreMarketSignal } from "./scoreModel";
import { explainDecisionWithAI } from "./explain";
import { enviarAlertaInversion } from "../../wpp/api/enviarAlertaInversion";

export async function runDecisionEngine(marketSnapshot: any) {
  console.log("Running Decision Engine for:", marketSnapshot.ticker);

  const { score, context } = await scoreMarketSignal({
    ticker: marketSnapshot.ticker || "UNKNOWN",
    marketSnapshot: marketSnapshot,
    signalText: `Market update for ${marketSnapshot.ticker}: Price ${marketSnapshot.price}, Change ${marketSnapshot.priceChange}%`
  });

  console.log(`Score calculated: ${score}`);

  if (score > 0.7) {
    console.log("High score detected. Generating explanation...");

    const explanation = await explainDecisionWithAI({
      score,
      context,
      marketSnapshot
    });

    console.log("Explanation generated:", explanation);

    await enviarAlertaInversion({
      recomendacion: "OPORTUNIDAD DETECTADA",
      activo: marketSnapshot.ticker || "ASSET",
      precio: String(marketSnapshot.price || "0"),
      detalle: explanation
    });

    return { executed: true, score, explanation };
  }

  return { executed: false, score };
}

