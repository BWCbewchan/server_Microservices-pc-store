# Auth Service

Dịch vụ xác thực (Auth Service) là một microservice được xây dựng để quản lý việc đăng ký, đăng nhập và xác thực người dùng. Dịch vụ này sử dụng Node.js, Express và MongoDB để lưu trữ thông tin người dùng.

## Nội Dung

- [Cài Đặt](#cài-đặt)
- [Cấu Hình](#cấu-hình)
- [API](#api)
  - [Đăng Ký Người Dùng](#đăng-ký-người-dùng)
  - [Đăng Nhập Người Dùng](#đăng-nhập-người-dùng)
  - [Xác Thực Token](#xác-thực-token)
- [Chạy Dịch Vụ](#chạy-dịch-vụ)
- [Giấy Phép](#giấy-phép)

## Cài Đặt

1. **Clone Repository**

   ```bash
   git clone https://github.com/yourusername/auth-service.git
   cd auth-service
   ```

2. **Cài Đặt Các Gói Phụ Thuộc**

   ```bash
   npm install
   ```

## Cấu Hình

Tạo file `.env` trong thư mục gốc của dự án và thêm các biến môi trường sau:

- **PORT**: Cổng mà dịch vụ sẽ chạy.
- **MONGODB_URI**: Đường dẫn kết nối đến MongoDB.
- **JWT_SECRET**: Mật khẩu bí mật để mã hóa token JWT.

## API

### Đăng Ký Người Dùng

- **URL**: `/auth/register`
- **Phương thức**: `POST`
- **Body**:
  ```json
  {
    "username": "testuser",
    "password": "password123",
    "email": "testuser@example.com",
    "role": "user"
  }
  ```
- **Phản hồi**:
  - `201`: Người dùng đã đăng ký thành công.
  - `400`: Email đã được đăng ký.
  - `500`: Lỗi đăng ký.

### Đăng Nhập Người Dùng

- **URL**: `/auth/login`
- **Phương thức**: `POST`
- **Body**:
  ```json
  {
    "email": "testuser@example.com",
    "password": "password123"
  }
  ```
- **Phản hồi**:
  - `200`: Trả về token JWT.
  - `401`: Email hoặc mật khẩu không đúng.
  - `500`: Lỗi đăng nhập.

### Xác Thực Token

- **URL**: `/auth/verifyToken`
- **Phương thức**: `POST`
- **Body**:
  ```json
  {
    "token": "your_jwt_token_here"
  }
  ```
- **Phản hồi**:
  - `200`: Token hợp lệ.
  - `401`: Token không hợp lệ.
  - `500`: Lỗi xác thực.

## Chạy Dịch Vụ

Để chạy dịch vụ, sử dụng lệnh sau:

```bash
npm run dev
```

Dịch vụ sẽ chạy trên `http://localhost:3004`.

## Giấy Phép

Dịch vụ này được cấp phép theo Giấy phép MIT. Vui lòng xem file LICENSE để biết thêm chi tiết.
