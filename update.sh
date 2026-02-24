#!/bin/bash

# =================================================================
# MarketBytes Pulse - Perimeter Update Script
# Usage: ./update.sh
# =================================================================

echo "Starting MarketBytes Pulse Synchronization Update..."

# 1. Pull latest changes (optional but recommended)
if [ -d ".git" ]; then
    echo "Pulling latest code from repository..."
    git pull
else
    echo "Skipping git pull (not a git repository)."
fi

# 2. Rebuild and start containers
echo "Rebuilding pulse perimeter containers..."
# Use down first to avoid 'ContainerConfig' errors in older docker-compose versions
docker-compose down
docker-compose up -d --build

# 3. Cleanup unused images to save disk space on VPS
echo "Pruning old container layers..."
docker image prune -f

# 4. Verify agent status
echo "Verifying Pulse Agent connectivity..."
# Give it a moment to initialize
sleep 5
docker-compose logs --tail=20 agent

echo ""
echo "Update Complete. Perimeter is now synchronized and monitored."
echo "Logs available via: docker-compose logs -f agent"
