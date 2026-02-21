# E-Commerce Deployment Guide

> **Frontend**: Vercel  
> **Backend**: AWS EC2 via Docker  
> **Database**: Neon PostgreSQL (cloud)  
> **Cache**: Upstash Redis (cloud)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Internet                          │
└──────────────┬──────────────────────┬───────────────┘
               │                      │
       ┌───────▼──────┐      ┌────────▼────────┐
       │    Vercel    │      │   AWS EC2       │
       │  (Next.js)  │ ────▶ │  (NestJS API)  │
       │  apps/web   │      │  apps/api       │
       └─────────────┘      └────────┬────────┘
                                     │
                         ┌───────────┼───────────┐
                         │                       │
                 ┌───────▼──────┐     ┌──────────▼──────┐
                 │ Neon Postgres│     │  Upstash Redis  │
                 │  (cloud DB)  │     │   (cloud cache) │
                 └──────────────┘     └─────────────────┘
```

---

## Part 1 — Backend: Deploy to AWS EC2 with Docker

### 1.1 Create ECR Repository

In AWS Console → ECR → Create repository:

```
Repository name: ecommerce-api
Visibility:      Private
```

Note your **Registry URI** — it will look like:
`123456789.dkr.ecr.us-east-1.amazonaws.com`

### 1.2 Launch an EC2 Instance

| Setting | Value |
|---------|-------|
| AMI | Amazon Linux 2023 or Ubuntu 22.04 LTS |
| Instance type | `t3.small` (2 vCPU, 2 GB RAM) minimum |
| Storage | 20 GB gp3 |
| Key pair | Create/select your SSH key pair |

**Security Group Rules (Inbound):**

| Type | Protocol | Port | Source |
|------|----------|------|--------|
| SSH | TCP | 22 | Your IP only |
| Custom TCP | TCP | 3001 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 (if using Nginx) |

**IAM Role** — attach a role with:
- `AmazonEC2ContainerRegistryReadOnly` (to pull from ECR)

### 1.3 One-Time Server Setup

```bash
# SSH into your server
ssh -i your-key.pem ec2-user@<EC2_PUBLIC_IP>

# Clone your repo OR just copy the setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/scripts/ec2-setup.sh | bash

# OR manually run it:
chmod +x scripts/ec2-setup.sh
./scripts/ec2-setup.sh
```

### 1.4 Copy Environment Variables

On your **local machine**:

```bash
# 1. Create the production .env from the example
cp .env.production.example .env.production
# Edit .env.production and fill in real secrets

# 2. Copy it to EC2
scp -i your-key.pem .env.production ec2-user@<EC2_PUBLIC_IP>:/opt/ecommerce/.env

# 3. Copy docker-compose.yml to EC2
scp -i your-key.pem docker-compose.yml ec2-user@<EC2_PUBLIC_IP>:/opt/ecommerce/docker-compose.yml
```

### 1.5 Build and Push Image Manually (First Time)

On your **local machine**:

```bash
# Authenticate Docker with ECR
aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin \
    123456789.dkr.ecr.us-east-1.amazonaws.com

# Build the image
docker build -t ecommerce-api ./apps/api

# Tag it for ECR
docker tag ecommerce-api:latest \
  123456789.dkr.ecr.us-east-1.amazonaws.com/ecommerce-api:latest

# Push to ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/ecommerce-api:latest
```

### 1.6 Start the Container on EC2

```bash
ssh -i your-key.pem ec2-user@<EC2_PUBLIC_IP>

cd /opt/ecommerce

# Pull and start
IMAGE_TAG=123456789.dkr.ecr.us-east-1.amazonaws.com/ecommerce-api:latest
sed -i "s|image: ecommerce-api:latest|image: $IMAGE_TAG|g" docker-compose.yml

# Start (loads env from .env file automatically)
docker compose --env-file .env up -d

# Check status
docker compose ps
docker compose logs -f api
```

Your API is now accessible at: `http://<EC2_PUBLIC_IP>:3001/api`

### 1.7 (Optional) Install Nginx Reverse Proxy + SSL

```bash
# Install Nginx (Amazon Linux 2023)
sudo dnf install -y nginx certbot python3-certbot-nginx

# Create config
sudo tee /etc/nginx/conf.d/ecommerce.conf << 'EOF'
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass         http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
EOF

sudo nginx -t && sudo systemctl enable --now nginx

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com
```

---

## Part 2 — Frontend: Deploy to Vercel

### 2.1 Import the Project

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Set **Root Directory** to `apps/web`
4. Framework Preset: **Next.js** (auto-detected)

### 2.2 Set Environment Variables

In Vercel Project → **Settings → Environment Variables**:

| Variable | Value | Environments |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://<EC2_PUBLIC_IP>:3001/api` or `https://api.yourdomain.com/api` | Production, Preview |

### 2.3 Deploy

Click **Deploy**. Vercel will:
1. Run `npm install`
2. Run `npm run build`
3. Deploy to the Vercel CDN

Your frontend will be live at: `https://ecommerce-web.vercel.app`

### 2.4 Update CORS

After Vercel gives you the production URL, go back to `/opt/ecommerce/.env` on EC2 and update:

```env
FRONTEND_URL=https://your-actual-vercel-domain.vercel.app
```

Then restart the container:

```bash
cd /opt/ecommerce && docker compose restart api
```

---

## Part 3 — Automated CI/CD with GitHub Actions

The workflow at `.github/workflows/deploy-api.yml` automatically deploys on every push to `main`.

### 3.1 Add GitHub Secrets

Go to GitHub → Your Repo → **Settings → Secrets and Variables → Actions**.

Add these secrets:

| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | IAM user access key with ECR + EC2 permissions |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_REGION` | e.g. `us-east-1` |
| `ECR_REGISTRY` | e.g. `123456789.dkr.ecr.us-east-1.amazonaws.com` |
| `EC2_HOST` | Your EC2 public IP or domain |
| `EC2_USER` | `ec2-user` (Amazon Linux) or `ubuntu` (Ubuntu) |
| `EC2_SSH_KEY` | Contents of your `.pem` private key file |

### 3.2 IAM Permissions Required

Create an IAM user/role with:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Part 4 — Useful Commands

### View API Logs

```bash
ssh ec2-user@<EC2_IP>
docker compose -f /opt/ecommerce/docker-compose.yml logs -f api
```

### Restart API

```bash
docker compose -f /opt/ecommerce/docker-compose.yml restart api
```

### Run Prisma Migrations Manually

```bash
docker compose -f /opt/ecommerce/docker-compose.yml exec api \
  npx prisma migrate deploy
```

### Verify API Health

```bash
curl http://<EC2_IP>:3001/api
```

### Check Swagger Docs

```
http://<EC2_IP>:3001/api/docs
```

---

## Checklist Before Going Live

- [ ] Update `JWT_SECRET` to a strong random value (64+ chars)
- [ ] Set real `DATABASE_URL` and `REDIS_URL` in `/opt/ecommerce/.env`
- [ ] Set `FRONTEND_URL` in `.env` to your actual Vercel domain
- [ ] Set `NEXT_PUBLIC_API_URL` in Vercel project settings
- [ ] Configure EC2 Security Group to only allow port 3001 from Nginx (if using reverse proxy)
- [ ] Enable HTTPS on EC2 via Certbot (or use an AWS ALB)
- [ ] Add a custom domain to Vercel (optional)
- [ ] Test end-to-end: register user → add to cart → checkout
