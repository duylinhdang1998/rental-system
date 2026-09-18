#!/bin/sh
# Applies the forward-only Prisma migrations, then runs the container command.
# One-off commands (`docker compose run --rm api node dist/cli/seed-owner.main.js`) pass
# through the same entrypoint; `SKIP_MIGRATIONS=true` skips the migration step.
set -eu

if [ "${SKIP_MIGRATIONS:-false}" != "true" ]; then
  echo '{"event":"migrate.deploy.start"}'
  prisma migrate deploy --schema /app/apps/api/prisma/schema.prisma
  echo '{"event":"migrate.deploy.done"}'
fi

exec "$@"
