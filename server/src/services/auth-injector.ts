import type { ServiceAuth } from "../../../shared/types/config";

export class AuthInjector {
  static injectAuth(headers: Headers, auth: ServiceAuth): Headers {
    const newHeaders = new Headers(headers);

    switch (auth.type) {
      case "basic":
        if (auth.username && auth.password) {
          const credentials = btoa(`${auth.username}:${auth.password}`);
          newHeaders.set("Authorization", `Basic ${credentials}`);
        }
        break;

      case "apikey":
        if (auth.header && auth.value) {
          newHeaders.set(auth.header, auth.value);
        }
        break;

      case "bearer":
        if (auth.value) {
          newHeaders.set("Authorization", `Bearer ${auth.value}`);
        }
        break;

      case "none":
      default:
        break;
    }

    return newHeaders;
  }

  static sanitizeRequestHeaders(headers: Headers): Headers {
    const newHeaders = new Headers();
    // Only skip headers that would break the proxy
    const skipHeaders = [
      "host",
      "connection",
      "content-length", // Will be recalculated
      "transfer-encoding" // Will be recalculated
    ];

    headers.forEach((value, key) => {
      if (!skipHeaders.includes(key.toLowerCase())) {
        newHeaders.set(key, value);
      }
    });

    return newHeaders;
  }
}