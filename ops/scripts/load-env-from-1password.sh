#!/bin/bash
# =============================================================================
# Load Environment from 1Password
# =============================================================================
# This script retrieves the production.env file from 1Password vault
# and writes it to the specified location.
#
# Usage:
#   ./load-env-from-1password.sh [output-path]
#
# Default output: ./.env
# =============================================================================

set -e

OUTPUT_PATH="${1:-.env}"
VAULT="geralddagher-production"
ITEM="production.env"

echo "📦 Retrieving environment from 1Password..."
echo "   Vault: $VAULT"
echo "   Item: $ITEM"
echo "   Output: $OUTPUT_PATH"

# Check if 1Password CLI is available
if ! command -v op &> /dev/null; then
    echo "❌ Error: 1Password CLI (op) is not installed"
    echo "   Install from: https://developer.1password.com/docs/cli/get-started/"
    exit 1
fi

# Check if signed in
if ! op account get &> /dev/null; then
    echo "❌ Error: Not signed in to 1Password"
    echo "   Run: op signin"
    exit 1
fi

# Download the document
op document get "$ITEM" --vault "$VAULT" --output "$OUTPUT_PATH"

# Set secure permissions
chmod 600 "$OUTPUT_PATH"

echo "✅ Environment file retrieved successfully"
echo "   File: $OUTPUT_PATH"
echo "   Permissions: 600 (owner read/write only)"
