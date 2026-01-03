import { scoreMarketSignal } from "./scoreModel";
import { explainDecisionWithAI } from "./explain";
import { enviarAlertaInversion } from "../../wpp/api/enviarAlertaInversion";

export async function runDecisionEngine(marketSnapshot: any, availableMoney: { ars: number, usd: number }) {
  console.log("Running Decision Engine for:", marketSnapshot.ticker);

  const { score, context, signal } = await scoreMarketSignal({
    ticker: marketSnapshot.ticker || "UNKNOWN",
    availableMoney: { ars: availableMoney.ars, usd: availableMoney.usd },
    signal: { type: "buy" | "sell" | "hold" ; value: number },
    marketSnapshot: marketSnapshot,
    signalText: `Market update for ${marketSnapshot.ticker}: Price ${marketSnapshot.price}, Change ${marketSnapshot.priceChange}%`,
    systemPrompt: "You are a financial analyst. Analyze the market data and news context provided. Output a single confidence score between 0.0 and 1.0 (where 1.0 is THE highest confidence both for selling,buying,and holding.) for a potential buy or sell signal. return a score for each action given. Example: BUY APPL CEDEAR 0.8 100/80USD , SELL 0.9 only 50usd OF ACTIVES"
  });

  console.log(`Score calculated: ${score}`);

  if (signal.type === "buy" && score > 0.7) {
    console.log("High score detected. Generating explanation...");

    const explanation = await explainDecisionWithAI({
      score,
      context,
      marketSnapshot,
    });

    console.log("Explanation generated:", explanation);

    await enviarAlertaInversion({
      recomendacion: "OPORTUNIDAD DETECTADA",
      activo: marketSnapshot.ticker || "ASSET",
      precio: String(marketSnapshot.price || "0"),
      detalle: explanation
    });

    return { executed: true, score, explanation };
  } else if (signal.type === "sell" && score > 0.5) {
    console.log("Medium score detected. Generating explanation...");

    const explanation = await explainDecisionWithAI({
      score,
      context,
      marketSnapshot,
    });

    console.log("Explanation generated:", explanation);

    await enviarAlertaInversion({
      recomendacion: "VENDE" + marketSnapshot.ticker,
      activo: marketSnapshot.ticker || "ASSET",
      precio: String(marketSnapshot.price || "0"),
      detalle: explanation
    });

    return { executed: true, score, explanation };
  }

  return { executed: false, score };
}

