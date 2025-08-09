import { join } from "node:path";
import { existsSync, readFileSync, watchFile } from "fs";
import type { Config, SanitizedService } from "../../../shared/types/config";

class ConfigLoader {
  private config: Config | null = null;
  private configPath: string;
  private watchers: Set<() => void> = new Set();

  constructor() {
    this.configPath =
      process.env.CONFIG_PATH || join(process.cwd(), "../config/config.json");
    this.loadConfig();
    this.watchConfig();
  }

  private loadConfig(): void {
    try {
      if (!existsSync(this.configPath)) {
        console.warn(
          `Config file not found at ${this.configPath}, using defaults`,
        );
        this.config = this.getDefaultConfig();
        return;
      }

      const rawData = readFileSync(this.configPath, "utf-8");
      const parsedConfig = JSON.parse(rawData) as Config;

      this.validateConfig(parsedConfig);
      this.config = parsedConfig;

      console.log(`Config loaded: ${parsedConfig.services.length} services`);
      this.notifyWatchers();
    } catch (error) {
      console.error("Failed to load config:", error);
      this.config = this.getDefaultConfig();
    }
  }

  private validateConfig(config: Config): void {
    if (!config.app || !config.services) {
      throw new Error("Invalid config structure");
    }

    for (const service of config.services) {
      if (!service.id || !service.name || !service.url) {
        throw new Error(
          `Invalid service configuration: ${JSON.stringify(service)}`,
        );
      }

      if (!service.auth || !service.auth.type) {
        throw new Error(`Service ${service.id} missing auth configuration`);
      }

      try {
        new URL(service.url);
      } catch {
        throw new Error(
          `Invalid URL for service ${service.id}: ${service.url}`,
        );
      }
    }
  }

  private watchConfig(): void {
    if (existsSync(this.configPath)) {
      watchFile(this.configPath, { interval: 5000 }, () => {
        console.log("Config file changed, reloading...");
        this.loadConfig();
      });
    }
  }

  private getDefaultConfig(): Config {
    return {
      app: {
        title: "Satsang Home",
        theme: "dark",
        defaultService: "home",
      },
      services: [],
    };
  }

  public getConfig(): Config {
    if (!this.config) {
      this.loadConfig();
    }
    return this.config || this.getDefaultConfig();
  }

  public getSanitizedConfig(): {
    app: Config["app"];
    services: SanitizedService[];
  } {
    const config = this.getConfig();
    return {
      app: config.app,
      services: config.services.map((service: any) => ({
        id: service.id,
        name: service.name,
        url: service.url,
        icon: service.icon,
        description: service.description,
        tags: service.tags,
        order: service.order,
        openInNewTab: service.openInNewTab,
        auth: {
          type: service.auth.type,
        },
      })),
    };
  }

  public getService(serviceId: string): Config["services"][0] | null {
    const config = this.getConfig();
    return config.services.find((s: any) => s.id === serviceId) || null;
  }

  public onChange(callback: () => void): () => void {
    this.watchers.add(callback);
    return () => this.watchers.delete(callback);
  }

  private notifyWatchers(): void {
    for (const watcher of this.watchers) {
      watcher();
    }
  }
}

export const configLoader = new ConfigLoader();
