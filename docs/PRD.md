# PRD — Laptop Store v1.0
**Product Requirements Document**

---

## 0. Công nghệ sử dụng

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

---

## 1. Problem Statement

### 1.1 Bối cảnh
Thị trường mua sắm laptop tại Việt Nam ngày càng cạnh tranh, nhưng nhiều cửa hàng vẫn phụ thuộc vào kênh bán hàng thủ công hoặc các nền tảng chung (Shopee, Tiki) với khả năng tùy biến thấp. Người mua khó lọc chính xác theo nhu cầu kỹ thuật (CPU, RAM, GPU), và người quản trị thiếu công cụ theo dõi vận hành tập trung.

### 1.2 Vấn đề cốt lõi

| Đối tượng | Vấn đề |
|-----------|--------|
| **Khách vãng lai (Guest)** | Không có nơi tìm kiếm và lọc laptop theo thông số kỹ thuật một cách trực quan |
| **Khách hàng (Customer)** | Quy trình đặt hàng thủ công, thiếu lịch sử đơn hàng và xác nhận trạng thái |
| **Quản trị viên (Admin)** | Quản lý sản phẩm, đơn hàng, tồn kho phân tán — không có dashboard tổng quan |

### 1.3 Mục tiêu giải quyết
Xây dựng một nền tảng thương mại điện tử chuyên biệt cho laptop, cung cấp trải nghiệm mua hàng mượt mà từ đầu đến cuối (end-to-end), đồng thời cung cấp bộ công cụ quản trị tích hợp cho Admin.

---

## 2. Core Features (MVP — v1.0)

### 2.1 Phân hệ Xác thực & Phân quyền

| ID | Feature | Mô tả |
|----|---------|-------|
| AUTH-01 | Đăng ký tài khoản | Người dùng đăng ký với email + mật khẩu. Mật khẩu được mã hóa bằng `bcrypt`. |
| AUTH-02 | Đăng nhập | Xác thực email/password, server cấp JWT chứa `userId` và `role`. Token lưu vào `localStorage`. |
| AUTH-03 | Phân quyền theo Role | Middleware kiểm tra JWT và `role` (`admin` / `customer`) trước mọi request cần bảo vệ. |
| AUTH-04 | Bảo vệ Route Frontend | React Router kiểm tra token và role; chuyển hướng nếu không đủ quyền. |

**Stack:** `bcrypt`, `jsonwebtoken`, TypeScript interface `IUser { id, name, email, role }`.

---

### 2.2 Phân hệ Danh mục Sản phẩm (Guest + Customer)

| ID | Feature | Mô tả |
|----|---------|-------|
| PROD-01 | Xem danh sách laptop | Hiển thị danh sách có phân trang. Mỗi thẻ gồm: tên, giá, ảnh, thương hiệu. |
| PROD-02 | Lọc đa điều kiện | Lọc đồng thời theo: Thương hiệu, Khoảng giá, CPU, RAM, GPU. Backend dùng dynamic SQL với `WHERE` điều kiện kết hợp. |
| PROD-03 | Tìm kiếm thông minh | Gọi API `GET /api/laptops?keyword=...`. Hỗ trợ **tìm kiếm không dấu** (ví dụ: "may tinh" tìm được "máy tính"). |
| PROD-04 | Xem chi tiết sản phẩm | Hiển thị đầy đủ thông số: `name, cpu, ram, storage, gpu, price, stock, description, image, brand`. |

**TypeScript Interface:**
```typescript
interface ILaptop {
  id: number;
  name: string;
  cpu: string;
  ram: string;
  storage: string;
  gpu: string;
  price: number;
  stock: number;
  brandId: number;
  image: string;
  description: string;
}
```

---

### 2.3 Phân hệ Giỏ hàng (Customer)

| ID | Feature | Mô tả |
|----|---------|-------|
| CART-01 | Thêm vào giỏ hàng | Thêm laptop vào giỏ, kiểm tra nếu đã có thì tăng số lượng. |
| CART-02 | Xem giỏ hàng | Hiển thị danh sách sản phẩm, số lượng, giá từng mặt hàng và tổng tiền. |
| CART-03 | Cập nhật số lượng | Tăng/giảm số lượng từng sản phẩm trong giỏ. |
| CART-04 | Xóa sản phẩm | Xóa một hoặc toàn bộ sản phẩm khỏi giỏ. |

> Giỏ hàng v1 quản lý qua React state / localStorage phía client, không lưu DB.

---

### 2.4 Phân hệ Đặt hàng & Checkout (Customer)

| ID | Feature | Mô tả |
|----|---------|-------|
| ORDER-01 | Form Checkout | Nhập họ tên, số điện thoại, địa chỉ chi tiết. |
| ORDER-02 | Chọn địa chỉ giao hàng | Tích hợp `json-server` chứa dữ liệu địa giới hành chính Việt Nam. Chọn Tỉnh/TP → tải động Xã/Phường tương ứng. |
| ORDER-03 | Tổng hợp địa chỉ | Ghép `địa chỉ chi tiết + xã/phường + tỉnh/thành phố` thành chuỗi địa chỉ hoàn chỉnh trước khi lưu. |
| ORDER-04 | Đặt hàng COD | Tạo bản ghi `ORDER` và các `ORDER_ITEM`, trừ `stock` trong bảng `LAPTOP`, toàn bộ trong một **Database Transaction**. |
| ORDER-05 | Xem lịch sử đơn hàng | Customer xem danh sách đơn đã đặt, trạng thái hiện tại. |
| ORDER-06 | Xem chi tiết đơn hàng | Hiển thị danh sách sản phẩm, số lượng, giá, địa chỉ giao hàng. |

**TypeScript Interface:**
```typescript
interface IOrder {
  id: number;
  userId: number;
  orderDate: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  phone: string;
  address: string;
  items: IOrderItem[];
}

interface IOrderItem {
  id: number;
  orderId: number;
  laptopId: number;
  quantity: number;
  price: number;
}
```

---

### 2.5 Phân hệ Quản trị Admin

| ID | Feature | Mô tả |
|----|---------|-------|
| ADMIN-01 | Dashboard tổng quan | Hiển thị: tổng sản phẩm, thương hiệu, người dùng, đơn hàng, doanh thu. |
| ADMIN-02 | Biểu đồ thống kê | Biểu đồ trạng thái đơn hàng (Donut/Bar), xu hướng 7 ngày gần nhất (Line), top sản phẩm bán chạy. |
| ADMIN-03 | Quản lý sản phẩm | CRUD laptop: thêm, sửa, xóa; cập nhật giá, thông số, hình ảnh, tồn kho. |
| ADMIN-04 | Quản lý thương hiệu | CRUD thương hiệu (Brand): thêm, sửa, xóa. |
| ADMIN-05 | Quản lý đơn hàng | Xem danh sách tất cả đơn, lọc theo trạng thái, xem chi tiết, cập nhật trạng thái đơn hàng. |
| ADMIN-06 | Quản lý người dùng | Xem danh sách, lọc theo vai trò, đổi mật khẩu người dùng, xóa tài khoản. |

---

### 2.6 Tài liệu hóa API

| ID | Feature | Mô tả |
|----|---------|-------|
| API-01 | Swagger/OpenAPI | Toàn bộ endpoint được tài liệu hóa tại `/api-docs`. Bao gồm request schema, response schema, HTTP method và auth requirement. |

---

## 3. Out of Scope (Không làm ở v1)

Các tính năng sau **sẽ không** được triển khai trong v1. Bất kỳ yêu cầu nào nằm trong danh sách này đều cần được đưa vào backlog v2+ và không được tự ý implement.

| Nhóm | Feature loại trừ | Lý do |
|------|-----------------|-------|
| **Thanh toán** | Cổng thanh toán trực tuyến (VNPay, MoMo, Stripe) | Chỉ hỗ trợ COD ở v1 |
| **Thanh toán** | Hóa đơn điện tử / xuất VAT | Ngoài phạm vi MVP |
| **Tài khoản** | Đăng nhập mạng xã hội (Google, Facebook OAuth) | Chỉ hỗ trợ email/password |
| **Tài khoản** | Quên mật khẩu / Reset qua email | Cần tích hợp email service |
| **Sản phẩm** | Đánh giá & xếp hạng sản phẩm (Rating/Review) | Tính năng UGC phức tạp |
| **Sản phẩm** | So sánh sản phẩm | Scope riêng |
| **Sản phẩm** | Wishlist / Danh sách yêu thích | Scope v2 |
| **Giao hàng** | Tích hợp đơn vị vận chuyển (GHTK, GHN) | Phụ thuộc đối tác 3rd party |
| **Giao hàng** | Theo dõi đơn hàng realtime (tracking) | Cần webhook từ đơn vị vận chuyển |
| **Thông báo** | Push notification / Email notification | Cần email service (SendGrid,...) |
| **Khuyến mãi** | Mã giảm giá (Coupon/Voucher) | Scope v2 |
| **Khuyến mãi** | Flash sale / Giới hạn thời gian | Scope v2 |
| **Hạ tầng** | Distributed Database cho sản phẩm/đơn hàng | Chỉ áp dụng cho module quản lý nhân sự |
| **Admin** | Phân quyền Admin nhiều cấp (Super Admin, Staff) | v1 chỉ có 1 role Admin |
| **Mobile** | Ứng dụng di động (React Native / Flutter) | Chỉ có web app |

---

## 4. User Flow Chính

### 4.1 Flow: Khách vãng lai tìm kiếm sản phẩm

```
[Truy cập trang chủ]
        ↓
[Xem danh sách laptop — mặc định phân trang]
        ↓
[Áp dụng bộ lọc: Thương hiệu / Giá / CPU / RAM / GPU]
        ↓         ↓
   (Kết hợp)  (Tìm theo tên)
        ↓
[Xem danh sách kết quả được lọc/render lại]
        ↓
[Click vào sản phẩm → Xem chi tiết]
        ↓
[CTA: "Thêm vào giỏ" → Redirect đến trang Đăng nhập nếu chưa có tài khoản]
```

---

### 4.2 Flow: Đăng ký & Đăng nhập

```
[Guest click "Đăng ký"]
        ↓
[Nhập: Họ tên, Email, Mật khẩu]
        ↓
[POST /api/auth/register]
        ↓
[bcrypt hash mật khẩu → Lưu DB]
        ↓
[Tự động đăng nhập hoặc chuyển sang trang Login]
        ↓
[POST /api/auth/login → Nhận JWT]
        ↓
[Lưu token vào localStorage]
        ↓
[Redirect về trang trước hoặc trang chủ]
```

---

### 4.3 Flow: Đặt hàng (Checkout) — Customer

```
[Xem giỏ hàng → Click "Đặt hàng"]
        ↓
[Trang Checkout]
        ↓
[Nhập thông tin: Họ tên, SĐT, Địa chỉ chi tiết]
        ↓
[Chọn Tỉnh/TP → GET json-server /provinces]
        ↓
[Chọn Xã/Phường → GET json-server /wards?provinceId=...]
        ↓
[Ghép chuỗi địa chỉ: "{chi tiết}, {xã/phường}, {tỉnh/TP}"]
        ↓
[Confirm đặt hàng → POST /api/orders]
        ↓
[Backend mở Transaction]
     ├─→ Kiểm tra stock từng laptop
     ├─→ Tạo bản ghi ORDER
     ├─→ Tạo bản ghi ORDER_ITEM (từng sản phẩm)
     └─→ UPDATE LAPTOP SET stock = stock - quantity
        ↓
[Commit Transaction]
        ↓
[Hiển thị trang xác nhận đặt hàng thành công]
```

---

### 4.4 Flow: Admin quản lý đơn hàng

```
[Admin đăng nhập → Redirect Admin Dashboard]
        ↓
[Xem Dashboard: Tổng quan số liệu + Biểu đồ]
        ↓
[Vào mục "Quản lý Đơn hàng"]
        ↓
[Xem danh sách đơn — lọc theo trạng thái]
        ↓
[Click vào đơn hàng → Xem chi tiết]
        ↓
[Cập nhật trạng thái: pending → processing → shipped → delivered]
        ↓
[PUT /api/orders/:id → Lưu trạng thái mới vào DB]
```

---

### 4.5 Flow: Admin quản lý sản phẩm

```
[Admin vào "Quản lý Sản phẩm"]
        ↓
    ┌───┴───────────────┐
  Thêm mới           Sửa / Xóa
    ↓                   ↓
[Nhập form:        [Chọn laptop từ danh sách]
 tên, cpu, ram,         ↓
 storage, gpu,     [Cập nhật thông tin]
 giá, tồn kho,          ↓
 thương hiệu,      [PUT /api/laptops/:id]
 ảnh, mô tả]            ↓
    ↓              [Hoặc DELETE /api/laptops/:id]
[POST /api/laptops]
```

---

## 5. Tóm tắt API Endpoints (v1)

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| POST | `/api/auth/register` | Public | Đăng ký tài khoản |
| POST | `/api/auth/login` | Public | Đăng nhập, nhận JWT |
| GET | `/api/laptops` | Public | Danh sách laptop (filter + search + phân trang) |
| GET | `/api/laptops/:id` | Public | Chi tiết laptop |
| POST | `/api/laptops` | Admin | Thêm laptop mới |
| PUT | `/api/laptops/:id` | Admin | Sửa thông tin laptop |
| DELETE | `/api/laptops/:id` | Admin | Xóa laptop |
| GET | `/api/brands` | Public | Danh sách thương hiệu |
| POST | `/api/brands` | Admin | Thêm thương hiệu |
| PUT | `/api/brands/:id` | Admin | Sửa thương hiệu |
| DELETE | `/api/brands/:id` | Admin | Xóa thương hiệu |
| POST | `/api/orders` | Customer | Tạo đơn hàng mới |
| GET | `/api/orders` | Admin | Tất cả đơn hàng (lọc theo trạng thái + tìm kiếm keyword) |
| GET | `/api/orders/my` | Customer | Đơn hàng của user hiện tại |
| GET | `/api/orders/:id` | Customer/Admin | Chi tiết đơn hàng |
| PUT | `/api/orders/:id` | Admin | Cập nhật trạng thái đơn |
| GET | `/api/users` | Admin | Danh sách người dùng (tìm kiếm + lọc role) |
| GET | `/api/users/:id` | Admin | Chi tiết người dùng |
| PATCH | `/api/users/:id/password` | Admin | Đổi mật khẩu người dùng |

> Tài liệu đầy đủ xem tại `/api-docs` (Swagger UI).

---

## 6. Ràng buộc Kỹ thuật

| Ràng buộc | Quyết định |
|-----------|-----------|
| Ngôn ngữ Backend | TypeScript (đang migrate từ JS) |
| Ngôn ngữ Frontend | TypeScript + ReactJS (Vite) |
| Styling | Tailwind CSS |
| Database | MySQL với Foreign Key constraints |
| Toàn vẹn đơn hàng | **Bắt buộc dùng DB Transaction** khi tạo đơn + trừ stock |
| Xác thực | JWT — lưu `localStorage`, gửi qua `Authorization: Bearer` header |
| Tài liệu API | Swagger/OpenAPI — phải cập nhật song song khi thêm endpoint mới |
| Địa chỉ giao hàng | Dữ liệu địa giới từ `json-server` (chạy song song) |

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
| `status` | VARCHAR(50) | NOT NULL | Trạng thái: `PENDING` \| `PROCESSING` \| `SHIPPED` \| `DELIVERED` \| `CANCELLED` |
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


---

*Tài liệu này là nguồn sự thật duy nhất (single source of truth) cho scope v1. Mọi thay đổi scope phải được cập nhật tại đây trước khi implement.*