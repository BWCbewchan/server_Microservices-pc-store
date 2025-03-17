# Sử dụng hình ảnh Node.js chính thức
FROM node:16-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json vào thư mục làm việc
COPY package*.json ./

# Cài đặt các gói phụ thuộc
RUN npm install

# Sao chép toàn bộ mã nguồn vào thư mục làm việc
COPY . .

# Mở cổng mà ứng dụng sẽ chạy
EXPOSE 3004

# Lệnh để chạy ứng dụng
CMD ["npm", "start"]