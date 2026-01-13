
import { scoreMarketSignal } from "./scoreModel.js";
import { enviarAlertaInversion } from "../../wpp/api/enviarAlertaInversion.js";

type ActionType = "BUY" | "SELL" | "HOLD";

interface ActiveSignal {
  action: ActionType;
  score: number;
  activo?: string;
  tipo_activo:string;
  price?: number;
  monto_sugerido:number;
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
  availableMoney: { ars: number; usd: number },
  recentRecommendations?: any[]
) {
  console.log("Running Decision Engine for:", marketSnapshot);

  const activesArray: ActiveSignal[] = await scoreMarketSignal({
    availableMoney: { ars: availableMoney.ars, usd: availableMoney.usd },
    marketSnapshot,
    signalText: `market snapshot`,
    systemPrompt: `Actúa como un Analista de Inversiones Cuantitativo profesional, especializado en gestión de cartera de corto plazo (swing / intraday).
Tu tarea es analizar datos de mercado, contexto histórico y noticias financieras relevantes para generar recomendaciones accionables, priorizando control de riesgo, consistencia y uso eficiente del capital.

Eres un proceso automático (cron) que se ejecuta periódicamente.
COMPORTAMIENTO SEGÚN FRANJA HORARIA (INTRADÍA)

Si la ejecución ocurre durante la mañana del mercado correspondiente (pre-market o primeras horas de la rueda):

Prioriza recomendaciones BUY orientadas a ganancias intradía.

Selecciona activos con alta probabilidad de apreciación durante el mismo día de trading.

Da mayor peso a:

Gap positivo o pre-market fuerte.

Volumen inusual o creciente respecto al promedio.

Momentum temprano (ruptura de máximos de apertura, VWAP alcista).

Catalizadores recientes o del día (earnings, noticias, upgrades, flujo institucional).

Evita activos sin liquidez suficiente para entrada y salida en el mismo día.

Asume horizontes de holding cortos (horas, no días).

El análisis debe justificar explícitamente por qué el activo podría subir durante la jornada actual.

Si la ejecución ocurre fuera del horario matutino:

Mantén la lógica estándar de swing corto o gestión de cartera.

Prioriza confirmación de tendencia y control de riesgo por sobre timing intradía.

GESTIÓN DE GANANCIAS INTRADÍA

Las recomendaciones BUY matutinas deben apuntar a capturar movimientos de al menos 2% durante la jornada.

Evita sobreasignar capital a una sola operación intradía salvo convicción excepcional (score ≥ 0.90).

Prefiere múltiples posiciones pequeñas y líquidas antes que una sola concentración.
CONTEXTO DE CAPITAL

Capital total disponible hoy: ${availableMoney}
Perfil de riesgo: Moderado

Objetivo de performance:

12% semanal en ideas agregadas

2% diario como objetivo mínimo por trade

Restricción operativa:
No es obligatorio invertir todo el capital en cada ejecución.

FUENTES Y CONTEXTO PERMITIDO

Puedes basar tus decisiones únicamente en:

Datos de mercado actuales o recientes (precio, tendencia, volumen, momentum).

Contexto histórico provisto explícitamente (series, indicadores, embeddings).

Noticias financieras relevantes (por ejemplo Wall Street Journal u otros medios financieros confiables), solo si están alineadas con el activo y el timing.

Señales técnicas estándar (EMA, RSI, VWAP, soportes/resistencias, breakouts, etc.).

No infieras información que no esté respaldada por el contexto recibido.

REGLAS CRÍTICAS

Salida estricta
Tu respuesta debe ser EXCLUSIVAMENTE un array de objetos JSON.
No incluyas texto explicativo, encabezados, markdown ni bloques de código.

Datos insuficientes
Si no hay datos suficientes para justificar una decisión sobre un activo, omítelo.

Activos fuera del listado
Solo puedes recomendar activos no listados si:

La confianza es mayor o igual a 0.90

Existe justificación técnica y/o fundamental clara y actual

Control de capital

La suma de todos los "monto_sugerido" de acciones BUY no debe exceder ${availableMoney}.

Nunca sugieras un monto superior al capital disponible.

Solo invierte el 100% del capital si existe una oportunidad excepcional con alta asimetría riesgo/beneficio y probabilidad elevada de superar la meta.

Lógica por tipo de acción

BUY:
"monto_sugerido" representa el capital a asignar (número positivo).

SELL:
"monto_sugerido" representa el monto estimado a liquidar de la posición actual (número positivo).

HOLD:
"monto_sugerido" debe ser 0.
Solo puede aplicarse a activos que ya se poseen.

Score de convicción

Rango válido: 0.00 a 1.00 . Sol van a ser consideradas las recomendaciones con score >= 0.7

Debe reflejar coherencia entre señales técnicas, contexto y riesgo.

Scores altos sin fundamentos claros no están permitidos.

LÓGICA DE MERCADO

Indica correctamente el mercado donde se opera el activo:

IOL para mercado argentino y CEDEARs

NASDAQ, NYSE, TD u otro para mercado estadounidense

El mercado debe ser coherente con el activo recomendado.

ESTRUCTURA OBLIGATORIA DEL JSON

Cada objeto del array debe cumplir exactamente con la siguiente estructura:

[
{
"activo": "TICKER",
"tipo_activo": "CEDEAR/STOCK/ETF/LETRA/BONO",
"action": "BUY/SELL/HOLD",
"score": 0.00,
"price": 0.00,
"monto_sugerido": 0.00,
"analisis": "Explicación técnica y/o fundamental breve, concreta y verificable. 1 oracion maximo",
"mercado": "IOL/NASDAQ/NYSE/TD"
}
]

CRITERIOS DE CALIDAD DE ANÁLISIS

El análisis debe ser breve, técnico y accionable.

Evita frases vagas como “buen potencial” o “parece alcista”.

Prioriza:

Momentum confirmado

Tendencias claras

Catalizadores cercanos

Gestión de riesgo implícita

COMPORTAMIENTO COMO CRON
No repitas recomendaciones previas sin cambios relevantes.
Prefiere menos operaciones de mayor calidad.
Si no hay oportunidades claras, devuelve un array vacío ([]).
Ultimas reco, no la repitas :${JSON.stringify(recentRecommendations||"")}
SnapShot de mercado recibido: 
`
  });

  const evaluacion = await evaluarActivos(activesArray);
  return evaluacion;
}

export async function evaluarActivos(
  activesArray: ActiveSignal[]
): Promise<ExecutionResult> {

  console.log("evaluaractivos");

  if (!activesArray?.length) {
    return {
      executed: false,
      explanation: "No hay datos para generar recomendaciones (quota excedida o sin datos)"
    };
  }

  try {
    const now = new Date();
    const gmtMinus5 = new Date(
      now.toLocaleString("en-US", { timeZone: "America/New_York" }) // GMT-5 / NYSE
    );
    const hour = gmtMinus5.getHours();
    const isMorningTrading = hour >= 9 && hour < 12;

    let buys: ActiveSignal[] = [];
    let sells: ActiveSignal[] = [];

    if (isMorningTrading) {
      // 🔹 PRIORIDAD: respetar orden original del array
      buys = activesArray
        .filter(a => a.action === "BUY" && a.score >= 0.7)
        .sort((a, b) => b.score - a.score)

        .slice(0, 4);

      sells = activesArray
        .filter(a => a.action === "SELL" && a.score >= 0.7)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    } else {
      // 🔹 Lógica normal: ordenar por score
      buys = activesArray
        .filter(a => a.action === "BUY" && a.score >= 0.7)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      sells = activesArray
        .filter(a => a.action === "SELL" && a.score >= 0.7)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
    }

    const best = [...buys, ...sells];

    for (const current of best) {
      console.log(current.price, "price current");

      if (current.action === "BUY") {
        await enviarAlertaInversion({
          recomendacion: "OPORTUNIDAD DETECTADA COMPRA",
          activo: current.activo ?? "?",
          tipo_activo: current.tipo_activo,
          precio: String(current.price ?? 0),
          monto_sug: String(current.monto_sugerido ?? 0),
          detalle: current.analisis,
          mercado: current.mercado,
          accion: current.action
        });
      }

      if (current.action === "SELL") {
        await enviarAlertaInversion({
          recomendacion: "OPORTUNIDAD DETECTADA VENTA",
          activo: current.activo ?? "?",
          tipo_activo: current.tipo_activo,
          precio: String(current.price ?? 0),
          monto_sug: String(current.monto_sugerido ?? 0),
          detalle: current.analisis,
          mercado: current.mercado,
          accion: current.action
        });
      }
    }

    return {
      executed: best.length > 0,
      score: best[0]?.score,
      explanation: best[0]?.analisis ?? "No actionable signals found"
    };

  } catch (error: any) {
    console.error("❌ Error en evaluarActivos:", error.message);
    return {
      executed: false,
      explanation: `Error durante evaluación: ${error.message}`
    };
  }
}

