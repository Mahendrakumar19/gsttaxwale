# Multi-stage Dockerfile to build Next frontend and run Express + Next backend together
FROM node:20 AS builder
WORKDIR /build/frontend

# Copy frontend sources and build
COPY frontend/package.json frontend/package-lock.json* ./
COPY frontend/next.config.js frontend/tsconfig.json ./
COPY frontend/public ./public
COPY frontend/ .

RUN npm ci --prefer-offline --no-audit
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

# Copy backend code
COPY backend ./backend

# Prepare directory where server.js expects the frontend
RUN mkdir -p /app/public_html/frontend

# Copy built frontend from builder
COPY --from=builder /build/frontend/.next /app/public_html/frontend/.next
COPY --from=builder /build/frontend/public /app/public_html/frontend/public
COPY --from=builder /build/frontend/package.json /app/public_html/frontend/package.json
COPY --from=builder /build/frontend/node_modules /app/public_html/frontend/node_modules

WORKDIR /app/backend

# Install backend production dependencies
RUN npm ci --only=production

# If Prisma is used, attempt to generate client (no-op if not configured)
RUN npx prisma generate || true

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
