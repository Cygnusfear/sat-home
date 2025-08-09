# Satsang Home

A lightweight, self-hosted dashboard for managing and accessing your home lab services through a unified interface. Built with React Router v7, TypeScript, and Bun.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)

## Features

- 🖼️ **Iframe Integration** - Access all your services directly within the dashboard without switching tabs
- 🔍 **Smart Command Palette** - Quick search with Cmd+K, filter by service names or tags
- 🎯 **Persistent State** - Services maintain their state when switching between them (no reloading)
- 🐳 **Docker Ready** - Simple deployment with volume mounts for config and icons

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (for development)
- Docker (for production deployment)
- A reverse proxy (Traefik, Nginx, etc.) for HTTPS in production

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/satsang-home.git
cd satsang-home
```

2. Install dependencies:
```bash
bun install
```

3. Create your configuration:
```bash
cp config/config.example.json config/config.json
# Edit config/config.json with your services
```

4. Add service icons to `public/images/`:
```bash
# Add your service icons (PNG, SVG, JPG, WebP supported)
cp your-icons/*.png public/images/
```

5. Start the development server:
```bash
bun run dev
```

Your dashboard will be available at `http://localhost:5173`

## Configuration

### Basic Structure

```json
{
  "app": {
    "title": "My Home Dashboard",
    "theme": "dark",
    "defaultService": "home",
    "icon": "/images/logo.png"
  },
  "services": [
    {
      "id": "service-id",
      "name": "Service Name",
      "url": "https://service.example.com",
      "icon": "/images/service.png",
      "description": "Service description",
      "tags": ["category1", "category2"],
      "order": 1,
      "auth": { "type": "none" },
      "openInNewTab": false,
      "useProxy": false
    }
  ]
}
```

### Service Options

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the service |
| `name` | string | Display name |
| `url` | string | Service URL |
| `icon` | string | Path to icon in `/images/` folder |
| `description` | string | Optional description |
| `tags` | string[] | Categories for search/filtering |
| `order` | number | Sort order in sidebar |
| `auth` | object | Authentication configuration |
| `openInNewTab` | boolean | Open in new tab instead of iframe |
| `useProxy` | boolean | Route through backend proxy |

### Authentication

Authentication headers are injected when `useProxy: true` is enabled. For direct iframe loading (default), services handle authentication through cookies or SSO.

#### Supported Authentication Types

```json
// No authentication
{ "type": "none" }

// Basic Authentication (requires useProxy: true)
{
  "type": "basic",
  "username": "admin",
  "password": "password"
}

// API Key (requires useProxy: true)
{
  "type": "apikey",
  "header": "X-API-Key",
  "value": "your-api-key"
}

// Bearer Token (requires useProxy: true)
{
  "type": "bearer",
  "value": "your-token"
}

// Form-based Login (requires useProxy: true)
{
  "type": "forms",
  "username": "admin",
  "password": "password"
}
```

**Notes:**
- Services behind a reverse proxy with SSO typically use `"type": "none"`
- Enable `useProxy: true` when authentication headers are required
- Form-based authentication stores cookies for session persistence

## Docker Deployment

### Using Docker Run

```bash
# Build the image
docker build -t satsang-home .

# Run with mounted config and images
docker run -d \
  --name satsang-home \
  -p 3000:3000 \
  -v /path/to/config:/config \
  -v /path/to/images:/app/public/images \
  satsang-home
```

### Using Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  satsang-home:
    image: ghcr.io/yourusername/satsang-home:latest
    container_name: satsang-home
    ports:
      - "3000:3000"
    volumes:
      - ./config:/config
      - ./images:/app/public/images
    restart: unless-stopped
```

Then run:
```bash
docker-compose up -d
```

### Using Pre-built Images

Pre-built images are available on GitHub Container Registry:

```bash
docker pull ghcr.io/cygnusfear/sat-home:latest
```

## Production Setup

### Directory Structure

```
/your/app/path/
├── config/
│   └── config.json      # Your service configuration
└── images/              # Service icons
    ├── jellyfin.png
    ├── portainer.png
    └── ...
```

### Reverse Proxy Configuration

Example Traefik labels for docker-compose:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.satsang.rule=Host(`home.example.com`)"
  - "traefik.http.routers.satsang.tls=true"
  - "traefik.http.services.satsang.loadbalancer.server.port=3000"
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `CONFIG_PATH` | Path to config file | /config/config.json |

## Keyboard Shortcuts

- **Cmd/Ctrl + K** - Open command palette for searching services
- **Cmd/Ctrl + B** - Toggle sidebar visibility
- These shortcuts work even when iframes have focus!

## Managing Icons

Icons should be placed in the `public/images/` directory (or mounted volume in Docker):

```bash
# Development
cp my-service-icon.png public/images/

# Production (with Docker)
cp my-service-icon.png /path/to/mounted/images/
```

Then reference in config:
```json
{
  "icon": "/images/my-service-icon.png"
}
```

## Development

### Tech Stack

- **Frontend**: React 18, React Router v7, TypeScript
- **Backend**: Bun with Elysia
- **Styling**: TailwindCSS
- **Build**: Vite
- **Package Manager**: Bun

### Project Structure

```
src/
├── components/         # React components
│   ├── command.tsx    # Command palette
│   ├── sidebar/       # Sidebar navigation
│   └── service-*      # Service-related components
├── layouts/           # Layout components
├── routes/            # React Router routes
└── server/           # Backend API server
```

### Commands

```bash
# Development
bun run dev           # Start dev server

# Building
bun run build         # Build for production
bun run start         # Start production server

# Docker
docker build -t satsang-home .     # Build Docker image
```

## Troubleshooting

### Services not loading in iframe
- Check CORS settings on your services
- Some services may require `X-Frame-Options` to be disabled
- Try enabling `useProxy: true` for problematic services

### Authentication issues
- Ensure credentials in config.json are correct
- Some services may require specific auth headers
- Check browser console for detailed error messages

### Keyboard shortcuts not working
- The focus management system should capture shortcuts even in iframes
- If issues persist, click outside the iframe first

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [React Router](https://reactrouter.com/)
- Powered by [Bun](https://bun.sh)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Command palette by [cmdk](https://cmdk.paco.me/)

---

Built with ❤️ for the self-hosting community