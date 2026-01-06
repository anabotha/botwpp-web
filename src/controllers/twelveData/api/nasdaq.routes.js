//recibp una accion y devuelve el precio

export async function getPrice(accion){
const fetch = require('node-fetch');

fetch('https://api.twelvedata.com/price?symbol='+accion+'&TWELVE_DATA_API_KEY='+process.env.TWELVE_DATA_API_KEY)
  .then(response => response.json())
  .then(data => console.log(data));
  return data;
}