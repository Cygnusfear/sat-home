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

  static sanitizeRequestHeaders(headers: Headers, targetUrl?: string): Headers {
    const newHeaders = new Headers();
    // Only skip headers that would break the proxy
    const skipHeaders = [
      "host", // We'll set this separately
      "connection",
      "content-length", // Will be recalculated
      "transfer-encoding", // Will be recalculated
      // Don't skip cookie - we need it for auth
    ];

    headers.forEach((value, key) => {
      if (!skipHeaders.includes(key.toLowerCase())) {
        newHeaders.set(key, value);
      }
    });

    // Set the Host header to match the target service
    if (targetUrl) {
      try {
        const url = new URL(targetUrl);
        newHeaders.set("Host", url.host);
      } catch (e) {
        // Invalid URL, skip setting host
      }
    }

    return newHeaders;
  }
}