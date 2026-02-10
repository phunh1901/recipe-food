# 🍳 RECIPE FOOD - FOOD RECIPE SHARING PLATFORM

> **Nền tảng Mạng Xã Hội Chia Sẻ Công Thức Nấu Ăn & Kết Nối Đam Mê Ẩm Thực**  
> *Đồ án phát triển ứng dụng Full-stack môn học IT3940 - Đại học Bách Khoa Hà Nội (HUST)*

---

[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%207-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%204-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20Express%205-339933?logo=node.js&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Database%20%26%20Storage-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 📌 MỤC LỤC
- [1. Giới Thiệu](#1-giới-thiệu)
- [2. Cấu Trúc Repository](#2-cấu-trúc-repository)
- [3. Kiến Trúc Kỹ Thuật & Tech Stack](#3-kiến-trúc-kỹ-thuật--tech-stack)
- [4. Phân Hệ Tính Năng](#4-phân-hệ-tính-năng)
- [5. Danh Sách API Endpoints](#5-danh-sách-api-endpoints)
- [6. Hướng Dẫn Cài Đặt & Khởi Chạy](#6-hướng-dẫn-cài-đặt--khởi-chạy)
- [7. Cấu Hình Biến Môi Trường (.env)](#7-cấu-hình-biến-môi-trường-env)
- [8. Dữ Liệu Hình Ảnh & Mock Data](#8-dữ-liệu-hình-ảnh--mock-data)

---

## 1. GIỚI THIỆU

**Recipe Food** là một ứng dụng web Full-stack hiện đại, được thiết kế theo mô hình mạng xã hội thu nhỏ dành riêng cho cộng đồng yêu bếp và sành ăn. Dự án giải quyết trọn vẹn nhu cầu:
- Tìm kiếm, lọc và xem hướng dẫn chi tiết các món ăn theo nguyên liệu và cấp độ nấu.
- Đăng tải công thức cá nhân kèm hình ảnh từng bước chế biến và định lượng nguyên liệu.
- Tương tác mạng xã hội: Thả cảm xúc, bình luận trao đổi mẹo nấu ăn, theo dõi (Follow) các đầu bếp tài năng.
- Quy trình kiểm duyệt bài viết chuyên nghiệp từ quản trị viên (Admin) trước khi công thức được công khai rộng rãi.

---

## 2. CẤU TRÚC REPOSITORY

Dự án được tổ chức gọn gàng theo mô hình đa tầng (Client - Server - Assets):

```
Recipe Food/
├── .gitignore               # Tệp loại trừ tệp rác, node_modules và bảo vệ bí mật .env
├── README.md                # Tài liệu hướng dẫn sử dụng và triển khai dự án
│
├── backend/                 # API Server xây dựng bằng Node.js & Express 5
│   ├── .env.example         # Tệp mẫu cấu hình các biến môi trường backend
│   ├── package.json         # Danh sách thư viện phụ thuộc và scripts backend
│   ├── server.js            # Điểm khởi động ứng dụng Express (Entry point)
│   └── src/
│       ├── config/          # Khởi tạo Supabase Client & Multer Engine
│       ├── controller/      # Xử lý toàn bộ logic nghiệp vụ (Auth, Recipe, User,...)
│       ├── middlewares/     # Middleware xác thực JWT, phân trang, validate dữ liệu
│       └── routes/          # Khai báo các tuyến đường dẫn API RESTful
│
├── frontend/                # Single Page Application (SPA) xây dựng bằng React 19 + Vite
│   ├── .env.example         # Tệp mẫu cấu hình các biến môi trường frontend
│   ├── package.json         # Danh sách thư viện phụ thuộc và scripts frontend
│   ├── vite.config.js       # File cấu hình bundler Vite
│   ├── tailwind.config.js   # Cấu hình hệ thống màu & theme Tailwind CSS
│   ├── index.html           # Khung HTML gốc của ứng dụng
│   └── src/
│       ├── api/             # Cấu hình Axios Client & Supabase SDK
│       ├── components/      # Các thành phần UI dùng lại (Navbar, Footer, Modals,...)
│       ├── contexts/        # Quản lý trạng thái đăng nhập toàn cục (AuthContext)
│       └── pages/           # Giao diện các trang nghiệp vụ
│           ├── admin/       # Dashboard, duyệt công thức, quản lý danh mục & người dùng
│           └── user/        # Trang chủ, chi tiết món, đăng bài, tìm kiếm, trang cá nhân
│
└── recipes-image/           # Thư viện ảnh mẫu & dữ liệu kiểm thử
    ├── avatar/              # Ảnh đại diện mẫu
    ├── TỔNG HỢP MÓN ĂN.docx # Tài liệu danh sách món ăn & kịch bản kiểm thử bảo mật
    └── *.jpg                # Kho ảnh món ăn thực tế phong phú (Cơm gà, Cá chiên, Bít tết,...)
```

---

## 3. KIẾN TRÚC KỸ THUẬT & TECH STACK

```
+-------------------------------------------------------------+
|                      NGƯỜI DÙNG (CLIENT)                    |
|                Trình duyệt Web (Desktop / Mobile)           |
+-------------------------------------------------------------+
                               |
                               | (HTTPS / REST API)
                               v
+-------------------------------------------------------------+
|                 FRONTEND (React 19 + Vite)                  |
|  - React Router DOM v7 (Routing & Protected Routes)         |
|  - TanStack React Query v5 (Data Fetching, Caching)         |
|  - Tailwind CSS v4 (Giao diện chuẩn UI/UX)                  |
|  - Axios Client (Tự động đính kèm Token xác thực)           |
+-------------------------------------------------------------+
                               |
                               | (JSON / Multipart Data)
                               v
+-------------------------------------------------------------+
|               BACKEND API (Node.js + Express 5)             |
|  - JSON Web Token (JWT) & Bcrypt (Bảo mật & Mã hóa)         |
|  - Multer (Xử lý upload ảnh trực tiếp lên Cloud)            |
|  - DNS IPv4 optimization (Tránh timeout mạng Windows)       |
+-------------------------------------------------------------+
                               |
                               | (Supabase JS SDK)
                               v
+-------------------------------------------------------------+
|                   SUPABASE CLOUD PLATFORM                   |
|  - PostgreSQL Database: Quản trị quan hệ dữ liệu đa bảng    |
|  - Supabase Storage: Bucket lưu trữ hình ảnh món ăn, avatar |
+-------------------------------------------------------------+
```

### 🛠️ Chi tiết công nghệ:
- **Frontend:** React 19, Vite 7, Tailwind CSS 4, React Router DOM 7, TanStack Query 5, Axios, Lucide React, React Quill, React Hot Toast.
- **Backend:** Node.js, Express 5, Supabase JS Client, JWT, Bcrypt, Multer, UUID, Cors, Dotenv, Nodemon.
- **BaaS & Cơ sở dữ liệu:** Supabase (PostgreSQL, Storage Buckets).

---

## 4. PHÂN HỆ TÍNH NĂNG

### 1. Phân hệ Khách vãng lai (Guest)
- Xem bảng tin các món ăn mới nhất và thịnh hành trên trang chủ.
- Xem chi tiết từng món ăn: thời gian nấu, khẩu phần, định lượng nguyên liệu, các bước thực hiện có ảnh đi kèm.
- Tìm kiếm món ăn theo từ khóa, lọc theo danh mục (Món mặn, Canh, Đồ uống,...), độ khó và thời gian thực hiện.
- Đăng ký tài khoản thành viên mới và đăng nhập.

### 2. Phân hệ Thành viên (User / Foodie)
- **Đăng tải công thức:** Soạn thảo bài đăng với trình soạn thảo trực quan, thêm nhiều bước làm và tải nhiều hình ảnh minh họa.
- **Quản lý công thức cá nhân:** Theo dõi danh sách món ăn mình đã đăng kèm trạng thái (`Chờ duyệt`, `Đã duyệt`, `Bị từ chối`), chỉnh sửa hoặc xóa bài.
- **Tương tác xã hội:** Thả tim/thích món ăn, viết bình luận trao đổi kinh nghiệm dưới bài viết.
- **Mạng lưới đầu bếp (Social Connections):** Theo dõi (Follow) và hủy theo dõi người khác; xem danh sách người theo dõi.
- **Lưu trữ yêu thích:** Đánh dấu lưu các món ăn tâm đắc vào trang "Món ăn yêu thích".
- **Hồ sơ cá nhân & Thiết lập:** Cập nhật Bio, tải lên ảnh đại diện mới, đổi mật khẩu và xem thống kê hoạt động của bản thân.
- **Thông báo thời gian thực:** Nhận thông báo khi có người tương tác với công thức hoặc khi Admin phê duyệt bài viết.

### 3. Phân hệ Quản trị viên (Admin)
- **Bảng điều khiển (Dashboard):** Thống kê số lượng người dùng, tổng bài viết, danh mục và tỷ lệ duyệt bài.
- **Kiểm duyệt bài viết (Recipe Approval):** Duyệt các công thức hợp lệ lên trang chủ, hoặc từ chối bài viết kèm lý do cụ thể gửi về cho tác giả.
- **Quản lý danh mục (Category Management):** Thêm, sửa, kích hoạt/ẩn các danh mục món ăn.
- **Quản lý người dùng (User Management):** Quản lý danh sách thành viên, khóa/mở tài khoản, phân quyền vai trò.

---

## 5. DANH SÁCH API ENDPOINTS

Hệ thống cung cấp bộ RESTful API đầy đủ tại tiền tố `/api`:

| Phân hệ | Phương thức | Endpoint | Chức năng | Phân quyền |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Đăng ký tài khoản mới | Public |
| | `POST` | `/api/auth/login` | Đăng nhập hệ thống | Public |
| | `POST` | `/api/auth/forgot-password` | Gửi email đặt lại mật khẩu | Public |
| **Recipes** | `GET` | `/api/recipes` | Lấy danh sách món ăn (có lọc & phân trang) | Public |
| | `GET` | `/api/recipes/:id` | Lấy thông tin chi tiết một công thức | Public |
| | `POST` | `/api/recipes` | Đăng tải công thức mới (kèm ảnh) | User |
| | `PUT` | `/api/recipes/:id` | Chỉnh sửa công thức cá nhân | User (Owner) |
| | `DELETE` | `/api/recipes/:id` | Xóa công thức | User (Owner) / Admin |
| | `PATCH` | `/api/recipes/:id/status` | Duyệt / Từ chối bài viết | Admin |
| **User** | `GET` | `/api/user/profile` | Xem thông tin tài khoản hiện tại | User |
| | `PUT` | `/api/user/profile` | Cập nhật hồ sơ & ảnh đại diện | User |
| | `PUT` | `/api/user/change-password` | Đổi mật khẩu | User |
| | `GET` | `/api/user/all` | Quản lý danh sách người dùng | Admin |
| **Categories** | `GET` | `/api/categories` | Lấy danh sách danh mục ẩm thực | Public |
| | `POST` | `/api/categories` | Thêm mới danh mục | Admin |
| | `PUT` | `/api/categories/:id` | Cập nhật danh mục | Admin |
| **Social** | `POST` | `/api/reaction/:recipeId` | Thả tim / Bỏ thả tim món ăn | User |
| | `POST` | `/api/comments/:recipeId` | Gửi bình luận món ăn | User |
| | `POST` | `/api/follows/:userId` | Theo dõi / Hủy theo dõi người dùng | User |
| | `GET` | `/api/notifications` | Lấy danh sách thông báo người dùng | User |

---

## 6. HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY

### 📋 Yêu cầu tiên quyết
- Cài đặt **Node.js** `>= 18.x` (Khuyến nghị phiên bản 20+ LTS).
- Cài đặt **npm** `>= 9.x` hoặc **pnpm / yarn**.
- Một tài khoản **Supabase** đang hoạt động.

---

### Bước 1: Khởi động Backend API Server

```bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Tạo file cấu hình biến môi trường từ mẫu
cp .env.example .env
# Điền thông tin Supabase của bạn vào .env

# 4. Chạy Backend Server ở chế độ phát triển
npm run dev
```
> Server sẽ khởi chạy tại: `http://localhost:3000`

---

### Bước 2: Khởi động Frontend Client

Mở thêm một cửa sổ Terminal mới:

```bash
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Tạo file cấu hình biến môi trường từ mẫu
cp .env.example .env
# Kiểm tra VITE_API_BASE_URL trỏ về http://localhost:3000/api

# 4. Chạy giao diện Web
npm run dev
```
> Trình duyệt sẽ mở ứng dụng tại: `http://localhost:5173`

---

## 7. CẤU HÌNH BIẾN MÔI TRƯỜNG (.ENV)

### 📁 Backend: `backend/.env`
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_super_secret_jwt_key
PORT=3000
SUPER_ADMIN_ID=your_super_admin_uuid
```

### 📁 Frontend: `frontend/.env`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 8. DỮ LIỆU HÌNH ẢNH & MOCK DATA

Thư mục [`recipes-image/`](./recipes-image/) chứa sẵn bộ tài nguyên phong phú phục vụ quá trình chạy thử nghiệm và kiểm thử:
- **Hình ảnh món ăn:** Đầy đủ các món ăn Việt Nam & Quốc tế (Bánh mì trứng, Bít tết sốt tiêu đen, Canh bí đỏ, Cơm gà Hải Nam, Trà đào cam sả,...).
- **Hình ảnh Avatar:** Thư mục [`recipes-image/avatar/`](./recipes-image/avatar/).
- **Tài liệu kiểm thử:** File [`recipes-image/TỔNG HỢP MÓN ĂN.docx`](./recipes-image/T%E1%BB%95NG%20H%E1%BB%A2P%20M%C3%93N%20%C4%82N.docx) tổng hợp toàn bộ công thức và các ca kiểm thử bảo mật (XSS, dữ liệu biên).

---

<p align="center">
  <i>Đồ án IT3940 - Dự án Công nghệ thông tin | Đại học Bách Khoa Hà Nội (HUST).</i>
</p>