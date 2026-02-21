# ─────────────────────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install OS-level build deps (needed for bcrypt native addon)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package manifests first for layer caching
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev, needed for build)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript → dist/
RUN npm run build

# Verify the build produced dist/main.js (fail fast with clear output if not)
RUN echo "=== dist/ contents ==" && find dist -type f -name '*.js' | head -20 && test -f dist/main.js

# ─────────────────────────────────────────────────────────────
# Stage 2: Production runtime
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache tini

WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install ONLY production dependencies
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi && npm cache clean --force

# Generate Prisma client for production image
RUN npx prisma generate

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose the API port
EXPOSE 3001

# Use tini as PID 1 for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Run prisma migrate deploy then start the app
# NOTE: migrations are handled by deploy.sh in a dedicated temp container
# before this container ever starts — so we just start the app directly.
CMD ["node", "dist/main.js"]
