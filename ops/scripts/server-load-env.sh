#!/bin/bash
# =============================================================================
# Server Environment Loader - 1Password Service Account
# =============================================================================
# This script is designed to run on the production server using a service
# account token stored in /etc/secrets/op-service-account
#
# Usage:
#   ./server-load-env.sh [output-path]
#
# Default output: ./.env
# =============================================================================

set -e

OUTPUT_PATH="${1:-.env}"
VAULT="geralddagher-production"
ITEM="production.env"
TOKEN_FILE="/etc/secrets/op-service-account"

echo "📦 Retrieving environment from 1Password (Service Account)..."
echo "   Vault: $VAULT"
echo "   Item: $ITEM"
echo "   Output: $OUTPUT_PATH"

# Check if 1Password CLI is available
if ! command -v op &> /dev/null; then
    echo "❌ Error: 1Password CLI (op) is not installed"
    echo "   Install from: https://developer.1password.com/docs/cli/get-started/"
    exit 1
fi

# Check if service account token exists
if [ ! -f "$TOKEN_FILE" ]; then
    echo "❌ Error: Service account token not found at $TOKEN_FILE"
    echo "   Create it with: echo 'ops_YOUR_TOKEN' | sudo tee $TOKEN_FILE"
    echo "   Set permissions: sudo chmod 600 $TOKEN_FILE"
    exit 1
fi

# Load service account token
export OP_SERVICE_ACCOUNT_TOKEN=$(cat "$TOKEN_FILE")

# Download the document
op document get "$ITEM" --vault "$VAULT" --output "$OUTPUT_PATH"

# Set secure permissions
chmod 600 "$OUTPUT_PATH"

echo "✅ Environment file retrieved successfully"
echo "   File: $OUTPUT_PATH"
echo "   Permissions: 600 (owner read/write only)"
