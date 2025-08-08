import { Elysia } from "elysia";
import { configLoader } from "../services/config-loader";

export const configRoutes = new Elysia({ prefix: "/api/config" })
  .get("/", () => {
    return configLoader.getSanitizedConfig();
  })
  .get("/validate", () => {
    try {
      const config = configLoader.getConfig();
      return {
        valid: true,
        serviceCount: config.services.length,
        services: config.services.map((s: any) => ({
          id: s.id,
          name: s.name,
          authType: s.auth.type
        }))
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  });