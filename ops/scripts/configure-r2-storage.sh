#!/bin/bash
set -e

# Configure R2 Storage for Directus CMS
# This script updates the Directus .env file with R2 storage configuration

SERVER="root@147.182.139.215"
DIRECTUS_DIR="/root/directus"

echo "🚀 Configuring R2 Storage for Directus CMS..."

# Load R2 credentials from local .env
ENV_FILE="$(dirname "$0")/../../.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

R2_ACCESS_KEY=$(grep "^R2_ACCESS_KEY=" "$ENV_FILE" | cut -d'=' -f2-)
R2_SECRET_KEY=$(grep "^R2_SECRET_KEY=" "$ENV_FILE" | cut -d'=' -f2-)
R2_BUCKET=$(grep "^R2_BUCKET=" "$ENV_FILE" | cut -d'=' -f2-)
R2_ENDPOINT=$(grep "^R2_ENDPOINT=" "$ENV_FILE" | cut -d'=' -f2-)

# Validate required variables
if [ -z "$R2_ACCESS_KEY" ] || [ -z "$R2_SECRET_KEY" ] || [ -z "$R2_BUCKET" ] || [ -z "$R2_ENDPOINT" ]; then
    echo "❌ Error: Missing required R2 environment variables"
    echo "Required: R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET, R2_ENDPOINT"
    exit 1
fi

echo "📝 R2 Configuration:"
echo "   Bucket: $R2_BUCKET"
echo "   Endpoint: $R2_ENDPOINT"
echo "   Root Path: directus/"

# SSH to server and update .env file
ssh $SERVER << EOF
set -e

echo "📦 Updating Directus .env file..."
cd $DIRECTUS_DIR

# Backup current .env
cp .env .env.backup.\$(date +%Y%m%d_%H%M%S)

# Add or update R2 configuration
grep -q "^R2_ACCESS_KEY=" .env && sed -i "s|^R2_ACCESS_KEY=.*|R2_ACCESS_KEY=$R2_ACCESS_KEY|" .env || echo "R2_ACCESS_KEY=$R2_ACCESS_KEY" >> .env
grep -q "^R2_SECRET_KEY=" .env && sed -i "s|^R2_SECRET_KEY=.*|R2_SECRET_KEY=$R2_SECRET_KEY|" .env || echo "R2_SECRET_KEY=$R2_SECRET_KEY" >> .env
grep -q "^R2_BUCKET=" .env && sed -i "s|^R2_BUCKET=.*|R2_BUCKET=$R2_BUCKET|" .env || echo "R2_BUCKET=$R2_BUCKET" >> .env
grep -q "^R2_ENDPOINT=" .env && sed -i "s|^R2_ENDPOINT=.*|R2_ENDPOINT=$R2_ENDPOINT|" .env || echo "R2_ENDPOINT=$R2_ENDPOINT" >> .env

echo "🔄 Restarting Directus container..."
docker compose down
docker compose up -d

echo "⏳ Waiting for Directus to start..."
sleep 10

# Check if Directus is healthy
if docker compose ps | grep -q "directus-app.*Up"; then
    echo "✅ Directus is running"
else
    echo "❌ Directus failed to start"
    exit 1
fi

EOF

echo ""
echo "✅ R2 Storage configuration complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Test file upload in Directus admin panel"
echo "   2. Upload a user avatar to verify R2 storage"
echo "   3. Check R2 bucket for uploaded files in 'directus/' folder"
echo ""
echo "🔗 Directus CMS: https://cms.geralddagher.com"
