//recibp una accion y devuelve el precio
export async function getPrice(accion:string){
const fetch = require('node-fetch');

return fetch('https://api.twelvedata.com/price?symbol='+accion+'&TWELVE_DATA_API_KEY='+process.env.TWELVE_DATA_API_KEY)
  .then((response: any) => response.json())
  .then((data: any) => {
     console.log(data);
     return data;
    });
}