// src/services/marketData.service.ts
import dotenv from 'dotenv';
dotenv.config();
const BASE_URL = 'https://api.twelvedata.com/price';
export const getPrice = async (accion: string) => {
     try {
          const apiKey = process.env.TWELVE_DATA_API_KEY;
          const url = `https://api.twelvedata.com/price?symbol=${accion}&apikey=${apiKey}`;

          const response = await fetch(url);

          if (!response.ok) {
               throw new Error(`Error en TwelveData: ${response.statusText}`);
          }

          const data = await response.json();

          // TwelveData a veces devuelve errores dentro del JSON (como "api_key not valid")
          if (data.status === "error") {
               throw new Error(data.message);
          }

          return data.price; // Retornamos solo el valor que nos interesa
     } catch (error) {
          console.error("Error en getPrice:", error);
          throw error; // Re-lanzamos para que el controlador lo maneje
     }
};
// export async function getPriceCommonStock(accion: string, exchange: string) {
//      try {
//           console.log("apikey twlede data!", process.env.TWELVE_DATA_API_KEY);

//           const response = await fetch(`${BASE_URL}?symbol=${accion}&exchange=${exchange}&type=common_stock&apikey=${process.env.TWELVE_DATA_API_KEY}`);
//           const data = await response.json();

//           if (data.status === "error") throw new Error(data.message);

//           console.log(`Precio Common Stock (${accion}):`, data.price);
//           return data; // Ahora sí devuelve el JSON con el precio
//      } catch (error) {
//           console.error("Error en getPriceCommonStock:", error);
//           throw error;
//      }
// }
export async function getPriceCommonStock(accion: any, exchange: string) {
     // Si 'accion' es un objeto { activo: 'GGAL', ... }, extraemos el string
     const symbol = typeof accion === 'object' ? accion.activo : accion;

     if (!symbol) {
          throw new Error("El símbolo proporcionado está vacío o no es válido");
     }

     try {
          const url = `${BASE_URL}?symbol=${symbol}&exchange=${exchange}&type=common_stock&apikey=${process.env.TWELVE_DATA_API_KEY}`;

          // Log para verificar la URL final antes de disparar
          // console.log("URL de consulta:", url);

          const response = await fetch(url);
          const data = await response.json();

          if (data.status === "error") throw new Error(data.message);

          // console.log(`✅ Precio obtenido (${symbol}):`, data.price, data);
          return data;
     } catch (error) {
          console.error(`❌ Error en getPriceCommonStock para ${symbol}:`, error.message);
          throw error;
     }
}
export async function getPriceEtf(accion: string, exchange: string) {

     try {
          const response = await fetch(`${BASE_URL}?symbol=${accion}&exchange=${exchange}&type=ETF&apikey=${process.env.TWELVE_DATA_API_KEY}`);
          const data = await response.json();

          if (data.status === "error") throw new Error(data.message);

          // console.log(`Precio ETF (${accion}):`, data.price);
          return data;
     } catch (error) {
          console.error("Error en getPriceEtf:", error);
          throw error;
     }
}

export async function getHistory(symbol: string, exchange: string){
     try {
          const response = await fetch(`${BASE_URL}?symbol=${symbol}&exchange=${exchange}&type=common_stock&apikey=${process.env.TWELVE_DATA_API_KEY}`);
          const data = await response.json();

          if (data.status === "error") throw new Error(data.message);

          // console.log(`Precio Common Stock (${symbol}):`, data.price);
          return data;
     } catch (error) {
          console.error("Error en getPriceCommonStock:", error);
          throw error;
     }
}