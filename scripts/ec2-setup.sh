#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ec2-setup.sh  —  Production-grade one-time setup for EC2
#
# Supports: Amazon Linux 2023 | Ubuntu 22.04 LTS
#
# What this does:
#   1. Installs Docker + Docker Compose v2
#   2. Configures Docker daemon log rotation (prevents disk fill)
#   3. Creates a 2 GB swap file (prevents OOM crashes on small instances)
#   4. Configures OS-level firewall (UFW / firewalld)
#   5. Creates /opt/ecommerce deployment directory with safe permissions
#   6. Copies docker-compose.yml if present alongside this script
#   7. Activates docker group without requiring SSH reconnect
#
# Usage:
#   chmod +x ec2-setup.sh && ./ec2-setup.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# Resolve this script's real directory regardless of how it was invoked
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ─────────────────────────────────────────────────────────────────────────────
# 1. OS Detection + Docker Installation
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  [1/6] Detecting OS and installing Docker..."
echo "══════════════════════════════════════════════════════════════"

if command -v dnf &>/dev/null; then
  # ── Amazon Linux 2023 ────────────────────────────────────────────────────
  echo "  ▶ Amazon Linux 2023 detected"
  sudo dnf update -y
  sudo dnf install -y docker git curl

  sudo systemctl enable docker
  sudo systemctl start docker
  sudo usermod -aG docker "$USER"

  # Docker Compose v2 plugin (not available via dnf on AL2023)
  DOCKER_COMPOSE_VERSION="v2.24.7"
  sudo mkdir -p /usr/local/lib/docker/cli-plugins
  sudo curl -fsSL \
    "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-$(uname -m)" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

elif command -v apt-get &>/dev/null; then
  # ── Ubuntu 22.04 ─────────────────────────────────────────────────────────
  echo "  ▶ Ubuntu detected"
  sudo apt-get update -y
  sudo apt-get install -y ca-certificates curl gnupg lsb-release git ufw

  # Add Docker's official GPG key + apt repository
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

  sudo systemctl enable docker
  sudo systemctl start docker
  sudo usermod -aG docker "$USER"

else
  echo "❌ Unsupported OS. This script supports Amazon Linux 2023 or Ubuntu 22.04."
  exit 1
fi

echo "  ✅ Docker installed"

# ─────────────────────────────────────────────────────────────────────────────
# 2. Docker Daemon Log Rotation (CRITICAL — prevents disk exhaustion)
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  [2/6] Configuring Docker log rotation..."
echo "══════════════════════════════════════════════════════════════"

sudo mkdir -p /etc/docker
# Only write fresh config — if file already exists, show it and warn
if [ ! -f /etc/docker/daemon.json ]; then
  sudo tee /etc/docker/daemon.json >/dev/null <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
  echo "  ✅ Log rotation configured (10 MB × 3 files per container)"
else
  echo "  ⚠  /etc/docker/daemon.json already exists — verify log rotation is present:"
  echo "  ──────────────────────────────────────────"
  sudo cat /etc/docker/daemon.json
  echo "  ──────────────────────────────────────────"
  echo "  ℹ  If 'log-driver' is missing above, add it manually."
fi

sudo systemctl restart docker

# ─────────────────────────────────────────────────────────────────────────────
# 3. Swap File (prevents OOM kills on t2/t3 small/micro instances)
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  [3/6] Setting up 2 GB swap file..."
echo "══════════════════════════════════════════════════════════════"

if swapon --show | grep -q /swapfile; then
  echo "  ⚠  Swap already active on /swapfile — skipping"
else
  # fallocate is faster; dd is the bulletproof fallback for some filesystems (e.g. XFS)
  sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile

  # Make swap persist across reboots
  if ! grep -q '/swapfile' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
  fi

  echo "  ✅ 2 GB swap file created and activated"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. OS-level Firewall (defence-in-depth beyond EC2 Security Groups)
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  [4/6] Configuring OS firewall..."
echo "══════════════════════════════════════════════════════════════"

# ── Production architecture note ─────────────────────────────────────────────
# Port 3001 (API) is NOT opened in the OS firewall.
# All external traffic enters via Nginx on ports 80/443, which proxies internally
# to localhost:3001. This keeps the API port off the public internet.
# EC2 Security Group: allow 80 + 443 only (remove 3001 from inbound rules).
# ─────────────────────────────────────────────────────────────────────────────

if command -v apt-get &>/dev/null && command -v ufw &>/dev/null; then
  # Ubuntu — UFW
  # Only reset if UFW is not yet active (safe to re-run on live servers)
  if ! sudo ufw status | grep -q "Status: active"; then
    sudo ufw --force reset >/dev/null
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
  fi
  sudo ufw allow OpenSSH
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  # 3001 intentionally NOT opened publicly — Nginx proxies internally
  sudo ufw --force enable
  echo "  ✅ UFW enabled: SSH, 80, 443 open (3001 internal-only via Nginx)"

elif command -v dnf &>/dev/null; then
  # Amazon Linux 2023 — firewalld (optional but recommended)
  if ! systemctl is-active --quiet firewalld; then
    sudo dnf install -y firewalld >/dev/null 2>&1 || true
    sudo systemctl enable --now firewalld >/dev/null 2>&1 || true
  fi
  if command -v firewall-cmd &>/dev/null; then
    sudo firewall-cmd --permanent --add-service=ssh   >/dev/null
    sudo firewall-cmd --permanent --add-service=http  >/dev/null
    sudo firewall-cmd --permanent --add-service=https >/dev/null
    # 3001 intentionally NOT opened publicly — Nginx proxies internally
    sudo firewall-cmd --reload >/dev/null
    echo "  ✅ firewalld enabled: SSH, 80, 443 open (3001 internal-only via Nginx)"
  else
    echo "  ⚠  firewalld not available — relying on EC2 Security Groups only"
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# 5. Deployment Directory (secure permissions)
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  [5/6] Setting up ~/ecommerce deployment directory..."
echo "══════════════════════════════════════════════════════════════"

mkdir -p ~/ecommerce

echo "  ✅ ~/ecommerce directory created"

# Copy docker-compose.yml if it lives next to the script
COMPOSE_SRC="$SCRIPT_DIR/../docker-compose.yml"
if [ -f "$COMPOSE_SRC" ]; then
  cp "$COMPOSE_SRC" ~/ecommerce/docker-compose.yml
  echo "  ✅ docker-compose.yml copied to ~/ecommerce/"
else
  echo "  ⚠  docker-compose.yml not found at $COMPOSE_SRC"
  echo "     Copy it manually:  scp -i key.pem docker-compose.yml ubuntu@<IP>:~/ecommerce/"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 6. Verify Docker (using sudo so we don't need to re-login yet)
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  [6/6] Verifying Docker installation..."
echo "══════════════════════════════════════════════════════════════"

sudo docker --version
sudo docker compose version

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  ✅ EC2 setup complete!"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "  📌 Next steps:"
echo ""
echo "  1. Apply docker group WITHOUT logging out:"
echo "     newgrp docker"
echo ""
echo "  2. Verify .env is in place and has all required secrets:"
echo "     ls ~/ecommerce/"
echo "     grep DOCKERHUB_USERNAME ~/ecommerce/.env"
echo ""
echo "  3. Add GitHub Secrets (one-time, from your local machine):"
echo "     DOCKERHUB_USERNAME, DOCKERHUB_TOKEN"
echo "     EC2_HOST, EC2_USER, EC2_SSH_KEY"
echo ""
echo "  4. Push to main to trigger the CI/CD pipeline:"
echo "     git push origin main"
echo ""
echo "  5. Install Nginx reverse proxy (routes internet → container internally):"
echo "     sudo dnf install -y nginx   # Amazon Linux"
echo "     sudo apt  install -y nginx  # Ubuntu"
echo "     # Then configure Nginx + SSL — see DEPLOYMENT.md §1.7"
echo ""
echo "  6. After first deploy, verify health:"
echo "     curl http://localhost:3001/api"
echo "     docker compose -f ~/ecommerce/docker-compose.yml ps"
echo "     docker compose -f ~/ecommerce/docker-compose.yml logs -f api"
echo ""
echo "  🔥 API will be live at: https://<YOUR_DOMAIN>/api"
echo "  ⚠  Do NOT expose port 3001 publicly — always route via Nginx + SSL"
echo "══════════════════════════════════════════════════════════════"
