// import { getValidToken } from "..controllers/IOL/api/iolAuth.js";

// export async function getCedearsTodos() {
//      const token = await getValidToken();

//      const response = await fetch(
//           "https://api.invertironline.com/api/v2/Cotizaciones/cEDEARS/argentina/todos",
//           {
//                headers: {
//                     Authorization: `Bearer ${token}`,
//                     Accept: "application/json",
//                },
//           }
//      );

//      return response.json();
// }

// export async function getLetrasTodas() {
//      const token = await getValidToken();

//      const response = await fetch(
//           "https://api.invertironline.com/api/v2/Cotizaciones/letras/argentina/todos",
//           {
//                headers: {
//                     Authorization: `Bearer ${token}`,
//                     Accept: "application/json",
//                },
//           }
//      );

//      return response.json();
// }

// src/services/iol.service.ts
import { getValidToken } from "./iolAuth.service.js";

export async function getCedearsTodos() {
     try {
          const token = await getValidToken();
          const response = await fetch(
               "https://api.invertironline.com/api/v2/Cotizaciones/cEDEARS/argentina/todos",
               {
                    headers: {
                         Authorization: `Bearer ${token}`,
                         Accept: "application/json",
                    },
               }
          );
          if (!response.ok) throw new Error("Error al obtener Cedears");
          return await response.json();
     } catch (error) {
          console.error("IOL Cedears Error:", error);
          return { titulos: [] }; // Devolvemos estructura vacía para no romper el concat
     }
}

export async function getLetrasTodas() {
     try {
          const token = await getValidToken();
          const response = await fetch(
               "https://api.invertironline.com/api/v2/Cotizaciones/letras/argentina/todos",
               {
                    headers: {
                         Authorization: `Bearer ${token}`,
                         Accept: "application/json",
                    },
               }
          );
          if (!response.ok) throw new Error("Error al obtener Letras");
          return await response.json();
     } catch (error) {
          console.error("IOL Letras Error:", error);
          return { titulos: [] };
     }
}
