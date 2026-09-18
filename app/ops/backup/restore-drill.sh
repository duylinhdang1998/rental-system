#!/usr/bin/env bash
# US-020 restore drill: restore the newest backup into a scratch database and verify it.
# Usage: ADMIN_DATABASE_URL=postgresql://admin@host/postgres BACKUP_DIR=/var/backups/rental ./restore-drill.sh
# Exit code is the verification result, so the drill can run from cron and alert on FAIL.
set -euo pipefail

: "${ADMIN_DATABASE_URL:?ADMIN_DATABASE_URL (a maintenance connection) is required}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/rental}"
DRILL_DB="${DRILL_DB:-rental_restore_drill}"
APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"

LATEST="$(ls -1t "${BACKUP_DIR}"/rental-*.dump.gz | head -n 1)"
[[ -n "${LATEST}" ]] || { echo '{"event":"restore.drill","status":"FAIL","reason":"no backup found"}'; exit 1; }

# Scratch database on the same server; production is never touched.
psql "${ADMIN_DATABASE_URL}" -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"${DRILL_DB}\";" -c "CREATE DATABASE \"${DRILL_DB}\";"
DRILL_URL="${ADMIN_DATABASE_URL%/*}/${DRILL_DB}"
trap 'psql "${ADMIN_DATABASE_URL}" -c "DROP DATABASE IF EXISTS \"${DRILL_DB}\";" >/dev/null' EXIT

"$(dirname "$0")/restore.sh" "${LATEST}" "${DRILL_URL}"

cd "${APP_DIR}"
DATABASE_URL="${DRILL_URL}" npm run --silent verify:restore --workspace @rental/api
