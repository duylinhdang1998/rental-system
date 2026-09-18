#!/usr/bin/env bash
# Daily dump of the rental database through the shared Postgres container (the host has no
# pg_dump). Same output contract as ops/backup/backup.sh: custom format, gzip, sha256,
# retention, one JSON line. Installed to ~/rental-system/backup.sh by server-setup.sh.
set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")" && pwd)}"
BACKUP_DIR="${BACKUP_DIR:-$APP_DIR/backups}"
DB_CONTAINER="${DB_CONTAINER:-global_postgres}"
DB_NAME="${DB_NAME:-rental_system}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TARGET="${BACKUP_DIR}/rental-${STAMP}.dump.gz"

mkdir -p "$BACKUP_DIR"
umask 077

docker exec "$DB_CONTAINER" sh -c 'pg_dump --format=custom --no-owner --no-privileges -U "$POSTGRES_USER" "$0"' "$DB_NAME" \
  | gzip -9 > "$TARGET"
sha256sum "$TARGET" > "$TARGET.sha256"

find "$BACKUP_DIR" -name 'rental-*.dump.gz' -mtime "+${RETENTION_DAYS}" -delete
find "$BACKUP_DIR" -name 'rental-*.dump.gz.sha256' -mtime "+${RETENTION_DAYS}" -delete

SIZE_BYTES="$(stat -c %s "$TARGET")"
printf '{"event":"backup.completed","file":"%s","sizeBytes":%s,"at":"%s"}\n' "$TARGET" "$SIZE_BYTES" "$STAMP"
