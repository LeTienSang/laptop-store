# Laptop Store - Hệ thống quản lý cửa hàng laptop

## Công nghệ sử dụng

### Frontend
- **React 19** & **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)
- **React Router Dom** (Routing)
- **Axios** (API Client)

### Backend
- **Node.js** & **Express**
- **TypeScript**
- **MySQL** (Database)
- **JWT** (Authentication)
- **Bcryptjs** (Password Hashing)
- **Swagger** (API Documentation)

## Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống
- Node.js (v18 trở lên)
- MySQL Server

### 2. Cài đặt Dependencies
Mở terminal tại thư mục gốc và chạy:

**Cho Backend:**
```bash
cd backend
npm install
```

**Cho Frontend:**
```bash
cd frontend
npm install
```

### 3. Thiết lập Cơ sở dữ liệu
1. Tạo một database mới trong MySQL (ví dụ: `laptop_store`).
2. Import file SQL từ `backend/sql/schema.sql` vào database vừa tạo.

### 4. Cấu hình Biến môi trường (.env)
Tạo file `.env` trong thư mục `backend/` dựa trên mẫu sau:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=laptop_store
JWT_SECRET=your_jwt_secret
```

## Cách chạy ứng dụng

### Chạy Backend
```bash
cd backend
npm run dev
```

### Chạy Frontend
```bash
cd frontend
npm run dev
```

## Tính năng

- **Người dùng:** Xem sản phẩm, tìm kiếm, đặt hàng, quản lý lịch sử đơn hàng.
- **Quản trị viên (Admin):**
  - Dashboard tổng quan doanh thu và trạng thái đơn hàng.
  - Quản lý Laptop (Thêm, sửa, xóa, tìm kiếm).
  - Quản lý Thương hiệu.
  - Quản lý Đơn hàng (Duyệt đơn, cập nhật trạng thái vận chuyển).
  - Quản lý Người dùng (Phân quyền, đổi mật khẩu).