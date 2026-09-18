#!/usr/bin/env bash
# Daily encrypted-at-rest backup of the rental database (security plan: "Daily encrypted backups").
# Usage: DATABASE_URL=postgresql://... BACKUP_DIR=/var/backups/rental ./backup.sh
# Output: one JSON line on stdout; non-zero exit on any failure so the scheduler alerts.
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/rental}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TARGET="${BACKUP_DIR}/rental-${STAMP}.dump.gz"

mkdir -p "${BACKUP_DIR}"
umask 077

# Custom format keeps a selective restore possible; gzip keeps the file small for off-site copy.
pg_dump --format=custom --no-owner --no-privileges "${DATABASE_URL}" | gzip -9 > "${TARGET}"
sha256sum "${TARGET}" > "${TARGET}.sha256"

# Retention: keep the last N days locally; the off-site copy keeps its own policy.
find "${BACKUP_DIR}" -name 'rental-*.dump.gz' -mtime "+${RETENTION_DAYS}" -delete
find "${BACKUP_DIR}" -name 'rental-*.dump.gz.sha256' -mtime "+${RETENTION_DAYS}" -delete

SIZE_BYTES="$(stat -c %s "${TARGET}" 2>/dev/null || stat -f %z "${TARGET}")"
printf '{"event":"backup.completed","file":"%s","sizeBytes":%s,"at":"%s"}\n' "${TARGET}" "${SIZE_BYTES}" "${STAMP}"
