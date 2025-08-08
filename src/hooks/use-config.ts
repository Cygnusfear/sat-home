import { useState, useEffect } from "react";
import type { Config, SanitizedService } from "../../shared/types/config";

interface SanitizedConfig {
  app: Config["app"];
  services: SanitizedService[];
}

export function useConfig() {
  const [config, setConfig] = useState<SanitizedConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Remove SSR check and just fetch
    fetch("http://localhost:3001/api/config")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch config:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { config, loading, error };
}