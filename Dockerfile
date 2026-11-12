FROM node:22-slim AS deps

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile --ignore-scripts


FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_SSO_PORTAL_URL
ENV NEXT_PUBLIC_SSO_PORTAL_URL=$NEXT_PUBLIC_SSO_PORTAL_URL

RUN pnpm run build


FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN addgroup --system --gid 1001 portal-app && \
    adduser --system --uid 1001 portal-app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
RUN rm -rf /app/public/uploads && ln -sfn /app/storage/app/uploads /app/public/uploads

RUN mkdir -p storage/logs /home/portal-app/.cache/node /app/storage/app/uploads && \
    chown -R portal-app:portal-app /app /home/portal-app/.cache

RUN apt-get update && apt-get install -y gosu && rm -rf /var/lib/apt/lists/*

COPY --chmod=755 entrypoint.sh /app/entrypoint.sh

ENV COREPACK_HOME=/home/portal-app/.cache/node

EXPOSE 3011

ENV PORT=3011

CMD ["/app/entrypoint.sh"]
