#!/usr/bin/env bash
# Restores a backup produced by backup.sh into the given database (which must already exist).
# Usage: ./restore.sh /var/backups/rental/rental-20260918T010000Z.dump.gz postgresql://.../target_db
# The checksum is verified first; --clean --if-exists makes the restore repeatable.
set -euo pipefail

DUMP="${1:?path to rental-*.dump.gz}"
TARGET_URL="${2:?target DATABASE_URL}"

if [[ -f "${DUMP}.sha256" ]]; then
  (cd "$(dirname "${DUMP}")" && sha256sum --check --quiet "$(basename "${DUMP}").sha256")
fi

gunzip -c "${DUMP}" | pg_restore --clean --if-exists --no-owner --no-privileges --dbname="${TARGET_URL}"
printf '{"event":"restore.completed","file":"%s"}\n' "${DUMP}"
