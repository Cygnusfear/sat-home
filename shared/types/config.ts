export interface AppConfig {
  title: string;
  icon?: string;
  theme: "dark" | "light";
  defaultService?: string;
}

export interface ServiceAuth {
  type: "none" | "basic" | "apikey" | "bearer" | "forms";
  username?: string;
  password?: string;
  header?: string;
  value?: string;
}

export interface Service {
  id: string;
  name: string;
  url: string;
  icon?: string;
  description?: string;
  auth: ServiceAuth;
  tags?: string[];
  order?: number;
  openInNewTab?: boolean;
}

export interface Config {
  app: AppConfig;
  services: Service[];
}

export interface SanitizedService extends Omit<Service, "auth"> {
  auth: {
    type: ServiceAuth["type"];
  };
  openInNewTab?: boolean;
}
