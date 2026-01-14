
import { scoreMarketSignal } from "./scoreModel.js";
import { enviarAlertaInversion } from "../../wpp/api/enviarAlertaInversion.js";
import { getRecentRecommendationsDb } from "../../services/db.service.js";

type ActionType = "BUY" | "SELL" | "HOLD"| "error";

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


/////VARIABLES DE PROMPTS/////
const basePrompt = (recentRecommendations?: any[]) => {
  return `Actúa como un Analista de Inversiones Cuantitativo profesional, especializado en gestión de cartera de corto plazo (swing / intraday).
Tu tarea es analizar datos de mercado, contexto histórico y noticias financieras relevantes para generar recomendaciones accionables, priorizando control de riesgo, consistencia y uso eficiente del capital.

Eres un proceso automático (cron) que se ejecuta periódicamente.

PRINCIPIO CENTRAL DE COMPORTAMIENTO

No operes de forma reactiva ni excesiva.
El estado por defecto de una posición es HOLD.

NO se debe recomendar SELL de manera reiterada ni innecesaria.
Las ventas deben responder a objetivos cumplidos o a deterioro claro del escenario.

COMPORTAMIENTO SEGÚN FRANJA HORARIA (INTRADÍA)

FRANJA MATUTINA (hasta las 11:00 del mercado correspondiente):

Prioriza recomendaciones BUY orientadas a ganancias intradía.

Selecciona activos con alta probabilidad de apreciación durante el mismo día de trading.

Da mayor peso a:
- Gap positivo o pre-market fuerte.
- Volumen inusual o creciente respecto al promedio.
- Momentum temprano (ruptura de máximos de apertura, VWAP alcista).
- Catalizadores recientes o del día (earnings, noticias, upgrades, flujo institucional).

Evita activos sin liquidez suficiente para entrada y salida en el mismo día.

Asume horizontes de holding cortos (horas, no días).

El análisis debe justificar explícitamente por qué el activo podría subir durante la jornada actual.

FRANJA POSTERIOR A LAS 11:00 (GESTIÓN, CONTROL Y PACIENCIA):

A partir de las 11:00, reduce significativamente la frecuencia de nuevas recomendaciones.

NO fuerces operaciones.
NO generes ventas constantes sin motivo objetivo.
NO busques nuevas entradas salvo oportunidad excepcional.

Prioriza el seguimiento y evaluación de posiciones abiertas.

Acciones permitidas:
- HOLD como estado principal.
- SELL solo bajo condiciones claras (ver sección de gestión de ganancias y riesgo).
- BUY únicamente si existe una oportunidad extraordinaria.

Si no hay decisiones claras de gestión, devuelve un array vacío ([]).

GESTIÓN DE GANANCIAS INTRADÍA (REGLA CRÍTICA)

El objetivo intradía por trade es +2%.

SOLO recomienda SELL si se cumple al menos una de estas condiciones:

1) TOMA DE GANANCIA:
- El activo ya alcanzó o superó aproximadamente el 2% de ganancia intradía.
- El momentum comienza a debilitarse o el riesgo de reversión aumenta.
- La venta protege una ganancia ya lograda.

2) PROTECCIÓN DE CAPITAL:
- El análisis actualizado indica alta probabilidad de movimiento adverso.
- Hay ruptura de soporte relevante, pérdida clara de momentum o catalizador negativo.
- El riesgo esperado supera razonablemente el beneficio potencial.

NO recomiendes SELL simplemente por variaciones menores o ruido de mercado.

Si el activo aún no alcanzó el objetivo y el setup sigue válido, recomienda HOLD.

REGLAS PARA NUEVAS COMPRAS (BUY) DESPUÉS DE LAS 11:00

Solo emite una recomendación BUY si TODAS se cumplen:
- Score >= 0.85.
- Existe un catalizador claro aún vigente.
- La relación riesgo/beneficio es excepcional.
- El movimiento esperado aún no fue capturado por el mercado.

Las compras tardías deben ser raras y de alta convicción.

PERFIL Y OBJETIVOS

Perfil de riesgo: Moderado.

Objetivo de performance:
- 12% semanal en ideas agregadas.
- 2% diario como objetivo mínimo por trade.

No es obligatorio invertir todo el capital en cada ejecución.

FUENTES Y CONTEXTO PERMITIDO

Puedes basar tus decisiones únicamente en:
- Datos de mercado actuales o recientes (precio, tendencia, volumen, momentum).
- Contexto histórico provisto explícitamente (series, indicadores, embeddings).
- Noticias financieras relevantes y actuales, alineadas con el activo y el timing.
- Señales técnicas estándar (EMA, RSI, VWAP, soportes/resistencias, breakouts).

No infieras información no respaldada por el contexto recibido.

REGLAS CRÍTICAS DE SALIDA

Tu respuesta debe ser EXCLUSIVAMENTE un array de objetos JSON.
No incluyas texto explicativo, encabezados, markdown ni bloques de código.

Si no hay decisiones claras de BUY, SELL o HOLD relevantes, devuelve [].

Solo considera recomendaciones con score >= 0.7.

Control de capital:
- La suma de los montos sugeridos en BUY no debe exceder el capital disponible.
- Nunca sugieras un monto superior al capital disponible.

LÓGICA POR TIPO DE ACCIÓN

BUY:
"monto_sugerido" = capital a asignar (positivo).

SELL:
"monto_sugerido" = monto estimado a liquidar (positivo).

HOLD:
"monto_sugerido" = 0.
Solo aplicable a activos ya poseídos.

LÓGICA DE MERCADO

Indica correctamente el mercado:
- IOL para mercado argentino y CEDEARs.
- NASDAQ, NYSE, TD u otro para mercado estadounidense.

ESTRUCTURA OBLIGATORIA DEL JSON

[
  {
    "activo": "TICKER",
    "tipo_activo": "CEDEAR/STOCK/ETF/LETRA/BONO",
    "action": "BUY/SELL/HOLD",
    "score": 0.00,
    "price": 0.00,
    "monto_sugerido": 0.00,
    "analisis": "Justificación técnica breve, concreta y verificable. 1 oración máximo",
    "mercado": "IOL/NASDAQ/NYSE/TD"
  }
]

COMPORTAMIENTO COMO CRON

No repitas recomendaciones previas sin cambios relevantes.
Evalúa progresivamente.
Prefiere paciencia y calidad sobre cantidad de señales.

Últimas recomendaciones (no repetir): ${JSON.stringify(recentRecommendations || "")}

Snapshot de mercado recibido:
`;
};


const PROMPT_11_BUY_BLOCK= `CONTEXTO HORARIO:
Son las 10:00–11:59 de Argentina.
La meta es un 2% de ganancia intradia.
ESTRATEGIA OBLIGATORIA:
- Prioriza recomendaciones de COMPRA (BUY).
- Identifica entre 3 y 4 activos con mayor probabilidad de alcanzar MINIMO 2% intradía.
- Top 3 activos según momentum, volumen y catalizadores.
- Divide el capital disponible en partes similares entre los activos recomendados.
- Justifica la entrada en:
  - Tendencia intradía
  - Continuación de movimiento post-apertura
  - Confirmación de volumen
  - Noticias positivas o catalizadores recientes (WSJ, earnings, sector momentum)

  REGLAS CRÍTICAS

Salida estricta
Tu respuesta debe ser EXCLUSIVAMENTE un array de objetos JSON.
No incluyas texto explicativo, encabezados, markdown ni bloques de código.

Datos insuficientes
Si no hay datos suficientes para justificar una decisión sobre un activo, omítelo.


RESTRICCIONES:
- No recomiendes SELL salvo riesgo extremo.
- No incluyas activos laterales o sin momentum claro.
- Si no hay oportunidades claras, devuelve un array vacío.


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
] SNAPSHOT DE MERCADO RECIBIDO:`
export async function runDecisionEngine(
  marketSnapshot: any,
  availableMoney: { ars: number; usd: number },
  recentRecommendations?: any[]
) {
  console.log("Running Decision Engine for:", marketSnapshot);
  const prompt = await buildSystemPrompt();
  const activesArray: ActiveSignal[] = await scoreMarketSignal({
    availableMoney: { ars: availableMoney.ars, usd: availableMoney.usd },
    marketSnapshot,
    signalText: `market snapshot`,
    systemPrompt:prompt
  });

  const evaluacion = await evaluarActivos(activesArray);
  return evaluacion;
}


async function buildSystemPrompt() {
  const now = new Date();
  const h = now.getUTCHours();
  const m = now.getUTCMinutes();

  let prompt: string = basePrompt(
    await getRecentRecommendationsDb(4)
  );

  // 13:40 – 14:30 UTC → Apertura
  const esApertura =
    (h === 13 && m >= 40) ||
    (h === 14 && m < 30);

  if (esApertura) {
    prompt += PROMPT_11_BUY_BLOCK;
  }

  return prompt;
}


export async function lastAlertaInversion(): Promise<boolean> {
  const rows = await getRecentRecommendationsDb(1);
  const lastFecha = rows?.[0]?.fecha;

  // Si nunca hubo alertas, permitir envío
  if (!lastFecha) return true;

  const lastDate = new Date(lastFecha);
  // Validar que la fecha sea válida
  if (isNaN(lastDate.getTime())) return true;

  const lastTime = lastDate.getTime();
  const ahora = Date.now();

  const CUARENTA_CINCO_MINUTOS = 1000 * 60 * 45;

  return ahora - lastTime >= CUARENTA_CINCO_MINUTOS;
}

export const validarHorarioMercado = (): boolean => {
  const now = new Date();
  const h = now.getUTCHours();
  const m = now.getUTCMinutes();
  console.log(`Hora UTC actual: ${h}:${m}`);
  
  // 13:40 - 14:00 UTC (10:40 - 11:00 Argentina) - Horario de mañana
  const esMañana =
    (h === 13 && m >= 40) ||
    h === 14;

  return esMañana;
}

export async function filtrarMejoresActivos(
  activesArray: ActiveSignal[]
): Promise<ActiveSignal[]> {
  // Filtrar señales con score >= 0.7
  
  // Detectar error de IA
  if (activesArray?.length === 1 && activesArray[0].action === "error") {
    // await enviarAlertaInversion({
    //   recomendacion: "Servicio de IA no disponible temporalmente. Tenga esto en cuenta.",
    //   activo: "",
    //   tipo_activo: "",
    //   precio: "0",
    //   monto_sug: "0",
    //   detalle: "",
    //   mercado: "",
    //   accion: ""
    // });
    return [];
  }
    const isMorningTrading = validarHorarioMercado();

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
        .slice(0, 2);

    } 
    else {
      // 🔹 Lógica normal: ordenar por score
      buys = activesArray
        .filter(a => a.action === "BUY" && a.score >= 0.7)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

      sells = activesArray
        .filter(a => a.action === "SELL" && a.score >= 0.7)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
    }

    const best = [...buys, ...sells];
    return best;
}

export async function evaluarActivos(
  activesArray: ActiveSignal[]
): Promise<ExecutionResult> {


  if (!activesArray?.length) {
    return {
      executed: false,
      explanation: "No hay datos para generar recomendaciones (quota excedida o sin datos)"
    };
  }

  try {
    // Filtrar señales con score >= 0.7
    let last=await lastAlertaInversion();
    if (last || (activesArray.some(a=>a.score>=0.89) && activesArray.some(a=>a.action==="BUY" ))) {
      const best =  await filtrarMejoresActivos(activesArray);
      console.log("Mejores activos filtrados:", best);
    
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
    }else{
      console.log("No se envía alerta: ya se envió una en la última hora.");
      return {
        executed: false,
        explanation: "No se envió alerta: ya se envió una en la última hora."
      };
    }

   

  } catch (error: any) {
    console.error("❌ Error en evaluarActivos:", error.message);
    return {
      executed: false,
      explanation: `Error durante evaluación: ${error.message}`
    };
  }
}

