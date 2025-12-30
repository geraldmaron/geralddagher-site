#!/bin/bash
set -e

# Quick R2 Deployment Script
echo "🚀 Deploying R2 Storage Configuration..."

# Load credentials
R2_ACCESS_KEY="bEcHOuLkIMzUu18cKMZNYlBlK0HD4zx0WH0cNtO8"
R2_SECRET_KEY="9b3e86b59e4dde0bfc8e4a44755c4dee77ad4ff6b3a3ea1ee279ab14ec054a8c"
R2_BUCKET="cms-assets"
R2_ENDPOINT="https://d40a45f84d7568cd2bde3a8844e44cb1.r2.cloudflarestorage.com"

SERVER="root@147.182.139.215"
DIR="/root/directus"

echo "📝 Updating R2 configuration on server..."

ssh -o ConnectTimeout=10 $SERVER << 'ENDSSH'
cd /root/directus

# Backup .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Update/add R2 config
grep -q "^R2_ACCESS_KEY=" .env && sed -i "s|^R2_ACCESS_KEY=.*|R2_ACCESS_KEY=bEcHOuLkIMzUu18cKMZNYlBlK0HD4zx0WH0cNtO8|" .env || echo "R2_ACCESS_KEY=bEcHOuLkIMzUu18cKMZNYlBlK0HD4zx0WH0cNtO8" >> .env
grep -q "^R2_SECRET_KEY=" .env && sed -i "s|^R2_SECRET_KEY=.*|R2_SECRET_KEY=9b3e86b59e4dde0bfc8e4a44755c4dee77ad4ff6b3a3ea1ee279ab14ec054a8c|" .env || echo "R2_SECRET_KEY=9b3e86b59e4dde0bfc8e4a44755c4dee77ad4ff6b3a3ea1ee279ab14ec054a8c" >> .env
grep -q "^R2_BUCKET=" .env && sed -i "s|^R2_BUCKET=.*|R2_BUCKET=cms-assets|" .env || echo "R2_BUCKET=cms-assets" >> .env
grep -q "^R2_ENDPOINT=" .env && sed -i "s|^R2_ENDPOINT=.*|R2_ENDPOINT=https://d40a45f84d7568cd2bde3a8844e44cb1.r2.cloudflarestorage.com|" .env || echo "R2_ENDPOINT=https://d40a45f84d7568cd2bde3a8844e44cb1.r2.cloudflarestorage.com" >> .env

echo "✅ .env updated"

# Restart Directus
echo "🔄 Restarting Directus..."
docker compose down && docker compose up -d

echo "⏳ Waiting for services..."
sleep 15

# Check health
if docker compose ps | grep -q "directus-app.*Up"; then
    echo "✅ Directus is running"
else
    echo "❌ Directus failed to start"
    docker compose logs --tail=50 directus
    exit 1
fi

echo "✅ R2 Storage configured successfully!"
ENDSSH

echo ""
echo "🎉 Deployment complete!"
echo "🔗 Test upload at: https://cms.geralddagher.com"
