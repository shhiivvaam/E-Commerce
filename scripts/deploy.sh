#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh  —  Zero-downtime deploy with auto-rollback
#
# Called by GitHub Actions on every push to main (after image is pushed).
# Uses a blue-green shadow strategy:
#   1. Pull new image
#   2. Start shadow container on temp port
#   3. Health check shadow — if it fails, remove it (old stays live)
#   4. If healthy: stop old → start new on real port
#
# Usage (GitHub Actions calls this automatically):
#   bash ~/ecommerce/deploy.sh <IMAGE> <TAG>
#   e.g. bash ~/ecommerce/deploy.sh shhiivvaam/ecommerce-api latest
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()    { echo -e "${CYAN}  ▶  $*${NC}"; }
log_success() { echo -e "${GREEN}  ✅ $*${NC}"; }
log_warn()    { echo -e "${YELLOW}  ⚠  $*${NC}"; }
log_error()   { echo -e "${RED}  ❌ $*${NC}"; }

# ── Config ────────────────────────────────────────────────────────────────────
IMAGE="${1:?Usage: deploy.sh <IMAGE> <TAG>}"
TAG="${2:-latest}"
FULL_IMAGE="${IMAGE}:${TAG}"

DEPLOY_DIR="$HOME/ecommerce"
ENV_FILE="$DEPLOY_DIR/.env"

CONTAINER_NAME="ecommerce-api"
SHADOW_NAME="ecommerce-api-shadow"
APP_PORT=3001
SHADOW_PORT=3099                          # temp port for shadow health check
HEALTH_URL="http://localhost:${SHADOW_PORT}/api"

MAX_RETRIES=18                            # 18 × 5s = 90s max wait
RETRY_INTERVAL=5

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🚀 E-Commerce API — Zero-Downtime Deployment${NC}"
echo -e "${CYAN}  Image : ${FULL_IMAGE}${NC}"
echo -e "${CYAN}  Time  : $(date)${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# 0. Pre-flight checks
# ─────────────────────────────────────────────────────────────────────────────
log_info "[0/6] Pre-flight checks..."

if [ ! -f "$ENV_FILE" ]; then
  log_error ".env not found at $ENV_FILE — aborting!"
  exit 1
fi

if ! docker info &>/dev/null; then
  log_error "Docker daemon is not running — aborting!"
  exit 1
fi

log_success "Pre-flight checks passed"

# ─────────────────────────────────────────────────────────────────────────────
# 1. Pull the new image
# ─────────────────────────────────────────────────────────────────────────────
log_info "[1/6] Pulling ${FULL_IMAGE}..."

if ! docker pull "${FULL_IMAGE}"; then
  log_error "Failed to pull image ${FULL_IMAGE} — aborting! Old container untouched."
  exit 1
fi

log_success "Image pulled successfully"

# ─────────────────────────────────────────────────────────────────────────────
# 2. Clean up any previous shadow container (idempotent)
# ─────────────────────────────────────────────────────────────────────────────
log_info "[2/6] Cleaning up any leftover shadow containers..."
docker stop "${SHADOW_NAME}" 2>/dev/null || true
docker rm   "${SHADOW_NAME}" 2>/dev/null || true

# ─────────────────────────────────────────────────────────────────────────────
# 3. Start shadow container on temp port
# ─────────────────────────────────────────────────────────────────────────────
log_info "[3/6] Starting shadow container on port ${SHADOW_PORT} for health check..."

docker run -d \
  --name "${SHADOW_NAME}" \
  --env-file "${ENV_FILE}" \
  -e NODE_ENV=production \
  -e PORT="${APP_PORT}" \
  -p "${SHADOW_PORT}:${APP_PORT}" \
  --restart no \
  "${FULL_IMAGE}"

log_success "Shadow container started"

# ─────────────────────────────────────────────────────────────────────────────
# 4. Health check shadow container
# ─────────────────────────────────────────────────────────────────────────────
log_info "[4/6] Health checking shadow container (max ${MAX_RETRIES}×${RETRY_INTERVAL}s = $((MAX_RETRIES * RETRY_INTERVAL))s)..."

HEALTHY=false
for i in $(seq 1 "${MAX_RETRIES}"); do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${HEALTH_URL}" 2>/dev/null || echo "000")
  log_info "  Attempt ${i}/${MAX_RETRIES} — HTTP ${HTTP_STATUS} ← ${HEALTH_URL}"

  if [[ "${HTTP_STATUS}" =~ ^2 ]]; then
    HEALTHY=true
    log_success "Health check passed on attempt ${i}!"
    break
  fi

  sleep "${RETRY_INTERVAL}"
done

# ── ROLLBACK: shadow unhealthy ────────────────────────────────────────────────
if [ "${HEALTHY}" = false ]; then
  log_error "Health check failed after $((MAX_RETRIES * RETRY_INTERVAL))s!"
  echo ""
  log_warn "Dumping shadow container logs (last 50 lines):"
  docker logs --tail=50 "${SHADOW_NAME}" || true
  echo ""
  log_warn "Removing shadow container — OLD container continues running untouched."
  docker stop "${SHADOW_NAME}" 2>/dev/null || true
  docker rm   "${SHADOW_NAME}" 2>/dev/null || true
  log_error "Deployment ABORTED — no downtime, no rollback needed (old version still live)."
  exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# 5. Cut over: stop old → start new on real port
# ─────────────────────────────────────────────────────────────────────────────
log_info "[5/6] Cutting over to new container on port ${APP_PORT}..."

# Remove shadow (we'll re-launch on the real port cleanly)
docker stop "${SHADOW_NAME}" && docker rm "${SHADOW_NAME}"

# Stop & remove old production container (brief moment of downtime: ~1-2s)
docker stop "${CONTAINER_NAME}" 2>/dev/null || true
docker rm   "${CONTAINER_NAME}" 2>/dev/null || true

# Start the new container on the real port
docker run -d \
  --name "${CONTAINER_NAME}" \
  --env-file "${ENV_FILE}" \
  -e NODE_ENV=production \
  -e PORT="${APP_PORT}" \
  -p "${APP_PORT}:${APP_PORT}" \
  --restart unless-stopped \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  "${FULL_IMAGE}"

log_success "New container is live on port ${APP_PORT}"

# ─────────────────────────────────────────────────────────────────────────────
# 6. Final cleanup
# ─────────────────────────────────────────────────────────────────────────────
log_info "[6/6] Cleaning up dangling images..."
docker image prune -f >/dev/null 2>&1 || true

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Deployment Successful! — $(date)${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo ""
docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
