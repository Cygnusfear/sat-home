import type { ServiceAuth } from "../../../shared/types/config";

interface CookieJar {
  [serviceId: string]: {
    cookies: Map<string, string>;
    lastAuth?: number;
  };
}

export class CookieStore {
  private static store: CookieJar = {};

  static getCookies(serviceId: string): string {
    const jar = this.store[serviceId];
    if (!jar || jar.cookies.size === 0) {
      return "";
    }

    // Convert Map to cookie string
    const cookies: string[] = [];
    jar.cookies.forEach((value, name) => {
      cookies.push(`${name}=${value}`);
    });
    
    return cookies.join("; ");
  }

  static setCookies(serviceId: string, setCookieHeaders: string[]): void {
    if (!this.store[serviceId]) {
      this.store[serviceId] = { cookies: new Map() };
    }

    const jar = this.store[serviceId];
    jar.lastAuth = Date.now();

    for (const setCookie of setCookieHeaders) {
      // Parse the Set-Cookie header
      const parts = setCookie.split(";");
      const [nameValue] = parts;
      
      if (nameValue) {
        const [name, ...valueParts] = nameValue.split("=");
        const value = valueParts.join("="); // Handle values with = in them
        
        if (name && value) {
          // Check for expiry/max-age
          const maxAge = parts.find(p => p.trim().toLowerCase().startsWith("max-age="));
          const expires = parts.find(p => p.trim().toLowerCase().startsWith("expires="));
          
          // Simple expiry check (could be improved)
          if (maxAge) {
            const seconds = parseInt(maxAge.split("=")[1]);
            if (seconds === 0) {
              // Delete the cookie
              jar.cookies.delete(name.trim());
              continue;
            }
          }
          
          // Store the cookie
          jar.cookies.set(name.trim(), value.trim());
        }
      }
    }
  }

  static clearCookies(serviceId: string): void {
    delete this.store[serviceId];
  }

  static needsAuthentication(serviceId: string, auth: ServiceAuth): boolean {
    // For Forms auth, check if we have cookies
    if (auth.type === "forms") {
      const jar = this.store[serviceId];
      if (!jar || jar.cookies.size === 0) {
        return true;
      }
      
      // Check if cookies are older than 24 hours
      if (jar.lastAuth && Date.now() - jar.lastAuth > 24 * 60 * 60 * 1000) {
        return true;
      }
      
      return false;
    }
    
    return false;
  }

  static async authenticate(serviceId: string, serviceUrl: string, auth: ServiceAuth): Promise<boolean> {
    if (auth.type !== "forms" || !auth.username || !auth.password) {
      return false;
    }

    try {
      console.log(`Attempting Forms authentication for ${serviceId}`);
      
      // For Radarr/Sonarr, the login endpoint is /login
      const loginUrl = new URL("/login", serviceUrl);
      
      // Create form data
      const formData = new URLSearchParams();
      formData.append("username", auth.username);
      formData.append("password", auth.password);
      formData.append("rememberMe", "on"); // Keep session longer
      
      const response = await fetch(loginUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        body: formData.toString(),
        redirect: "manual",
      });

      console.log(`Authentication response for ${serviceId}:`, {
        status: response.status,
        location: response.headers.get("location"),
        setCookie: response.headers.get("set-cookie"),
      });

      // Check if we got cookies
      const setCookieHeaders: string[] = [];
      
      // Fetch API in Bun should handle multiple set-cookie headers
      const rawHeaders = response.headers as any;
      if (rawHeaders.getSetCookie) {
        // Node 18+ and some runtimes support this
        setCookieHeaders.push(...rawHeaders.getSetCookie());
      } else {
        // Fallback for single cookie
        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
          setCookieHeaders.push(setCookie);
        }
      }

      if (setCookieHeaders.length > 0) {
        this.setCookies(serviceId, setCookieHeaders);
        console.log(`Stored ${setCookieHeaders.length} cookies for ${serviceId}`);
        return true;
      }

      // If we got a redirect without cookies, follow it
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (location && !location.includes("/login")) {
          // Successful login redirect
          console.log(`Authentication successful for ${serviceId}, redirected to ${location}`);
          return true;
        }
      }

      console.log(`Authentication failed for ${serviceId}`);
      return false;
      
    } catch (error) {
      console.error(`Authentication error for ${serviceId}:`, error);
      return false;
    }
  }
}