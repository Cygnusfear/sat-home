# Satsang Home Architecture

## Overview
Satsang Home is a lightweight Organizr alternative that displays services in iframes with a clean sidebar interface. Built with React Router v7, Bun/Elysia backend, and deployed via Docker.

## Key Components

### Frontend (React Router v7)
- **Service Frame**: Iframe component that displays services
- **Sidebar**: Navigation between services
- **Command Menu**: Quick search (⌘K)
- **Resource Routes**: API endpoints served by React Router

### Backend (Elysia/Bun)
- **Proxy Service**: Handles all service requests through `/api/proxy/:serviceId/*`
- **Cookie Store**: Manages Forms authentication sessions
- **Auth Injector**: Handles different authentication types
- **Content Rewriting**: Modifies HTML/CSS/JS to work through proxy

## Authentication Types

### 1. None
No authentication required.

### 2. Basic Auth
HTTP Basic authentication with username/password.

### 3. API Key
Custom header-based authentication.

### 4. Bearer Token
OAuth/JWT token authentication.

### 5. Forms Authentication (NEW)
For services like Radarr/Sonarr that use form-based login:
- Automatically authenticates when session expires
- Stores cookies in memory for the session
- Re-authenticates transparently on 401/302 redirects
- Example config:
```json
{
  "id": "radarr",
  "auth": {
    "type": "forms",
    "username": "your-username",
    "password": "your-password"
  }
}
```

## Proxy Flow

1. **Request**: Client → `/api/proxy/[serviceId]/path`
2. **Authentication**: 
   - Check if Forms auth needed → Authenticate if required
   - Inject appropriate auth headers/cookies
3. **Forward**: Proxy request to actual service
4. **Response Processing**:
   - Store cookies from Forms auth services
   - Rewrite URLs in HTML/CSS/JS
   - Handle redirects (re-auth if needed)
5. **Return**: Modified response to client

## Content Rewriting

The proxy rewrites content to ensure all resources load through the proxy:

### HTML
- `href="/path"` → `href="/api/proxy/[serviceId]/path"`
- `src="/path"` → `src="/api/proxy/[serviceId]/path"`
- Form actions and JavaScript API calls

### CSS
- `url(/path)` → `url(/api/proxy/[serviceId]/path)`

### JavaScript
- Fetch/Axios API calls
- SignalR hub connections
- Window configuration objects (Radarr/Sonarr)

## Cookie Management

For Forms authentication:
1. Cookies stored in memory per service
2. Automatic cleanup on session expiry
3. Re-authentication on 401/redirect to login
4. Domain/path rewriting for cross-domain compatibility

## Deployment

### Docker
Multi-stage build:
1. Build stage: Node.js for React Router SSR compatibility
2. Runtime: Node.js with Bun installed globally

### GitHub Actions
Automated builds to GitHub Container Registry (ghcr.io)

### Ansible
Deployment via generic-container role with Traefik routing

## Configuration

Services configured via `/config/config.json`:
```json
{
  "app": {
    "title": "Satsang Home",
    "theme": "dark"
  },
  "services": [
    {
      "id": "service-id",
      "name": "Service Name",
      "url": "http://service-url",
      "auth": {
        "type": "forms|basic|apikey|bearer|none",
        // ... auth details
      },
      "openInNewTab": false  // Optional: true to open in new tab instead of iframe
    }
  ]
}
```

### Service Options

- **openInNewTab**: When set to `true`, clicking the service in the sidebar opens it in a new browser tab instead of the embedded iframe. Useful for services that don't work well in iframes (e.g., services with complex authentication flows or those that explicitly block iframe embedding).

## Security Considerations

- No sensitive data in public repository
- Authentication credentials stored only in local config
- Cookies isolated per service
- Headers sanitized to prevent leaks
- CSP and X-Frame-Options removed to allow iframe embedding