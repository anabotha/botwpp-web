import { getValidToken } from "./iolAuth";

export async function getCedearsTodos() {
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

  return response.json();
}

export async function getLetrasTodas(){
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

  return response.json();
}
