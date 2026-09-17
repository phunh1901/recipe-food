# Recipe Food

Ứng dụng chia sẻ công thức nấu ăn của đồ án IT3940, HUST. Frontend dùng React 19 + Vite; backend dùng Express 5; Supabase cung cấp Auth, PostgreSQL, Storage và Realtime.

## Chạy dự án

Yêu cầu Node.js **22.12 trở lên** và npm. Tại thư mục gốc:

```sh
npm --prefix backend ci
npm --prefix frontend ci
```

Sao chép `backend/.env.example` thành `backend/.env` và `frontend/.env.example` thành `frontend/.env`, rồi điền cấu hình Supabase. Chạy hai terminal:

```sh
npm run dev:backend
npm run dev:frontend
```

Backend: http://localhost:3000 — frontend: http://localhost:5173. Kiểm tra server bằng `GET /api/health`.

## Cấu hình

Backend cần `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPER_ADMIN_ID`, `FRONTEND_URL` và `PORT`. Chỉ backend được giữ service-role key.

Frontend cần `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` và `VITE_API_BASE_URL`. Các biến `VITE_*` được đóng gói công khai; không đặt service-role key ở frontend.

Trong Supabase Auth, cấu hình Site URL và cho phép redirect tới `<FRONTEND_URL>/update-password` để đặt lại mật khẩu. Tài khoản có ID bằng `SUPER_ADMIN_ID` phải có `role = 'admin'` trong bảng `users`; không dùng role `superadmin`.

Storage dùng hai bucket **recipes** và **avatar** (số ít), đường dẫn `<userId>/<filename>`. Ảnh hiện dùng public URL; quyền riêng tư của công thức bảo vệ nội dung API, không biến URL ảnh thành tài nguyên riêng tư.

## Quy tắc truy cập

- Công thức mới của thành viên là private. Chủ bài gửi yêu cầu công khai; admin duyệt trước khi bài xuất hiện công khai.
- Bài public chỉ hiển thị cho mọi người khi status là approved. Chủ bài và admin có thể xem bài private/chờ duyệt.
- Bình luận, lượt tương tác và yêu thích áp dụng cùng quyền xem công thức.
- Thành viên sửa bài đã public sẽ đưa bài về private/pending để duyệt lại.
- Chỉ super admin được thay đổi vai trò hoặc quản lý tài khoản admin khác. Không được khóa, xóa hoặc đổi quyền chính mình qua API quản trị; tài khoản super admin được bảo vệ.
- HTML công thức được lọc khi ghi và khi trả nội dung cho trang chi tiết/trang duyệt, kể cả dữ liệu cũ.
- Frontend dùng session Supabase để tự làm mới token; backend dùng client xác thực riêng cho từng request, tách biệt client quản trị.
- Sau khi nâng cấp từ phiên bản lưu token thủ công, người dùng cần đăng nhập lại một lần.

## API chính

Các đường dẫn dưới đây đã bao gồm tiền tố `/api`.

| Method | Endpoint | Quyền |
| --- | --- | --- |
| POST | /auth/register, /auth/login, /auth/forgot-password | Public |
| POST | /auth/logout | Đăng nhập |
| PATCH | /auth/make-admin/:id, /auth/demote-admin/:id | Super admin |
| PATCH | /auth/ban/:id, /auth/unban/:id | Admin, có kiểm tra tài khoản đích |
| GET | /recipes/all-recipes, /recipes/search, /recipes/category/:categoryId | Public, chỉ bài công khai đã duyệt |
| GET | /recipes/detail-recipe/:id | Public hoặc chủ bài/admin |
| POST | /recipes/create | Đăng nhập, multipart field image |
| PUT | /recipes/update/:id | Chủ bài/admin |
| DELETE | /recipes/delete/:id, /recipes/:id/image | Chủ bài/admin |
| GET | /recipes/my-recipes | Đăng nhập |
| PATCH | /recipes/request-public/:recipeId | Chủ bài |
| PUT | /recipes/bookmark/:recipeId | Đăng nhập, có quyền xem bài |
| GET | /recipes/favorite, /recipes/favorite/:targetUserId | Chính mình hoặc đang theo dõi người đích; lọc quyền xem từng bài |
| GET | /recipes/public-user/:userId | Public |
| GET | /recipes/admin/list-pending | Admin |
| PATCH | /recipes/admin/approve | Admin |
| GET | /user/myProfile | Đăng nhập |
| GET | /user/userProfile/:id, /user/search | Public |
| PUT | /user/update | Chính mình |
| PATCH | /user/change-password | Chính mình |
| DELETE | /user/avatar, /user/delete | Chính mình |
| GET | /user/admin/all, /user/admin/user/:id, /user/admin/stats | Admin |
| PUT | /user/admin/updateuser/:id | Admin, có kiểm tra thay đổi quyền/khóa |
| DELETE | /user/admin/delete/:id | Admin, có kiểm tra tài khoản đích |
| GET | /categories | Public |
| POST | /categories | Admin |
| PUT, DELETE | /categories/:id | Admin |
| GET, POST | /comments/:recipeId | Có quyền xem bài; POST cần đăng nhập |
| PUT, DELETE | /comments/:commentId | Chủ bình luận; admin được xóa |
| GET, POST | /reaction/:id | Có quyền xem bài; POST cần đăng nhập |
| POST | /follows/:followingId | Đăng nhập |
| GET | /follows/my-follower, /follows/my-following | Đăng nhập |
| GET | /follows/follower/:userId, /follows/following/:userId | Đăng nhập |
| GET, PUT, DELETE | /notifications | Chính mình |

Phân trang dùng `page` và `limit` (tối đa 100); kết quả gồm `totalItems`, `totalPages`, `currentPage`, `pageSize`. Ảnh upload tối đa 5 MB, JPEG/PNG/GIF/WebP, kiểm tra MIME và chữ ký tệp.

## Kiểm tra chất lượng

```sh
npm test
npm run lint
npm run build:frontend
# Hoặc chạy tất cả:
npm run check
```

Backend tests gọi Express qua HTTP với Supabase giả lập, không sửa dữ liệu thật. Frontend tests kiểm tra lấy token, refresh đồng thời, retry, hết phiên và escape nội dung. GitHub Actions chạy test, lint và build trên mỗi push/pull request.

## Cơ sở dữ liệu và triển khai

Repo hiện **chưa có schema/migration gốc của Supabase**. Không thể dựng một database mới chỉ bằng npm install. Xem [hướng dẫn database](backend/database/README.md) để xuất schema và kiểm tra cấu hình của project đang dùng.

Trước triển khai, xác minh RLS, quyền của anon/authenticated, khóa ngoại/cascade, policy Storage, publication Realtime cho notifications và URL redirect Auth trên Supabase thật. Kiểm thử giả lập không xác nhận những cấu hình này.

Build frontend tạo `frontend/dist`; hosting SPA cần fallback về `index.html`. Chạy backend bằng `npm --prefix backend start`, cấu hình biến môi trường của deployment và HTTPS.
