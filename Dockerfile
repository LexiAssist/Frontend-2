# ==========================================
# STAGE 1: Dependencies
# ==========================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# ==========================================
# STAGE 2: Builder
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Declare build arguments
ARG NEXT_PUBLIC_API_GATEWAY_URL
ARG NEXT_PUBLIC_API_PROXY_URL
ARG NEXT_PUBLIC_AI_PROXY_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_INGESTION_URL
ARG NEXT_PUBLIC_USE_MOCK_API=false

# Make them available as env vars during build
ENV NEXT_PUBLIC_API_GATEWAY_URL=$NEXT_PUBLIC_API_GATEWAY_URL
ENV NEXT_PUBLIC_API_PROXY_URL=$NEXT_PUBLIC_API_PROXY_URL
ENV NEXT_PUBLIC_AI_PROXY_URL=$NEXT_PUBLIC_AI_PROXY_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_INGESTION_URL=$NEXT_PUBLIC_INGESTION_URL
ENV NEXT_PUBLIC_USE_MOCK_API=$NEXT_PUBLIC_USE_MOCK_API
ENV NEXT_PUBLIC_MOCK_MODE=false
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ==========================================
# STAGE 3: Runner (Production)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
