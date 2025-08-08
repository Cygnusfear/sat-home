### Bun based project

- ALWAYS use `bun` instead of `node`
- ALWAYS use `bun` instead of `npm`
- ALWAYS use `bunx` instead of `npmx`
- ALWAYS get the latest version of packages
- ALWAYS conform to the Bulletproof-React folder structure
- ALWAYS use `.docs/` as documentation folder

### Security and Privacy

- NEVER include actual domain names, URLs, or hostnames in the codebase
- NEVER commit Ansible configurations, deployment configs, or infrastructure details
- NEVER include sensitive variables, API keys, or credentials
- Keep all deployment and infrastructure configuration in separate, private repositories
- Use environment variables or config files for any URLs or domains
- The public repo should only contain application code and Dockerfile
- Replace any real domains with example.com or localhost in committed code