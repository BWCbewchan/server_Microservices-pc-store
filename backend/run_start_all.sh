# Chạy tất cả các service đồng thời

#!/bin/bash
set -e

echo "Starting all services..."

# Lấy danh sách thư mục (bỏ qua node_modules)
SERVICES=$(ls -d */ | grep -v "node_modules" | sed 's:/$::')

# SERVICES="api-gateway product-catalog-service" -> Test riêng

COMMANDS=()
for SERVICE in $SERVICES; do
  COMMANDS+=("cd $SERVICE && npm run dev")
done

npx concurrently --raw "${COMMANDS[@]}"

echo "All services are running!"
