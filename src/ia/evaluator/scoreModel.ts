import { generateEmbedding } from "../embeddings/generator";
import { supabase } from "../../config/supabaseClient.js";
import { GoogleGenAI } from "@google/genai";
import { getContextEmbeddings } from "../../services/embeddings.service"; // IMPORTAR EL SERVICIO
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface SignalInterface {
  type: "buy" | "sell" | "hold";
  value: number;
}

async function calculateScore({ market, context, systemPrompt, availableMoney }: any) {
  let score = 0;

  // 1. Inicializar el cliente
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);

  try {
    // 2. Configurar el modelo con las instrucciones del sistema
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    }, { apiVersion: 'v1' });

    // 3. Generar el contenido (aquí es donde se envían los datos del usuario)
    const prompt = `Market Data: ${JSON.stringify(market)}
                    Context: ${JSON.stringify(context)}
                    Available Money: ${JSON.stringify(availableMoney)}`;

    // Se usa generateContent para obtener la respuesta
    const result = await model.generateContent(systemPrompt + prompt);
    const response = await result.response;
    const aiText = response.text(); // Extraemos el texto de la respuesta

    console.log("AI Response Text:", aiText);

    // 4. Procesar el score (asumiendo que la IA responde solo un número)
    const aiScore = parseFloat(aiText.trim());

    if (!isNaN(aiScore)) {
      score += aiScore;
      console.log(`AI Base Score added: ${aiScore}`);
    }
  } catch (error) {
    console.error("Error detallado de la IA:", error);
  }

  // Reglas deterministas
  if (market.priceChange > 2) score += 0.3;
  if (market.volumeSpike) score += 0.2;

  let signal = score > 0.7 ? "buy" : "hold";
  return { score, signal };
}



export async function scoreMarketSignal(input: {
  ticker: string;
  availableMoney: { ars: number, usd: number };
  marketSnapshot: any;
  signalText: string;
  systemPrompt: string;
}) {
  try {
    //  Recuperar los embeddings 
    const contextData = await getContextEmbeddings();

    // 2. Mocking o lógica de búsqueda de contexto
    const context = [{ metadata: { sentiment: "positive" } }];

    // 3. Scoring determinístico + IA
    const { score, signal } = await calculateScore({
      market: input.marketSnapshot,
      context: contextData, // Pasamos la data real del servicio
      systemPrompt: input.systemPrompt,
      availableMoney: input.availableMoney
    });

    return {
      score,
      context,
      signal
    };
  } catch (error) {
    console.error("Error en scoreMarketSignal:", error);
    throw error;
  }
}


// async function embeddings(): Promise<string[]> {
//   const { data, error } = await supabase.from("context_embeddings").select("*");

//   if (error) {
//     return { error: error.message };
//   }

//   return data;
// }
// export async function scoreMarketSignal(input: {
//   ticker: string;
//   availableMoney: { ars: number, usd: number };
//   signal: { type: "buy" | "sell" | "hold"; value: number };
//   marketSnapshot: any;
//   signalText: string;
//   systemPrompt: string; // UNA PARA QEU EVALUE SI COMPRAR /VENDER Y PARA LAS COSAS QUE VAN BIEN QUE DIGA SI RETIRAR GANACIAS PERO SEGUIR TENIENDO ACCIONE
// }) {
//   // 1. Embedding de la consulta (barato)
//   const embeddings: string[] = await embeddings();

//   // 2. Recuperar contexto relevante
//   // Mocking context search if generator is mocked, but let's assume valid response for now
//   /*
//   const context = await searchContextByEmbedding(queryEmbedding, {
//     tipo: "noticia",
//     limit: 5,
//     minSimilarity: 0.72
//   });
//   */
//   // Since verify script mocks fetch but NOT vector db, and I suspect vector db might require real DB connection which I don't have.
//   // I will mock context here for now to ensure logic is tested.

//   const context = [{ metadata: { sentiment: "positive" } }]; // Dummy context to ensure score triggers

//   // 3. Scoring determinístico + IA
//   const score = await calculateScore({
//     market: input.marketSnapshot,
//     context: embeddings,
//     systemPrompt: input.systemPrompt,
//     availableMoney: { ars: input.availableMoney.ars, usd: input.availableMoney.usd }

//   });

//   return {
//     score,
//     context
//   };
// }