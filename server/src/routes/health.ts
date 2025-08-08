import { Elysia } from "elysia";
import { configLoader } from "../services/config-loader";

export const healthRoutes = new Elysia({ prefix: "/api/health" })
  .get("/", () => {
    return {
      status: "healthy",
      timestamp: Date.now(),
      uptime: process.uptime(),
      version: "1.0.0"
    };
  })
  .get("/services", async () => {
    const config = configLoader.getConfig();
    const results: Record<string, any> = {};

    for (const service of config.services) {
      try {
        const start = Date.now();
        const response = await fetch(service.url, {
          method: "HEAD",
          signal: AbortSignal.timeout(5000)
        });
        
        results[service.id] = {
          reachable: response.ok,
          statusCode: response.status,
          responseTime: Date.now() - start,
          lastChecked: Date.now()
        };
      } catch (error) {
        results[service.id] = {
          reachable: false,
          error: error instanceof Error ? error.message : "Unknown error",
          lastChecked: Date.now()
        };
      }
    }

    return {
      status: Object.values(results).every((r: any) => r.reachable) ? "healthy" : "degraded",
      services: results
    };
  });