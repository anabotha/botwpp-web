export async function initialToken() {
  const response = await fetch("https://api.invertironline.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "grant_type": "password",
      "username": process.env.IOL_USERNAME,
      "password": process.env.IOL_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function extendSession(refreshToken){
     const response = await fetch("https://api.invertironline.com/token", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         "grant_type": "refresh_token",
         "refresh_token": refreshToken,
       }),
     });

     if (!response.ok) {
       throw new Error(`Error: ${response.status} ${response.statusText}`);
     }

     const data = await response.json();
     return data;
}
