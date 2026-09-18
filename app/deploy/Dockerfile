# syntax=docker/dockerfile:1.7
# One build graph, two runtime targets:
#   docker build -f deploy/Dockerfile --target api -t rental-system-api .
#   docker build -f deploy/Dockerfile --target web -t rental-system-web .
# The build context is the `app/` directory (the npm workspace root).

# ---------------------------------------------------------------- dependencies
FROM node:24-bookworm-slim AS deps
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false NPM_CONFIG_FUND=false CHECKPOINT_DISABLE=1
# Lockfile plus every workspace manifest so `npm ci` resolves the whole tree once.
COPY package.json package-lock.json ./
COPY packages/contracts/package.json packages/contracts/
COPY apps/api/package.json apps/api/
COPY apps/admin/package.json apps/admin/
RUN npm ci --no-audit

# ---------------------------------------------------------------- shared contracts
FROM deps AS contracts
COPY tsconfig.base.json ./
COPY packages/contracts packages/contracts
RUN npm run build --workspace @rental/contracts

# ---------------------------------------------------------------- API build
FROM contracts AS api-build
COPY apps/api apps/api
RUN cd apps/api && npx prisma generate \
 && cd /app && npm run build --workspace @rental/api \
 && npm prune --omit=dev --no-audit

# ---------------------------------------------------------------- API runtime
FROM node:24-bookworm-slim AS api
ENV NODE_ENV=production CHECKPOINT_DISABLE=1 NPM_CONFIG_UPDATE_NOTIFIER=false
# openssl for the Prisma engines; the Prisma CLI runs `migrate deploy` at start-up.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && npm install -g prisma@6.12.0 \
 && npm cache clean --force
WORKDIR /app
COPY --from=api-build /app/package.json ./
COPY --from=api-build /app/node_modules ./node_modules
COPY --from=api-build /app/packages/contracts/package.json ./packages/contracts/
COPY --from=api-build /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=api-build /app/apps/api/package.json ./apps/api/
COPY --from=api-build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=api-build /app/apps/api/dist ./apps/api/dist
COPY --from=api-build /app/apps/api/prisma ./apps/api/prisma
COPY deploy/api-entrypoint.sh /usr/local/bin/api-entrypoint
RUN sed -i 's/\r$//' /usr/local/bin/api-entrypoint \
 && chmod +x /usr/local/bin/api-entrypoint \
 && mkdir -p /data/private \
 && chown -R node:node /data
USER node
WORKDIR /app/apps/api
EXPOSE 3000
ENTRYPOINT ["api-entrypoint"]
CMD ["node", "dist/bootstrap.js"]

# ---------------------------------------------------------------- admin build
FROM contracts AS web-build
COPY apps/admin apps/admin
RUN npm run build --workspace @rental/admin

# ---------------------------------------------------------------- admin runtime
FROM nginx:1.27-alpine AS web
COPY deploy/web-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=web-build /app/apps/admin/dist /usr/share/nginx/html
EXPOSE 80
