#!/bin/bash
# deployment_script.sh — Simple Blue-Green Deployment Demo
# This script simulates a blue-green deployment using Docker.

BLUE_PORT=5001
GREEN_PORT=5002
NGINX_CONF="/etc/nginx/sites-available/gemini-clone"

# Determine current active environment
CURRENT_PORT=$(grep "proxy_pass" $NGINX_CONF | awk -F':' '{print $3}' | tr -d ';/')

if [ "$CURRENT_PORT" == "$BLUE_PORT" ]; then
  TARGET="green"
  TARGET_PORT=$GREEN_PORT
else
  TARGET="blue"
  TARGET_PORT=$BLUE_PORT
fi

echo "🚀 Starting $TARGET deployment on port $TARGET_PORT..."

# 1. Pull latest code and build
git pull origin main
docker build -t gemini-clone:$TARGET .

# 2. Start target container
docker stop gemini-clone-$TARGET || true
docker rm gemini-clone-$TARGET || true
docker run -d --name gemini-clone-$TARGET -p $TARGET_PORT:5000 --env-file .env gemini-clone:$TARGET

# 3. Health check (simplified)
sleep 10
if curl -s http://localhost:$TARGET_PORT/health | grep "healthy"; then
  echo "✅ $TARGET environment is healthy. Switching traffic..."
  
  # 4. Update Nginx config
  sudo sed -i "s/localhost:$CURRENT_PORT/localhost:$TARGET_PORT/" $NGINX_CONF
  sudo systemctl reload nginx
  
  echo "🎉 Deployment successful! Traffic shifted to $TARGET."
else
  echo "❌ $TARGET environment health check failed. Deployment aborted."
  exit 1
fi
