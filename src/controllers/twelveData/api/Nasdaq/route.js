//recibp una accion y devuelve el precio

export async function getPriceCommonStock(accion,exchange){
const fetch = require('node-fetch');

fetch('https://api.twelvedata.com/price?symbol='+accion+'&exchange='+exchange+'&type=common_stock&TWELVE_DATA_API_KEY='+process.env.TWELVE_DATA_API_KEY)
  .then(response => response.json())
  .then(data => console.log(data));
  return data;
}
export async function getPriceEtf(accion,exchange){
const fetch = require('node-fetch');

fetch('https://api.twelvedata.com/price?symbol='+accion+'&exchange='+exchange+'&type=ETF&TWELVE_DATA_API_KEY='+process.env.TWELVE_DATA_API_KEY)
  .then(response => response.json())
  .then(data => console.log(data));
  return data;
}