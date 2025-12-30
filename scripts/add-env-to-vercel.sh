#!/bin/bash

set -e

export VERCEL_ORG_ID="team_DldsFiy3ArSsA0sJvIXr2zId"
export VERCEL_PROJECT_ID="prj_C8bM4vhtIDQ01BUUfLGIg8Bvaq52"

ENV_FILE=".env"
ENVIRONMENTS=("production" "preview" "development")

echo "Adding environment variables to Vercel project..."

# Read each non-comment, non-empty line from .env
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  if [[ $key =~ ^#.*$ ]] || [[ -z $key ]]; then
    continue
  fi

  # Remove any trailing whitespace
  key=$(echo "$key" | xargs)

  # Skip if key is empty after trim
  if [[ -z $key ]]; then
    continue
  fi

  echo "Adding $key..."

  # Add to all environments
  for env in "${ENVIRONMENTS[@]}"; do
    printf "%s" "$value" | npx vercel env add "$key" "$env" 2>&1 | grep -v "Vercel CLI" || true
  done

done < "$ENV_FILE"

echo "Done! All environment variables added."
