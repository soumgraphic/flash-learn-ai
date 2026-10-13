# Multi-stage production Dockerfile for FlashLearn AI Frontend (Next.js)
FROM node:20-alpine AS base

# Stage 1: Dependencies installation
FROM base AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

# Stage 2: Build the standalone Next.js bundle
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Minimal production runtime image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Set up app directory ownership for non-root user
RUN mkdir -p /app/public && chown -R node:node /app

# Security Hardening: Run as an unprivileged node user
USER node

# Copy only standalone output and static assets
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static



EXPOSE 3000

CMD ["node", "server.js"]
