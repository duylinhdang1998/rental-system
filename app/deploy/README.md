# Deployment

Production runs on one Ubuntu host (`51.79.255.102`) that already serves other projects the
same way: Docker Compose per project under `/home/ubuntu/<project>/`, a web container bound
to `127.0.0.1:<port>`, the host nginx in front with certbot certificates, and one shared
Postgres container (`global_postgres`, network `global_db_net`).

| Piece                      | Location                                                            |
| -------------------------- | ------------------------------------------------------------------- |
| Images                     | `ghcr.io/duylinhdang1998/rental-system-api`, `…/rental-system-web`  |
| Compose project            | `~/rental-system/docker-compose.yml` (+ `.env`, mode 0600)          |
| Return photos              | `~/rental-system/data/private` → `/data/private` in the API         |
| Database                   | `rental_system`, role `rental`, inside `global_postgres`            |
| Backups                    | `~/rental-system/backups/` (daily 02:15 UTC via cron, 14 days)      |
| Public entry               | `https://rental.vfmtech.vn` → host nginx → `127.0.0.1:8180` → web   |
| Owner bootstrap credential | `~/rental-system/owner-credentials.txt` (0600, delete after change) |

## Files

- `Dockerfile` — one build graph, targets `api` (Node 24, Prisma migrate on start) and `web`
  (nginx serving the admin bundle and proxying `/api/` to the API container).
- `api-entrypoint.sh` — runs `prisma migrate deploy`, then the container command.
- `web-nginx.conf` — SPA fallback, `/api/` proxy, 16 MB upload ceiling.
- `docker-compose.prod.yml` — the stack; copied to `~/rental-system/docker-compose.yml`.
- `docker-compose.build.yml` — build override for building on the host from `~/rental-system/src`.
- `server-setup.sh` — idempotent host preparation (directories, DB role/database, `.env`,
  host nginx site, backup cron). Secrets are generated once and never printed.
- `host-nginx.conf` — template for the host nginx site (HTTP; certbot adds HTTPS).
- `backup.sh` — `pg_dump` through the Postgres container, gzip + sha256 + retention.
- `.env.production.example` — shape of the production `.env`.

## First deploy (already performed once, kept for rebuilds)

```bash
# on the workstation
git archive --format=tar.gz -o rental-src.tgz HEAD app
scp -i ~/.ssh/id_ed25519 rental-src.tgz ubuntu@51.79.255.102:~/rental-system/
# on the host
mkdir -p ~/rental-system/src && tar -xzf ~/rental-system/rental-src.tgz --strip-components=1 -C ~/rental-system/src
DOMAIN=rental.vfmtech.vn ~/rental-system/src/deploy/server-setup.sh
cd ~/rental-system
docker compose -f docker-compose.yml -f docker-compose.build.yml build
docker compose up -d
docker compose run --rm -e SEED_OWNER_USERNAME=owner -e SEED_OWNER_NAME='Chủ xe' \
  -e SEED_OWNER_PASSWORD="$(openssl rand -base64 18)" api node dist/cli/seed-owner.main.js
curl -fsS http://127.0.0.1:8180/api/health/ready
```

## Continuous delivery

`.github/workflows/deploy.yml` (repository root) runs on every push to `main` and on
manual dispatch:

1. `quality-gates` (`.github/workflows/ci.yml` via `workflow_call`): audit, format, lint,
   typecheck, unit + coverage, build, Playwright.
2. Build both images with Buildx and push `sha-<7>` plus `latest` to GHCR.
3. SSH to the host, pin `TAG=sha-<7>` in `.env`, `docker compose pull && up -d`, wait for
   `/api/health/ready`, smoke `/api/health` and `/`.

Secrets to configure once under **Settings → Secrets and variables → Actions**:

| Secret           | Value                                                                  |
| ---------------- | ---------------------------------------------------------------------- |
| `DEPLOY_HOST`    | `51.79.255.102`                                                        |
| `DEPLOY_USER`    | `ubuntu`                                                               |
| `DEPLOY_SSH_KEY` | private half of the `rental-system-github-deploy` key (public half is in the host's `authorized_keys`) |

The GHCR packages must be readable by the host: the host already holds a `ghcr.io` login in
`~/.docker/config.json`; if the packages are private, that token needs `read:packages` for
the `rental-system-*` packages, or set the packages to public.

## Rollback

```bash
cd ~/rental-system
sed -i 's/^TAG=.*/TAG=sha-<previous>/' .env
docker compose pull --quiet && docker compose up -d
```

Migrations are forward-only; restore a backup only when a migration must be undone
(`ops/runbooks/deploy-rollback.md`).

## TLS

Point `rental.vfmtech.vn` (A record) at `51.79.255.102`, then on the host run
`sudo certbot --nginx -d rental.vfmtech.vn`. The session cookie carries `Secure`, so the
browser only logs in over HTTPS.
