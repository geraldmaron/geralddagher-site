#!/bin/bash
set -e

echo "🧹 Cleaning environment..."
rm -rf node_modules .next

echo "📦 Fresh install..."
npm ci --legacy-peer-deps

echo "🔍 Linting..."
npm run lint

echo "✅ Type checking..."
npm run typecheck

echo "🧪 Running tests..."
npm run test:ci

echo "🏗️  Building..."
npm run build

echo "✨ All CI checks passed!"
