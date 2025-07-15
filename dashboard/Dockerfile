# Builder
FROM oven/bun:alpine AS builder
WORKDIR /app
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Runner
FROM oven/bun:alpine AS runtime
RUN apk add --no-cache dumb-init
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000').then(() => process.exit(0)).catch(() => process.exit(1))"
ENTRYPOINT ["dumb-init", "--"]
CMD ["bunx", "serve", "dist"]
