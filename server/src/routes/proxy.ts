import { Elysia, t } from "elysia";
import { configLoader } from "../services/config-loader";
import { AuthInjector } from "../services/auth-injector";
import { headerMiddleware } from "../middleware/headers";

export const proxyRoutes = new Elysia({ prefix: "/api/proxy" })
  .use(headerMiddleware)
  .all("/:serviceId/*", async ({ params, request, set, body, headers }) => {
    const { serviceId, '*': wildcardPath } = params as { serviceId: string; '*': string };
    const path = wildcardPath || "";

    const service = configLoader.getService(serviceId);
    
    if (!service) {
      set.status = 404;
      return { error: `Service ${serviceId} not found` };
    }

    try {
      const targetUrl = new URL(path, service.url);
      
      if (request.url.includes("?")) {
        const queryString = request.url.split("?")[1];
        targetUrl.search = queryString;
      }

      const requestHeaders = new Headers();
      Object.entries(headers).forEach(([key, value]) => {
        if (value) requestHeaders.set(key, value);
      });
      const sanitizedHeaders = AuthInjector.sanitizeRequestHeaders(requestHeaders, targetUrl.toString());
      const headersWithAuth = AuthInjector.injectAuth(sanitizedHeaders, service.auth);

      const proxyOptions: RequestInit = {
        method: request.method,
        headers: headersWithAuth,
        redirect: "manual",
        credentials: "include", // Forward cookies
      };

      if (request.method !== "GET" && request.method !== "HEAD" && body) {
        if (typeof body === "string") {
          proxyOptions.body = body;
        } else if (body instanceof FormData) {
          proxyOptions.body = body;
        } else {
          proxyOptions.body = JSON.stringify(body);
          headersWithAuth.set("Content-Type", "application/json");
        }
      }

      const response = await fetch(targetUrl.toString(), proxyOptions);

      // Log response for debugging Radarr/Sonarr
      if (serviceId === "radarr" || serviceId === "sonarr") {
        console.log(`${serviceId} response:`, {
          status: response.status,
          contentType: response.headers.get("content-type"),
          contentLength: response.headers.get("content-length"),
          location: response.headers.get("location")
        });
      }

      if (response.type === "opaqueredirect" || [301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (location) {
          // Handle both absolute and relative redirects
          let redirectUrl;
          if (location.startsWith("http://") || location.startsWith("https://")) {
            redirectUrl = new URL(location);
          } else {
            redirectUrl = new URL(location, targetUrl);
          }
          const proxyRedirect = `/api/proxy/${serviceId}${redirectUrl.pathname}${redirectUrl.search}`;
          set.redirect = proxyRedirect;
          return;
        }
      }

      const responseHeaders: Record<string, string> = {};
      const blockedHeaders = [
        "content-encoding", // We're not handling compression
        "content-length", // Will be recalculated
        "transfer-encoding", // Will be recalculated
        "x-frame-options", // Block iframe restrictions
        "content-security-policy", // Block CSP that might break iframes
        "x-content-security-policy",
        "x-webkit-csp"
      ];
      
      response.headers.forEach((value, key) => {
        if (!blockedHeaders.includes(key.toLowerCase())) {
          // Rewrite Set-Cookie headers to remove domain restrictions
          if (key.toLowerCase() === 'set-cookie') {
            // Remove Domain= and Secure flags from cookies
            const modifiedCookie = value
              .replace(/Domain=[^;]+;?/gi, '')
              .replace(/Secure;?/gi, '')
              .replace(/SameSite=None;?/gi, 'SameSite=Lax;');
            responseHeaders[key] = modifiedCookie;
          } else {
            responseHeaders[key] = value;
          }
        }
      });

      set.status = response.status;
      set.headers = responseHeaders;

      const contentType = response.headers.get("content-type") || "";
      
      if (contentType.includes("text/html") || 
          contentType.includes("text/css") || 
          contentType.includes("application/javascript") ||
          contentType.includes("text/javascript")) {
        let text = await response.text();
        
        // HTML attribute rewriting
        text = text.replace(
          /(href|src|action)="\/([^"]*?)"/g,
          `$1="/api/proxy/${serviceId}/$2"`
        );
        text = text.replace(
          /(href|src|action)='\/([^']*?)'/g,
          `$1='/api/proxy/${serviceId}/$2'`
        );
        
        // CSS url() rewriting
        text = text.replace(
          /url\(["']?\/(.*?)["']?\)/g,
          `url(/api/proxy/${serviceId}/$1)`
        );

        // JavaScript API path rewriting for *arr apps
        if (contentType.includes("javascript")) {
          // Rewrite fetch/axios calls to absolute paths
          text = text.replace(
            /fetch\(["']\/api\//g,
            `fetch("/api/proxy/${serviceId}/api/`
          );
          text = text.replace(
            /axios\.\w+\(["']\/api\//g,
            `axios.get("/api/proxy/${serviceId}/api/`
          );
          // Rewrite SignalR hub connections
          text = text.replace(
            /\/signalr\/hubs/g,
            `/api/proxy/${serviceId}/signalr/hubs`
          );
        }

        return text;
      }

      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);

    } catch (error) {
      console.error(`Proxy error for service ${serviceId}:`, error);
      set.status = 502;
      return { 
        error: "Bad Gateway", 
        service: serviceId,
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }, {
    params: t.Object({
      serviceId: t.String(),
      '*': t.Optional(t.String())
    })
  });