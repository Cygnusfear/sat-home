import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import { configRoutes } from "./routes/config";
import { proxyRoutes } from "./routes/proxy";
import { healthRoutes } from "./routes/health";

const app = new Elysia()
  .use(
    cors({
      origin: true, // Allow all origins for now
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "Satsang Home API",
          version: "1.0.0",
          description: "Proxy API for self-hosted services",
        },
      },
    })
  )
  .onError(({ code, error, set }) => {
    console.error(`Error ${code}:`, error);
    
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Not found" };
    }
    
    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "Validation error", details: error.message };
    }
    
    set.status = 500;
    return { error: "Internal server error" };
  })
  .get("/", () => ({ 
    name: "Satsang Home API", 
    version: "1.0.0",
    docs: "/swagger"
  }))
  .use(configRoutes)
  .use(proxyRoutes)
  .use(healthRoutes)
  .listen(process.env.PROXY_PORT || 3001);

console.log(
  `🚀 Satsang Home API is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;