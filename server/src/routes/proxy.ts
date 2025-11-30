import { Elysia, t } from "elysia";
import { configLoader } from "../services/config-loader";
import { AuthInjector } from "../services/auth-injector";
import { CookieStore } from "../services/cookie-store";
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
      // Check if we need to authenticate with Forms auth
      if (service.auth.type === "forms" && CookieStore.needsAuthentication(serviceId, service.auth)) {
        console.log(`Service ${serviceId} needs Forms authentication`);
        const authSuccess = await CookieStore.authenticate(serviceId, service.url, service.auth);
        if (!authSuccess) {
          console.error(`Forms authentication failed for ${serviceId}`);
          set.status = 401;
          return { error: "Authentication failed" };
        }
      }

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

      // Add stored cookies for Forms auth
      if (service.auth.type === "forms") {
        const storedCookies = CookieStore.getCookies(serviceId);
        if (storedCookies) {
          // Merge with any existing cookies from the client
          const existingCookies = headersWithAuth.get("Cookie") || "";
          const allCookies = existingCookies ? `${existingCookies}; ${storedCookies}` : storedCookies;
          headersWithAuth.set("Cookie", allCookies);
          console.log(`Using stored cookies for ${serviceId}`);
        }
      } else {
        // For non-Forms auth, use client cookies
        const cookieHeader = headers.cookie || headers.Cookie;
        if (cookieHeader) {
          headersWithAuth.set("Cookie", cookieHeader);
        }
      }

      const proxyOptions: RequestInit = {
        method: request.method,
        headers: headersWithAuth,
        redirect: "manual",
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

      // Store cookies from Forms auth services
      if (service.auth.type === "forms") {
        const setCookieHeaders: string[] = [];
        const rawHeaders = response.headers as any;
        
        if (rawHeaders.getSetCookie) {
          setCookieHeaders.push(...rawHeaders.getSetCookie());
        } else {
          const setCookie = response.headers.get("set-cookie");
          if (setCookie) {
            setCookieHeaders.push(setCookie);
          }
        }
        
        if (setCookieHeaders.length > 0) {
          CookieStore.setCookies(serviceId, setCookieHeaders);
          console.log(`Stored ${setCookieHeaders.length} cookies from ${serviceId} response`);
        }
      }

      // Log response for debugging Radarr/Sonarr
      if (serviceId === "radarr" || serviceId === "sonarr") {
        console.log(`${serviceId} response:`, {
          status: response.status,
          contentType: response.headers.get("content-type"),
          contentLength: response.headers.get("content-length"),
          location: response.headers.get("location")
        });
      }

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (location) {
          // Handle both absolute and relative redirects
          let redirectUrl;
          if (location.startsWith("http://") || location.startsWith("https://")) {
            redirectUrl = new URL(location);
          } else {
            redirectUrl = new URL(location, targetUrl);
          }
          
          // If it's redirecting to a login page and we have Forms auth
          if (redirectUrl.pathname.includes("/login") && service.auth.type === "forms") {
            console.log(`${serviceId} session expired, re-authenticating...`);
            // Clear old cookies and re-authenticate
            CookieStore.clearCookies(serviceId);
            const authSuccess = await CookieStore.authenticate(serviceId, service.url, service.auth);
            
            if (authSuccess) {
              // Retry the original request with new cookies
              const storedCookies = CookieStore.getCookies(serviceId);
              if (storedCookies) {
                headersWithAuth.set("Cookie", storedCookies);
              }
              
              const retryResponse = await fetch(targetUrl.toString(), {
                method: request.method,
                headers: headersWithAuth,
                redirect: "manual",
                body: proxyOptions.body as any,
              });
              
              // Return the retry response
              const retryHeaders: Record<string, string> = {};
              retryResponse.headers.forEach((value, key) => {
                if (!["content-encoding", "content-length", "transfer-encoding"].includes(key.toLowerCase())) {
                  retryHeaders[key] = value;
                }
              });
              
              set.status = retryResponse.status;
              set.headers = retryHeaders;
              
              const arrayBuffer = await retryResponse.arrayBuffer();
              return new Uint8Array(arrayBuffer);
            } else {
              // Auth failed, return 401
              set.status = 401;
              return { error: "Authentication required" };
            }
          } else {
            // For other redirects or non-Forms auth, follow them
            const proxyRedirect = `/api/proxy/${serviceId}${redirectUrl.pathname}${redirectUrl.search}`;
            set.status = 302;
            set.headers = {
              'Location': proxyRedirect
            };
            return '';
          }
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
          // Rewrite Set-Cookie headers to work with our proxy
          if (key.toLowerCase() === 'set-cookie') {
            // Parse and modify cookie
            let modifiedCookie = value
              // Remove the domain so cookie works on current domain
              .replace(/Domain=[^;]+;?\s*/gi, '')
              // Remove Secure flag if we're on HTTP
              .replace(/;\s*Secure/gi, '')
              // Change SameSite to Lax for better compatibility
              .replace(/SameSite=None/gi, 'SameSite=Lax')
              // Add path prefix for the service
              .replace(/Path=\//gi, `Path=/api/proxy/${serviceId}/`);
            
            // If no path was set, add one
            if (!modifiedCookie.includes('Path=')) {
              modifiedCookie += `; Path=/api/proxy/${serviceId}/`;
            }
            
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

        // Inject keyboard shortcut script into HTML pages
        if (contentType.includes("text/html")) {
          const keyboardScript = `
<script>
// Satsang Home: Forward keyboard shortcuts to parent window
(function() {
    'use strict';
    if (window.self === window.top) return;
    document.addEventListener('keydown', function(e) {
        var isMod = e.metaKey || e.ctrlKey;
        if ((isMod && e.key === 'k') || (isMod && e.key === 'b')) {
            window.parent.postMessage({
                type: 'keyboard-shortcut',
                key: e.key,
                metaKey: e.metaKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                altKey: e.altKey
            }, '*');
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);
})();
</script>`;
          // Inject before </body> or </html>, whichever comes first
          if (text.includes('</body>')) {
            text = text.replace('</body>', keyboardScript + '</body>');
          } else if (text.includes('</html>')) {
            text = text.replace('</html>', keyboardScript + '</html>');
          } else {
            // Append to end if no closing tags found
            text += keyboardScript;
          }
        }
        
        // HTML attribute rewriting
        text = text.replace(
          /(href|src|action)="\/([^"]*?)"/g,
          `$1="/api/proxy/${serviceId}/$2"`
        );
        text = text.replace(
          /(href|src|action)='\/([^']*?)'/g,
          `$1='/api/proxy/${serviceId}/$2'`
        );
        // Handle Jellyfin's special asset paths with encoded characters
        text = text.replace(
          /src="([^"]+\.js|[^"]+\.css)\?([^"]*)"/g,
          `src="/api/proxy/${serviceId}/$1?$2"`
        );
        
        // Fix form submissions for Radarr/Sonarr
        if (serviceId === "radarr" || serviceId === "sonarr") {
          // Rewrite form action URLs
          text = text.replace(
            /action="\/login"/g,
            `action="/api/proxy/${serviceId}/login"`
          );
          // Rewrite JavaScript form submissions
          text = text.replace(
            /url:\s*["']\/login["']/g,
            `url: "/api/proxy/${serviceId}/login"`
          );
        }
        
        // CSS url() rewriting
        text = text.replace(
          /url\(["']?\/(.*?)["']?\)/g,
          `url(/api/proxy/${serviceId}/$1)`
        );

        // JavaScript API path rewriting
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
          // Rewrite _next paths for Jellyseer
          text = text.replace(
            /\/_next\//g,
            `/api/proxy/${serviceId}/_next/`
          );
          // Rewrite API v1 calls for Jellyseer
          text = text.replace(
            /["']\/api\/v1\//g,
            `"/api/proxy/${serviceId}/api/v1/`
          );
          
          // For Radarr/Sonarr, rewrite their API base URL
          if (serviceId === "radarr" || serviceId === "sonarr") {
            // Rewrite apiRoot and urlBase
            text = text.replace(
              /apiRoot:\s*["']\/api["']/g,
              `apiRoot: "/api/proxy/${serviceId}/api"`
            );
            text = text.replace(
              /urlBase:\s*["']\/?["']/g,
              `urlBase: "/api/proxy/${serviceId}"`
            );
            // Rewrite window.Sonarr or window.Radarr settings
            text = text.replace(
              /window\.(Sonarr|Radarr)\s*=\s*\{/g,
              `window.$1 = { urlBase: "/api/proxy/${serviceId}", apiRoot: "/api/proxy/${serviceId}/api", `
            );
          }
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