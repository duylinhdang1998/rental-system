#!/usr/bin/env bash
# Idempotent host preparation for the rental system on the shared Ubuntu server.
# Run as the `ubuntu` user (docker group + sudo) from ~/rental-system/src/deploy:
#   DOMAIN=rental.vfmtech.vn ./server-setup.sh
# It creates the application directory, the Postgres role and database inside the
# `global_postgres` container, the production .env (secrets generated once), the host nginx
# site, the daily backup cron entry and copies the compose files. Secrets are never printed.
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/rental-system}"
DOMAIN="${DOMAIN:-rental.vfmtech.vn}"
WEB_PORT="${WEB_PORT:-8180}"
DB_NAME="${DB_NAME:-rental_system}"
DB_USER="${DB_USER:-rental}"
DB_CONTAINER="${DB_CONTAINER:-global_postgres}"
DB_HOST="${DB_HOST:-global_postgres}"
SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"

umask 077
mkdir -p "$APP_DIR/data/private" "$APP_DIR/backups"
chmod 700 "$APP_DIR/data" "$APP_DIR/data/private"

# ---------------------------------------------------------------- .env (generated once)
ENV_FILE="$APP_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  DB_PASSWORD="$(openssl rand -hex 24)"
  SESSION_SECRET="$(openssl rand -hex 32)"
  sed -e "s#^DATABASE_URL=.*#DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}?schema=public#" \
      -e "s#^SESSION_SECRET=.*#SESSION_SECRET=${SESSION_SECRET}#" \
      -e "s#^CORS_ORIGINS=.*#CORS_ORIGINS=https://${DOMAIN}#" \
      -e "s#^WEB_PORT=.*#WEB_PORT=${WEB_PORT}#" \
      "$SOURCE_DIR/.env.production.example" > "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo '{"event":"env.created"}'
else
  echo '{"event":"env.kept"}'
fi
DB_PASSWORD="$(sed -nE 's#^DATABASE_URL=postgresql://[^:]+:([^@]+)@.*#\1#p' "$ENV_FILE")"
[ -n "$DB_PASSWORD" ] || { echo 'DATABASE_URL in .env is not in the expected form' >&2; exit 1; }

# ---------------------------------------------------------------- Postgres role + database
psql_admin() {
  docker exec -i "$DB_CONTAINER" sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres -Atq "$@"' -- "$@"
}
ROLE_EXISTS="$(psql_admin -c "select 1 from pg_roles where rolname = '${DB_USER}'")"
if [ "$ROLE_EXISTS" != "1" ]; then
  psql_admin -c "create role ${DB_USER} login password '${DB_PASSWORD}'"
  echo '{"event":"db.role.created"}'
else
  psql_admin -c "alter role ${DB_USER} with login password '${DB_PASSWORD}'"
  echo '{"event":"db.role.kept"}'
fi
DB_EXISTS="$(psql_admin -c "select 1 from pg_database where datname = '${DB_NAME}'")"
if [ "$DB_EXISTS" != "1" ]; then
  psql_admin -c "create database ${DB_NAME} owner ${DB_USER}"
  echo '{"event":"db.created"}'
else
  echo '{"event":"db.kept"}'
fi

# ---------------------------------------------------------------- compose + backup files
cp "$SOURCE_DIR/docker-compose.prod.yml" "$APP_DIR/docker-compose.yml"
cp "$SOURCE_DIR/docker-compose.build.yml" "$APP_DIR/docker-compose.build.yml"
cp "$SOURCE_DIR/backup.sh" "$APP_DIR/backup.sh"
chmod 755 "$APP_DIR/backup.sh"
chmod 644 "$APP_DIR/docker-compose.yml" "$APP_DIR/docker-compose.build.yml"

CRON_LINE="15 2 * * * $APP_DIR/backup.sh >> $APP_DIR/backups/backup.log 2>&1"
if ! crontab -l 2>/dev/null | grep -Fq "$APP_DIR/backup.sh"; then
  (crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -
  echo '{"event":"cron.backup.installed"}'
fi

# ---------------------------------------------------------------- host nginx site
SITE="/etc/nginx/sites-available/${DOMAIN}.conf"
if [ ! -f "$SITE" ]; then
  sed -e "s#__DOMAIN__#${DOMAIN}#g" -e "s#__WEB_PORT__#${WEB_PORT}#g" "$SOURCE_DIR/host-nginx.conf" \
    | sudo tee "$SITE" > /dev/null
  sudo ln -sf "$SITE" "/etc/nginx/sites-enabled/${DOMAIN}.conf"
  sudo nginx -t
  sudo systemctl reload nginx
  echo '{"event":"nginx.site.installed"}'
else
  echo '{"event":"nginx.site.kept"}'
fi

echo "{\"event\":\"setup.done\",\"appDir\":\"$APP_DIR\",\"domain\":\"$DOMAIN\",\"webPort\":$WEB_PORT}"
