#!/bin/bash
# Restart Directus containers on production server

set -e

SERVER_IP="157.230.93.73"
SERVER_USER="root"
COMPOSE_DIR="/opt/cms-v2/compose"

echo "🔄 Restarting Directus containers on production server..."
echo "   Server: $SERVER_USER@$SERVER_IP"
echo "   Directory: $COMPOSE_DIR"
echo ""

# SSH into server and restart containers
ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    set -e

    echo "📍 Current directory: $(pwd)"
    cd /opt/cms-v2/compose || { echo "❌ Failed to change to /opt/cms-v2/compose"; exit 1; }

    echo ""
    echo "🐳 Checking running containers..."
    docker ps --filter "name=directus" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    echo ""
    echo "🔄 Restarting Directus containers..."
    docker-compose restart directus

    echo ""
    echo "⏳ Waiting for containers to be healthy..."
    sleep 5

    echo ""
    echo "✅ Container status after restart:"
    docker ps --filter "name=directus" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    echo ""
    echo "📋 Recent Directus logs:"
    docker-compose logs --tail=20 directus
ENDSSH

echo ""
echo "✅ Directus containers restarted successfully!"
echo ""
echo "🧪 Testing connection..."
curl -s https://cms.geralddagher.com/server/ping || echo "❌ Server not responding"
echo ""
