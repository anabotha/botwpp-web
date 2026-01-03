import { initialToken, extendSession } from "./api/route.js";

let session = {
     accessToken: null,
     refreshToken: null,
     expiresAt: null,
};

export async function getValidToken() {
     const now = Date.now();

     // Si no hay token
     if (!session.accessToken) {
          const data = await initialToken();
          hydrateSession(data);
          return session.accessToken;
     }

     // Si está por vencer (buffer 60s)
     if (now >= session.expiresAt - 60_000) {
          const data = await extendSession(session.refreshToken);
          hydrateSession(data);
          return session.accessToken;
     }

     return session.accessToken;
}

function hydrateSession(data) {
     session.accessToken = data.access_token;
     session.refreshToken = data.refresh_token;
     session.expiresAt = Date.now() + data.expires_in * 1000;
}
