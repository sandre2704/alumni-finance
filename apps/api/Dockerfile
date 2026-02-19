# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production=false

COPY tsconfig.json ./
COPY src ./src
COPY drizzle.config.ts ./

RUN npx tsc

# Production stage
FROM node:20-alpine AS production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY drizzle.config.ts ./

RUN mkdir -p uploads && chown appuser:nodejs uploads

USER appuser

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]
