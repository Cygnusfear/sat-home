export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services: {
    [serviceId: string]: {
      reachable: boolean;
      responseTime?: number;
      lastChecked: number;
    };
  };
}

export interface ProxyRequest {
  serviceId: string;
  path: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface ProxyResponse {
  status: number;
  headers: Record<string, string>;
  body: string | ArrayBuffer;
}