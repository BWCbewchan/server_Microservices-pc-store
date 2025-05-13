# Cài đặt dependencies và chạy tất cả các service đồng thời

#!/bin/bash
set -e

echo "Starting setup for all services..."

# Lấy danh sách tất cả các service trừ node_modules
SERVICES=$(ls -d */ | grep -v "node_modules" | sed 's:/$::')

# SERVICES="api-gateway product-catalog-service" -> Test riêng

# Cài đặt dependencies
for SERVICE in $SERVICES; do
  echo "Installing dependencies for $SERVICE..."
  (cd $SERVICE && npm install)
done

echo "All dependencies installed!"

COMMANDS=()
for SERVICE in $SERVICES; do
  COMMANDS+=("cd $SERVICE && npm run dev")
done

npx concurrently --raw "${COMMANDS[@]}"

echo "All services are running!"
