#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh  —  Production Blue-Green Deployment with Auto-Rollback
#
# Strategy:
#   0. Pre-flight checks
#   1. Pre-cleanup (dangling images, stopped containers)
#   2. Pull new image
#   3. Run DB migrations in a TEMP container (abort on failure — no downtime)
#   4. Start SHADOW container on temp port
#   5. Health check shadow (abort + remove shadow on failure — old stays live)
#   6. Cut over: stop old → start new on real port
#   7. Final cleanup
#
# Called by GitHub Actions via SSH. Lives at ~/ecommerce/deploy.sh on EC2.
# Usage: bash ~/ecommerce/deploy.sh <IMAGE> <TAG>
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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="${SCRIPT_DIR}"
ENV_FILE="${DEPLOY_DIR}/.env"

CONTAINER_NAME="ecommerce-api"
SHADOW_NAME="ecommerce-api-shadow"
MIGRATE_NAME="ecommerce-api-migrate"
APP_PORT=3001
SHADOW_PORT=3099
HEALTH_URL="http://localhost:${SHADOW_PORT}/health"

MAX_RETRIES=18      # 18 × 5s = 90s max wait
RETRY_INTERVAL=5

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🚀 E-Commerce API — Blue-Green Production Deployment${NC}"
echo -e "${CYAN}  Image : ${FULL_IMAGE}${NC}"
echo -e "${CYAN}  Time  : $(date)${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# 0. Pre-flight checks
# ─────────────────────────────────────────────────────────────────────────────
log_info "[0/7] Pre-flight checks..."

if [ ! -f "${ENV_FILE}" ]; then
  log_error ".env not found at ${ENV_FILE} — aborting!"
  exit 1
fi

if ! docker info &>/dev/null; then
  log_error "Docker daemon is not running — aborting!"
  exit 1
fi

log_success "Pre-flight checks passed"

# ─────────────────────────────────────────────────────────────────────────────
# 1. Pre-cleanup (only stopped containers + dangling images)
#    Running containers are preserved for rollback safety
# ─────────────────────────────────────────────────────────────────────────────
log_info "[1/7] Pre-deploy cleanup (stopped containers + dangling images)..."

docker container prune -f >/dev/null 2>&1 || true
docker image prune -f     >/dev/null 2>&1 || true

log_success "Cleanup done"

# ─────────────────────────────────────────────────────────────────────────────
# 2. Pull the new image
# ─────────────────────────────────────────────────────────────────────────────
log_info "[2/7] Pulling ${FULL_IMAGE}..."

if ! docker pull "${FULL_IMAGE}"; then
  log_error "Failed to pull image — aborting! Old container untouched."
  exit 1
fi

log_success "Image pulled"

# ─────────────────────────────────────────────────────────────────────────────
# 3. Run DB Migrations in a temp container (CRITICAL SAFETY GATE)
#    If migrations fail → abort NOW before touching the running container
# ─────────────────────────────────────────────────────────────────────────────
log_info "[3/7] Running Prisma migrations in temp container..."

docker stop  "${MIGRATE_NAME}" 2>/dev/null || true
docker rm    "${MIGRATE_NAME}" 2>/dev/null || true

if ! docker run --rm \
  --name  "${MIGRATE_NAME}" \
  --env-file "${ENV_FILE}" \
  -e NODE_ENV=production \
  "${FULL_IMAGE}" \
  npx prisma migrate deploy; then
  log_error "Migrations FAILED — aborting deployment. Old container is still live."
  exit 1
fi

log_success "Migrations applied successfully"

# ─────────────────────────────────────────────────────────────────────────────
# 4. Start shadow container on temp port
# ─────────────────────────────────────────────────────────────────────────────
log_info "[4/7] Starting shadow container on port ${SHADOW_PORT}..."

docker stop "${SHADOW_NAME}" 2>/dev/null || true
docker rm   "${SHADOW_NAME}" 2>/dev/null || true

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
# 5. Health check shadow container
#    Fail → remove shadow, old container keeps serving traffic
# ─────────────────────────────────────────────────────────────────────────────
log_info "[5/7] Health checking shadow (max ${MAX_RETRIES}×${RETRY_INTERVAL}s = $((MAX_RETRIES * RETRY_INTERVAL))s)..."

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

# ── Auto-rollback: health check failed ───────────────────────────────────────
if [ "${HEALTHY}" = false ]; then
  log_error "Health check failed after $((MAX_RETRIES * RETRY_INTERVAL))s!"
  echo ""
  log_warn "Shadow container logs (last 50 lines):"
  docker logs --tail=50 "${SHADOW_NAME}" || true
  echo ""
  docker stop "${SHADOW_NAME}" 2>/dev/null || true
  docker rm   "${SHADOW_NAME}" 2>/dev/null || true
  log_error "Deployment ABORTED — old container is still live. No downtime."
  exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# 6. Cut over: stop shadow → stop old → start new on real port
#    (~1-2s gap is the only downtime window)
# ─────────────────────────────────────────────────────────────────────────────
log_info "[6/7] Cutting over to new container on port ${APP_PORT}..."

docker stop "${SHADOW_NAME}" && docker rm "${SHADOW_NAME}"

docker stop "${CONTAINER_NAME}" 2>/dev/null || true
docker rm   "${CONTAINER_NAME}" 2>/dev/null || true

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
# 7. Final cleanup
# ─────────────────────────────────────────────────────────────────────────────
log_info "[7/7] Cleaning up old images..."
docker image prune -f >/dev/null 2>&1 || true

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Deployment Successful! — $(date)${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo ""
docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
