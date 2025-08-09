# Ansible Setup for Satsang Home

## Directory Structure on Host

After deploying with Ansible, your host should have:

```
{{ base_path }}/services/satsang_home/
├── config/
│   └── config.json       # Your service configuration
└── images/              # Service icons (new)
    ├── jellyfin.png
    ├── radarr.png
    ├── sonarr.png
    └── ...
```

## Update Your Ansible Variables

In your `vars/services.yml`, update the satsang_home service:

```yaml
satsang_home:
  name: "satsang_home"
  enabled: true
  image: "ghcr.io/cygnusfear/sat-home"
  version: "latest"
  host: "home.{{ domain }}"
  use_auth: true
  use_tinyauth: false
  directories:
    - "{{ base_path }}/services/satsang_home"
    - "{{ base_path }}/services/satsang_home/config"
    - "{{ base_path }}/services/satsang_home/images"  # Add this
  volumes_mount:
    - "{{ base_path }}/services/satsang_home/config:/config"
    - "{{ base_path }}/services/satsang_home/images:/app/public/images"  # Add this
  traefik:
    port: 3000
```

## Managing Icons

1. **Add new icons**: Simply drop PNG/SVG files into `{{ base_path }}/services/satsang_home/images/`
2. **Update config.json**: Reference icons as `/images/filename.png`
3. **No rebuild needed**: Icons are served directly from the mounted volume

## Benefits

- **Separation**: Config stays private while images are public
- **Flexibility**: Update icons without rebuilding Docker image
- **Persistence**: Icons persist across container updates
- **Security**: Config file remains unexposed to public

## Example Icon Management

```bash
# Copy a new icon to the server
scp new-service-icon.png server:{{ base_path }}/services/satsang_home/images/

# Update config.json to reference it
{
  "services": [{
    "icon": "/images/new-service-icon.png",
    ...
  }]
}
```

## Notes

- Icons should be reasonable size (< 500KB recommended)
- Supported formats: PNG, SVG, JPG, WebP
- Icons are served at `/images/*` path in the application
- The `/app/public` directory in the container is the React app's public folder