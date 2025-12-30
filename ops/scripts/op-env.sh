#!/usr/bin/env bash
set -euo pipefail

# Load environment variables from 1Password and export them for the current shell.
# Requirements:
# - 1Password CLI (`op`) installed and signed in: https://developer.1password.com/docs/cli/get-started/
# - OP_SERVICE_ACCOUNT or an active signed-in session (`op signin`)
# - Update the OP paths below to match your vault + items
#
# Usage:
#   source ops/scripts/op-env.sh
#   # Then run your app (e.g., `pnpm dev`) with the injected env
#
# Notes:
# - This script echoes `export KEY=VALUE` lines so it must be sourced to affect current shell.
# - Replace placeholder `op://` paths with your actual vault/item/field.

# --- Helpers ---
read_secret() {
  local path="$1"
  op read "$path"
}

export_var() {
  local key="$1"; shift
  local path="$1"; shift
  local value
  value=$(read_secret "$path")
  # Escape any embedded newlines
  value=${value//$'\n'/}
  echo "export ${key}=${value}"
}

# --- Map your secrets here ---
# Example mappings (replace with your real op:// references):
# export_var OPEN_ROUTER_API_KEY op://Engineering/OpenRouter/ApiKey
# export_var OPENAI_API_KEY      op://Engineering/OpenAI/ApiKey
# export_var DIRECTUS_ADMIN_EMAIL op://CMS/Directus Admin/username
# export_var DIRECTUS_ADMIN_PASSWORD op://CMS/Directus Admin/password
# export_var DIRECTUS_DB_PASSWORD op://CMS/Directus DB/password

# If you want to emit a full env file instead of export lines:
#   ./ops/scripts/op-env.sh > .env.local
# In that mode, comment out the `echo` above and print `KEY=VALUE` directly.

# Safety: warn if `op` is not signed-in
if ! op whoami >/dev/null 2>&1; then
  echo "# WARN: 1Password CLI not signed in. Run 'op signin' or set OP_SERVICE_ACCOUNT." >&2
fi
