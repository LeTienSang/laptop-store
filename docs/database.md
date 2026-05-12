# Database Schema — Laptop Store

## Tổng quan

| Bảng | Mô tả |
|------|-------|
| `brand` | Thương hiệu laptop |
| `laptop` | Sản phẩm |
| `user` | Người dùng |
| `order` | Đơn hàng |
| `order_item` | Chi tiết đơn hàng |

---

## 1. Bảng `brand` — Thương hiệu

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| `id` | INT | PK, Auto Increment | ID thương hiệu |
| `name` | VARCHAR(255) | NOT NULL | Tên thương hiệu (e.g., `Apple`, `Asus`, `Dell`) |
| `created_at` | DATETIME | NOT NULL | Thời điểm tạo |

---

## 2. Bảng `laptop` — Sản phẩm

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| `id` | INT | PK, Auto Increment | ID sản phẩm |
| `name` | VARCHAR(255) | NOT NULL | Tên laptop |
| `cpu` | VARCHAR(255) | | CPU (e.g., `R7 8745H`) |
| `ram` | VARCHAR(100) | | RAM (e.g., `16`, `16GB DDR4`) |
| `storage` | VARCHAR(100) | | Ổ cứng (e.g., `512`, `512GB SSD`) |
| `gpu` | VARCHAR(255) | | Card đồ họa |
| `description` | TEXT | NULL | Mô tả sản phẩm |
| `price` | DECIMAL(15, 2) | NOT NULL | Giá (e.g., `25000000.00`) |
| `stock` | INT | NOT NULL | Số lượng tồn kho ⚠️ |
| `brand_id` | INT | FK → `brand.id` | Thương hiệu |
| `image` | VARCHAR(255) | | Đường dẫn ảnh (e.g., `/uploads/...`) |
| `created_at` | DATETIME | NOT NULL | Thời điểm tạo |

> ⚠️ **Lưu ý `stock`:** Hiện có dữ liệu âm trong DB. Backend **bắt buộc** kiểm tra `stock >= quantity` trước khi tạo đơn hàng. Xử lý trong Database Transaction — rollback nếu không đủ hàng.

---

## 3. Bảng `user` — Người dùng

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| `id` | INT | PK, Auto Increment | ID người dùng |
| `name` | VARCHAR(255) | NOT NULL | Họ tên |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email đăng nhập |
| `password` | VARCHAR(255) | NOT NULL | Mật khẩu (bcrypt hashed) |
| `role` | VARCHAR(50) | NOT NULL | Vai trò: `ADMIN` \| `CUSTOMER` |
| `created_at` | DATETIME | NOT NULL | Thời điểm tạo |

---

## 4. Bảng `order` — Đơn hàng

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| `id` | INT | PK, Auto Increment | ID đơn hàng |
| `order_date` | DATETIME | NOT NULL | Thời điểm đặt hàng |
| `status` | VARCHAR(50) | NOT NULL | Trạng thái: `PENDING` \| `DELIVERED` |
| `phone` | VARCHAR(20) | NOT NULL | Số điện thoại giao hàng |
| `address` | TEXT | NOT NULL | Địa chỉ ghép chuỗi từ FE |
| `user_id` | INT | FK → `user.id` | Người đặt hàng |

> ⚠️ **Lưu ý tên bảng:** `order` trùng với từ khóa SQL. Luôn dùng dấu backtick khi viết query:
> ```sql
> SELECT * FROM `order` WHERE user_id = ?;
> ```

---

## 5. Bảng `order_item` — Chi tiết đơn hàng

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|-------------|-----------|-------|
| `id` | INT | PK, Auto Increment | ID chi tiết |
| `order_id` | INT | FK → `order.id` | Đơn hàng |
| `laptop_id` | INT | FK → `laptop.id` | Sản phẩm |
| `quantity` | INT | NOT NULL | Số lượng mua |
| `price` | DECIMAL(15, 2) | NOT NULL | Giá tại thời điểm mua (snapshot) |

---

## Sơ đồ quan hệ

```
brand (1) ──────< laptop (n)
                    │
user (1) ──────< order (n)
                    │
               order_item (n) >────── laptop (1)
```
