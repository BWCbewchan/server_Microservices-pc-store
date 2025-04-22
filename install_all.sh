#!/bin/bash

# Danh sách services cần cài đặt
SERVICES=(
  "api-gateway"
  "auth-service"
  "product-catalog-service"
  "order-service"
  "payment-service"
  "inventory-service"
  "review-service"
  "cart-service"
  "shipping-service"
)

# Màu sắc cho thông báo
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Tạo thư mục logs nếu chưa có
# Tạo thư mục logs
LOG_DIR="logs"
mkdir -p "$LOG_DIR" || { echo -e "${RED}❌ Không thể tạo thư mục logs${NC}"; exit 1; }

# Tạo file log tổng
MAIN_LOG="${LOG_DIR}/installation.log"
: > "$MAIN_LOG" # Xóa nội dung cũ nếu có

# Hàm cài đặt từng service
install_service() {
  local service=$1
  echo -e "${GREEN}🛠️  Đang cài đặt ${service}...${NC}"
  
  if [ ! -d "${service}" ]; then
    echo -e "${RED}❌ Thư mục ${service} không tồn tại!${NC}"
    return 1
  fi
  
  cd "${service}" || return 1
  
  if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ File package.json không tồn tại trong ${service}!${NC}"
    cd ..
    return 1
  fi
  
  # Clean install và log lỗi vào thư mục logs
  npm ci --silent > "../${LOG_DIR}/${service}_install.log" 2>&1
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Lỗi khi cài đặt ${service}! Xem log: ${LOG_DIR}/${service}_install.log${NC}"
    cd ..
    return 1
  fi
  
  echo -e "${GREEN}✅ ${service} cài đặt thành công!${NC}"
  cd ..
  
  # Ghi log vào file tổng
  {
    echo -e "\n===== ${service} =====\n"
    npm ci --silent 2>&1
  } >> "../${MAIN_LOG}"
}

# Main execution
for service in "${SERVICES[@]}"; do
  install_service "${service}" &
done

# Chờ tất cả process con hoàn thành
wait

# Kiểm tra lỗi tổng thể
if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}🎉 Tất cả dependencies đã được cài đặt thành công!${NC}"
  
  # Chạy health check
  echo -e "\n${GREEN}🩺 Kiểm tra services...${NC}"
  node testServices.js
  
else
  echo -e "\n${RED}⛔ Có lỗi xảy ra trong quá trình cài đặt! Vui lòng kiểm tra log file.${NC}"
  exit 1
fi
