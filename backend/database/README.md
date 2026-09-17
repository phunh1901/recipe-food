# Schema Supabase

Repo sử dụng các bảng `users`, `recipes`, `categories`, `favorites`, `recipes_reaction`, `recipe_comments`, `follows` và `notifications`. Schema thực tế, trigger và RLS hiện không được lưu trong repo.

Không tạo migration dựa trên suy đoán tên cột: cần xuất schema từ project Supabase đang sử dụng. Với Supabase CLI đã đăng nhập và liên kết đúng project, có thể xuất schema public:

```sh
supabase db dump --schema public -f backend/database/schema.sql
```

Kiểm tra bản dump trước khi commit, không đưa dữ liệu người dùng hoặc credentials vào repository. Ghi thêm policy Storage, bucket `avatar`/`recipes`, cấu hình Auth và publication Realtime vì dump schema public không bao gồm toàn bộ các cấu hình đó.

Các kiểm tra bắt buộc khi đưa baseline vào version control:

- Role trong users chỉ gồm user/admin; SUPER_ADMIN_ID trỏ đến một tài khoản admin có thật.
- Client trình duyệt không được tự sửa role/is_banned hay đọc công thức private qua REST Supabase.
- Banned users không được ghi dữ liệu qua đường truy cập trực tiếp Supabase.
- Notifications chỉ được đọc bởi receiver_id tương ứng; Realtime phải áp dụng RLS.
- Ràng buộc favorite/reaction/follow không cho trùng cặp khóa; kiểm tra khóa ngoại và cascade khi xóa user/recipe.
- Ảnh đang được phục vụ bằng public URL. Nếu cần bảo vệ cả ảnh của bài private, phải đổi thiết kế sang bucket private và signed URL.

Test trong backend/tests dùng dữ liệu giả lập, không thay thế kiểm thử tích hợp với schema thật.
