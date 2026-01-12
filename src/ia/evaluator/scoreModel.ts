import { generateEmbedding } from "../embeddings/generator";
import { supabase } from "../../config/supabaseClient.js";
import { GoogleGenAI } from "@google/genai";
import { getContextEmbeddings } from "../../services/embeddings.service.js"; // IMPORTAR EL SERVICIO
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

    //  Generar el contenido (aquí es donde se envían los datos del usuario)
    const prompt = `Market Data: ${JSON.stringify(market)}
                    Context: "Contexto histórico relevante::"${JSON.stringify(context)}
                    Available Money: ${JSON.stringify(availableMoney)}`;

    // Se usa generateContent para obtener la respuesta
    const result = await model.generateContent(systemPrompt + prompt);
    const response = await result.response;
    const aiText = response.text(); // Extraemos el texto de la respuesta

    // console.log("AI Response Text:", aiText);

    const cleanJson = aiText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    try {
      //  Convertir el string limpio en un array de objetos real
      const aiArray = JSON.parse(cleanJson);

      console.log(aiArray);
      return aiArray;
    } catch (error) {
      console.error("Error al parsear el JSON de la IA:", error);
    }

  } catch (error) {
    console.error("Error detallado de la IA:", error);
  }

  return;
}



export async function scoreMarketSignal(input: {
  availableMoney: { ars: number, usd: number };
  marketSnapshot: any;
  signalText: string;
  systemPrompt: string;
}) {
  try {
    //  Recuperar los embeddings 
    const contextDataArray = await getContextEmbeddings();
    // const conterdata=getContext(input.marketSnapshot.embedding,"marketSnapshot");
    // console.log(conterdata);
    const contextData = contextDataArray
      .filter(item => item.content)
      .map(item => `- ${item.content}`)
      .join("\n");

    // console.log(contextData);


    // 3. Scoring determinístico + IA
    const aiArray = await calculateScore({
      market: input.marketSnapshot,
      context: contextData, // Pasamos la data real del servicio
      systemPrompt: input.systemPrompt,
      availableMoney: input.availableMoney
    });
console.log("AI Array:", aiArray);
    return aiArray;
  } catch (error) {
    console.error("Error en scoreMarketSignal:", error);
    throw error;
  }
}


async function getContext(queryEmbedding: number[], tipo?: string): Promise<any[]> {
  const { data, error } = await supabase.rpc("match_context_embeddings", {
    query_embedding: queryEmbedding, // El vector generado a partir de la duda del usuario
    match_count: 5,                  // Traer los 5 fragmentos más relevantes
    match_tipo: tipo || null         // Opcional: filtrar por 'noticia', 'regla', etc.
  });

  if (error) {
    console.error("Error en búsqueda vectorial:", error);
    return [];
  }

  return data; // Esto devuelve id, content, metadata y similarity
}
