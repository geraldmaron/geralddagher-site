#!/bin/bash
# =============================================================================
# Deploy Script with 1Password Service Account
# =============================================================================
# This script uses 1Password Service Account to retrieve the production.env
# file directly from 1Password vault and deploy to the server
#
# Prerequisites:
# 1. 1Password CLI installed on server
# 2. Service account token stored securely at /etc/secrets/op-service-account
# 3. production.env file stored in 1Password vault "geralddagher-production"
#
# Usage:
#   ./ops/scripts/deploy-with-1password.sh
# =============================================================================

set -e  # Exit on error

VAULT="geralddagher-production"
ITEM="production.env"
COMPOSE_DIR="/opt/cms-v2/compose"

echo "🔐 1Password Production Deployment Script"
echo "=========================================="

# Check if running on server
if [ ! -f "/etc/secrets/op-service-account" ]; then
    echo "❌ ERROR: Service account token not found at /etc/secrets/op-service-account"
    echo ""
    echo "Please create it first:"
    echo "  sudo mkdir -p /etc/secrets"
    echo "  echo 'ops_xxx_your_token' | sudo tee /etc/secrets/op-service-account"
    echo "  sudo chmod 600 /etc/secrets/op-service-account"
    exit 1
fi

# Load service account token
export OP_SERVICE_ACCOUNT_TOKEN=$(cat /etc/secrets/op-service-account)

# Verify 1Password CLI is installed
if ! command -v op &> /dev/null; then
    echo "❌ ERROR: 1Password CLI not installed"
    echo "Install with: curl -sSfLo op.zip https://cache.agilebits.com/dist/1P/op2/pkg/v2.32.0/op_linux_amd64_v2.32.0.zip && unzip -o op.zip -d /usr/local/bin && rm op.zip"
    exit 1
fi

echo "✅ 1Password CLI found: $(op --version)"

# Test 1Password connection
echo "🔍 Testing 1Password connection..."
if ! op whoami &> /dev/null; then
    echo "❌ ERROR: Cannot authenticate with 1Password"
    echo "Check your service account token"
    exit 1
fi

echo "✅ 1Password authentication successful"

# Navigate to compose directory
cd "$COMPOSE_DIR" || exit 1

# Download production.env from 1Password
echo "📦 Retrieving production.env from 1Password..."
echo "   Vault: $VAULT"
echo "   Item: $ITEM"
echo "   Output: $COMPOSE_DIR/.env"

# Download the full production.env file directly to .env
op document get "$ITEM" --vault "$VAULT" --output .env

# Secure the generated file
chmod 600 .env

echo "✅ Environment file retrieved successfully"

# Restart services
echo "🔄 Restarting services..."
docker compose down
docker compose up -d

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Services status:"
docker compose ps

echo ""
echo "📝 View logs with:"
echo "  docker compose logs -f directus"
