import { Elysia } from "elysia";

export const headerMiddleware = new Elysia({ name: "header-middleware" })
  .onBeforeHandle(({ set }) => {
    set.headers = set.headers || {};
  })
  .onAfterHandle(({ set, response }) => {
    const headersToRemove = [
      "x-frame-options",
      "content-security-policy",
      "x-content-security-policy",
      "x-webkit-csp"
    ];

    for (const header of headersToRemove) {
      delete set.headers[header];
    }

    set.headers["x-proxied-by"] = "Satsang-Home";
    
    if (!set.headers["access-control-allow-origin"]) {
      set.headers["access-control-allow-origin"] = "*";
    }
    
    if (!set.headers["access-control-allow-credentials"]) {
      set.headers["access-control-allow-credentials"] = "true";
    }

    return response;
  });