
# Server Microservices for PC Store
=====================================

Dự án này là một hệ thống server microservices được thiết kế để quản lý và vận hành một cửa hàng bán lẻ máy tính. Hệ thống bao gồm các microservice riêng biệt cho từng chức năng, cho phép dễ dàng mở rộng và bảo trì.

## Cấu trúc Dự án
-------------------

Dự án được tổ chức thành các thư mục sau:

- **api-gateway**: Cổng API chính cho hệ thống, xử lý yêu cầu từ phía client.
- **auth-service**: Dịch vụ xác thực người dùng.
- **inventory-service**: Dịch vụ quản lý kho hàng.
- **order-service**: Dịch vụ quản lý đơn hàng.
- **payment-service**: Dịch vụ xử lý thanh toán.
- **product-service**: Dịch vụ quản lý sản phẩm.
- **review-service**: Dịch vụ quản lý đánh giá sản phẩm.
- **shipping-service**: Dịch vụ quản lý vận chuyển.

## Công nghệ Sử Dụng
---------------------

- **Node.js**: Runtime cho các microservice.
- **Docker**: Công cụ hóa container để triển khai và quản lý các microservice.
- **Docker Compose**: Công cụ để quản lý và chạy các container Docker.

## Hướng Dẫn Triển Khai
-------------------------

### Bước 1: Chuẩn Bị Môi Trường

1. **Cài Đặt Node.js**:
   - Đảm bảo rằng Node.js đã được cài đặt trên máy của bạn.
   - Bạn có thể tải Node.js từ trang web chính thức: https://nodejs.org/

2. **Cài Đặt Docker và Docker Compose**:
   - Đảm bảo rằng Docker và Docker Compose đã được cài đặt trên máy của bạn.
   - Bạn có thể tải Docker từ trang web chính thức: https://www.docker.com/

### Bước 2: Cài Đặt Dependencies

1. **Tạo File Script `install.sh`**:
```

\#!/bin/bash

# Di chuyển vào thư mục dự án

cd server_Microservices-pc-store

# Cài đặt dependencies cho từng microservice

for dir in api-gateway auth-service inventory-service order-service payment-service product-service review-service shipping-service; do
echo "Cài đặt dependencies cho \$dir"
cd \$dir
npm install
cd ..
done

echo "Cài đặt dependencies thành công!"

```

2. **Chạy File Script**:
- Thêm quyền thực thi cho file script bằng lệnh:
  ```
  chmod +x install.sh
  ```
- Chạy file script bằng lệnh:
  ```
  ./install.sh
  ```

### Bước 3: Chạy Dự Án Trên Môi Trường Local

1. **Chạy Mỗi Microservice**:
Mở các terminal riêng biệt cho từng microservice và chạy chúng bằng lệnh:
```

npm start

```

### Bước 4: Chạy Dự Án Bằng Docker

1. **Di Chuyển Vào Thư Mục Dự Án**:
```

cd server_Microservices-pc-store

```

2. **Chạy Dự Án Bằng Docker Compose**:
Sử dụng lệnh sau để khởi động tất cả các microservice:
```

docker-compose up --build

```

## API Endpoints
----------------

Dưới đây là một số endpoint chính của hệ thống:

- **API Gateway**:
- `GET /products`: Lấy danh sách sản phẩm.
- `POST /orders`: Tạo mới đơn hàng.
- **Auth Service**:
- `POST /login`: Xác thực người dùng.
- `POST /register`: Đăng ký người dùng mới.
- **Inventory Service**:
- `GET /inventory`: Lấy thông tin kho hàng.

## Liên Hệ
------------

Nếu bạn có bất kỳ câu hỏi nào hoặc muốn đóng góp cho dự án, vui lòng liên hệ với chúng tôi qua email hoặc mở một issue trên GitHub.

## License
---------

Dự án được phát hành dưới [Giấy phép MIT](https://opensource.org/licenses/MIT).
```

Hãy điều chỉnh nội dung cho phù hợp với chi tiết cụ thể của dự án và thông tin liên hệ của bạn.

### File Script `install.sh`

Nếu bạn muốn tự động hóa việc cài đặt dependencies, bạn có thể sử dụng file script trên.

### Cài Đặt Dependencies Bằng NPM

Nếu bạn muốn cài đặt dependencies một cách thủ công, bạn có thể sử dụng lệnh `npm install` trong từng thư mục microservice sau khi đã thêm các dependencies cần thiết vào file `package.json`.

### Chạy Dự Án

Sau khi cài đặt dependencies, bạn có thể chạy dự án bằng cách chạy từng microservice bằng lệnh `npm start` hoặc sử dụng Docker Compose để chạy toàn bộ hệ thống.

