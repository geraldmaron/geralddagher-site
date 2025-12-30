#!/bin/bash

# =============================================================================
# Sync Local Environment Variables to Vercel (Fast Version)
# =============================================================================
# This script syncs all environment variables from .env to Vercel production
# Uses a more efficient approach by batching operations
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Syncing Environment Variables to Vercel${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Error: Vercel CLI not installed${NC}"
    echo "Install with: npm i -g vercel"
    exit 1
fi

# Create a temporary file with variables to add
TEMP_ENV=$(mktemp)
trap "rm -f $TEMP_ENV" EXIT

# Variables to skip
SKIP_VARS=(
    "VERCEL"
    "VERCEL_ENV"
    "VERCEL_GIT_COMMIT_AUTHOR_LOGIN"
    "VERCEL_GIT_COMMIT_AUTHOR_NAME"
    "VERCEL_GIT_COMMIT_MESSAGE"
    "VERCEL_GIT_COMMIT_REF"
    "VERCEL_GIT_COMMIT_SHA"
    "VERCEL_GIT_PREVIOUS_SHA"
    "VERCEL_GIT_PROVIDER"
    "VERCEL_GIT_PULL_REQUEST_ID"
    "VERCEL_GIT_REPO_ID"
    "VERCEL_GIT_REPO_OWNER"
    "VERCEL_GIT_REPO_SLUG"
    "VERCEL_OIDC_TOKEN"
    "VERCEL_TARGET_ENV"
    "VERCEL_URL"
)

should_skip() {
    local key=$1
    for skip in "${SKIP_VARS[@]}"; do
        if [ "$key" == "$skip" ]; then
            return 0
        fi
    done
    
    # Skip NX and TURBO vars
    if [[ "$key" =~ ^NX_ ]] || [[ "$key" =~ ^TURBO_ ]]; then
        return 0
    fi
    
    return 1
}

echo -e "${YELLOW}Processing .env file...${NC}"

# Read .env and prepare variables
while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    [[ -z "$line" ]] || [[ "$line" =~ ^[[:space:]]*# ]] && continue
    
    # Extract key and value
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        
        # Trim whitespace from key
        key=$(echo "$key" | xargs)
        
        # Skip if key is empty or should be skipped
        [[ -z "$key" ]] && continue
        
        if should_skip "$key"; then
            echo -e "${YELLOW}⊘ Skipping: $key${NC}"
            continue
        fi
        
        echo "$line" >> "$TEMP_ENV"
        echo -e "${BLUE}→ Queued: $key${NC}"
    fi
done < .env

echo ""
echo -e "${GREEN}Ready to sync $(wc -l < "$TEMP_ENV" | xargs) variables to Vercel${NC}"
echo ""
echo -e "${YELLOW}This will:${NC}"
echo -e "${YELLOW}  1. Remove all existing non-system environment variables${NC}"
echo -e "${YELLOW}  2. Add all variables from your local .env${NC}"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 1: Removing outdated variables...${NC}"

# Get list of existing vars and remove them
EXISTING_VARS=$(vercel env ls 2>/dev/null | awk 'NR>2 {print $1}')

for var in $EXISTING_VARS; do
    if should_skip "$var"; then
        echo -e "${YELLOW}⊘ Keeping system var: $var${NC}"
        continue
    fi
    
    echo -e "${YELLOW}✗ Removing: $var${NC}"
    vercel env rm "$var" production -y >/dev/null 2>&1 || true
done

echo ""
echo -e "${BLUE}Step 2: Adding new variables...${NC}"

# Add all variables from temp file
ADDED=0
FAILED=0

while IFS='=' read -r key value || [ -n "$key" ]; do
    [[ -z "$key" ]] && continue
    
    key=$(echo "$key" | xargs)  
    
    echo -e "${BLUE}+ Adding: $key${NC}"
    if echo "$value" | vercel env add "$key" production >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Added: $key${NC}"
        ((ADDED++))
    else
        echo -e "${RED}✗ Failed: $key${NC}"
        ((FAILED++))
    fi
done < "$TEMP_ENV"

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Sync Complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Added: $ADDED${NC}"
echo -e "${RED}✗ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Some variables failed to sync. Please review the errors above.${NC}"
    exit 1
fi

echo -e "${GREEN}All environment variables synced successfully!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "${YELLOW}  • Verify variables: vercel env ls${NC}"
echo -e "${YELLOW}  • Deploy with new env: vercel --prod${NC}"
